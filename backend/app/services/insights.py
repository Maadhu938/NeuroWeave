"""Insight engine — aggregates knowledge graph data into frontend-ready insights."""

from typing import List, Dict
from datetime import datetime, timezone

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import KnowledgeNode, KnowledgeEdge, ReviewLog
from app.services.llm import generate_insights_llm
from app.services.nama import refresh_all_strengths


async def get_dashboard_data(db: AsyncSession, user_id: str) -> Dict:
    """Build full DashboardData object matching the frontend contract."""
    await refresh_all_strengths(db, user_id)
    nodes = (await db.execute(select(KnowledgeNode).where(KnowledgeNode.user_id == user_id))).scalars().all()

    if not nodes:
        return _empty_dashboard()

    # Metrics
    avg_strength = sum(n.strength or 0.0 for n in nodes) / len(nodes)
    mastered = sum(1 for n in nodes if (n.strength or 0) >= 0.8)
    total_reviews = sum(n.review_count for n in nodes)
    streak = await _compute_streak(db, user_id)

    # Retention data (last 7 synthetic points based on avg strength)
    retention_data = _build_retention_curve(avg_strength)

    # Knowledge strength by category (re-infer stale "general" categories)
    from app.services.ingestion import _infer_category
    cat_map: Dict[str, List[float]] = {}
    for n in nodes:
        cat = n.category
        if cat in (None, "general", ""):
            new_cat = _infer_category(n.label)
            if new_cat != "General":
                n.category = new_cat
                cat = new_cat
            else:
                cat = "General"
        cat_map.setdefault(cat, []).append(n.strength or 0.0)
    knowledge_strength = [
        {"subject": cat, "score": round(sum(s) / len(s) * 100)}
        for cat, s in cat_map.items()
    ]

    # Weak areas — only nodes below 70% strength
    sorted_nodes = sorted(nodes, key=lambda n: n.strength or 0.0)
    weak_nodes = [n for n in sorted_nodes if (n.strength or 0) < 0.7][:10]
    if not weak_nodes:
        weak_nodes = sorted_nodes[:3]  # always show at least a few
    weak_areas = []
    for n in weak_nodes:
        s = round((n.strength or 0.0) * 100)
        label = "Critical" if s < 30 else "Urgent" if s < 60 else "Review"
        weak_areas.append({"topic": n.label, "strength": s, "review": label})

    # Upcoming reviews with real timing based on last_reviewed
    upcoming = []
    for n in weak_nodes[:5]:
        upcoming.append({
            "concept": n.label,
            "time": _review_timing(n.last_reviewed),
            "priority": _priority(n.strength),
        })

    # AI-generated insight
    node_summary = "; ".join(f"{n.label} ({n.strength:.0%})" for n in nodes[:20])
    ai_insights = await generate_insights_llm(node_summary)
    ai_insight_text = ai_insights[0]["description"] if ai_insights else "Upload knowledge to get started."

    return {
        "metrics": {
            "knowledgeScore": round(avg_strength * 100),
            "retentionRate": round(avg_strength * 100),
            "conceptsMastered": mastered,
            "studyStreakDays": streak,
        },
        "retentionData": retention_data,
        "knowledgeStrength": knowledge_strength,
        "weakAreas": weak_areas,
        "upcomingReviews": upcoming,
        "aiInsight": ai_insight_text,
    }


async def get_insights_data(db: AsyncSession, user_id: str) -> Dict:
    """Build InsightsData matching the frontend contract."""
    await refresh_all_strengths(db, user_id)
    nodes = (await db.execute(select(KnowledgeNode).where(KnowledgeNode.user_id == user_id))).scalars().all()

    if not nodes:
        return {"insights": [], "knowledgeCoverage": [], "learningPatterns": [], "subjectRetention": []}

    # AI-generated insights
    node_summary = "; ".join(f"{n.label} (strength={n.strength:.0%}, reviews={n.review_count})" for n in nodes[:20])
    insights = await generate_insights_llm(node_summary)

    # Knowledge coverage by category (re-infer stale "general" categories)
    from app.services.ingestion import _infer_category
    cat_map: Dict[str, List[float]] = {}
    for n in nodes:
        cat = n.category
        if cat in (None, "general", ""):
            new_cat = _infer_category(n.label)
            if new_cat != "General":
                n.category = new_cat
                cat = new_cat
            else:
                cat = "General"
        cat_map.setdefault(cat, []).append(n.strength or 0.0)
    knowledge_coverage = [
        {"subject": cat, "score": round(sum(s) / len(s) * 100)}
        for cat, s in cat_map.items()
    ]

    # Learning patterns from real review timestamps
    learning_patterns = await _learning_patterns_from_logs(db, user_id)

    # Subject retention with colors
    colors = ["#6C63FF", "#FF6584", "#36D399", "#FBBD23", "#3ABFF8", "#F87272"]
    subject_retention = [
        {"subject": cat, "retention": round(sum(s) / len(s) * 100), "color": colors[i % len(colors)]}
        for i, (cat, s) in enumerate(cat_map.items())
    ]

    return {
        "insights": insights,
        "knowledgeCoverage": knowledge_coverage,
        "learningPatterns": learning_patterns,
        "subjectRetention": subject_retention,
    }


async def get_topbar_metrics(db: AsyncSession, user_id: str) -> Dict:
    """Build TopBarMetrics matching the frontend contract."""
    nodes = (await db.execute(select(KnowledgeNode).where(KnowledgeNode.user_id == user_id))).scalars().all()
    if not nodes:
        return {"knowledgeScore": "0%", "retentionRate": "0%", "studyStreak": "0 days"}

    avg = sum(n.strength or 0.0 for n in nodes) / len(nodes)
    streak = await _compute_streak(db, user_id)
    return {
        "knowledgeScore": f"{round(avg * 100)}%",
        "retentionRate": f"{round(avg * 100)}%",
        "studyStreak": f"{streak} days",
    }


async def get_ai_insight_cards(db: AsyncSession, user_id: str) -> List[Dict]:
    """Build AIInsight[] matching the frontend contract."""
    nodes = (await db.execute(select(KnowledgeNode).where(KnowledgeNode.user_id == user_id))).scalars().all()
    if not nodes:
        return [{"title": "Get Started", "description": "Upload your first document to begin building your knowledge graph.", "type": "info"}]

    node_summary = "; ".join(f"{n.label} ({n.strength:.0%})" for n in nodes[:20])
    return await generate_insights_llm(node_summary)


def _empty_dashboard() -> Dict:
    return {
        "metrics": {"knowledgeScore": 0, "retentionRate": 0, "conceptsMastered": 0, "studyStreakDays": 0},
        "retentionData": _build_retention_curve(0),
        "knowledgeStrength": [],
        "weakAreas": [],
        "upcomingReviews": [],
        "aiInsight": "Upload your first document to get started with Neuroweave!",
    }


def _build_retention_curve(avg_strength: float) -> List[Dict]:
    """Generate a 7-day retention curve."""
    import math
    base = avg_strength * 100
    return [
        {"date": f"Day {i + 1}", "retention": round(max(0, base - 5 * math.log(i + 1)))}
        for i in range(7)
    ]


def _priority(strength: float | None) -> str:
    s = strength or 0.0
    if s < 0.25:
        return "critical"
    if s < 0.45:
        return "high"
    if s < 0.65:
        return "medium"
    return "low"


def _review_timing(last_reviewed: datetime | None) -> str:
    """Human-readable time until next review based on spaced repetition."""
    if last_reviewed is None:
        return "Now"
    now = datetime.utcnow()
    if last_reviewed.tzinfo is None:
        last_reviewed = last_reviewed.replace(tzinfo=timezone.utc)
    days_since = (now - last_reviewed).total_seconds() / 86400
    if days_since < 1:
        return "Today"
    elif days_since < 2:
        return "Tomorrow"
    elif days_since < 4:
        return f"In {int(4 - days_since)} days"
    elif days_since < 8:
        return "This week"
    else:
        return "Overdue"


async def _learning_patterns_from_logs(db: AsyncSession, user_id: str) -> list:
    """Time-of-day effectiveness from actual ReviewLog data."""
    result = await db.execute(
        select(
            func.extract('hour', ReviewLog.reviewed_at).label('hr'),
            func.avg(ReviewLog.score).label('avg_score'),
            func.count().label('cnt'),
        )
        .where(ReviewLog.user_id == user_id)
        .group_by(func.extract('hour', ReviewLog.reviewed_at))
    )
    rows = result.all()
    # Build hour → effectiveness map
    hour_map = {}
    for row in rows:
        hr = int(row[0]) if row[0] is not None else 12
        avg_score = float(row[1]) if row[1] is not None else 0.5
        hour_map[hr] = round(avg_score * 100)

    time_slots = [
        ("8 AM", 8), ("10 AM", 10), ("12 PM", 12),
        ("2 PM", 14), ("4 PM", 16), ("6 PM", 18), ("8 PM", 20),
    ]
    patterns = []
    for label, hr in time_slots:
        # Check nearby hours too (hr-1, hr, hr+1)
        scores = [hour_map[h] for h in (hr - 1, hr, hr + 1) if h in hour_map]
        eff = round(sum(scores) / len(scores)) if scores else 50
        patterns.append({"time": label, "effectiveness": eff})
    return patterns


async def _compute_streak(db: AsyncSession, user_id: str) -> int:
    """Count consecutive days (up to today) that the user did at least one review."""
    from datetime import timedelta
    result = await db.execute(
        select(func.date(ReviewLog.reviewed_at).label("d"))
        .where(ReviewLog.user_id == user_id)
        .group_by(func.date(ReviewLog.reviewed_at))
        .order_by(func.date(ReviewLog.reviewed_at).desc())
    )
    review_dates = [row[0] for row in result.all()]
    if not review_dates:
        return 0

    today = datetime.utcnow().date()
    # Allow starting from today or yesterday
    streak = 0
    expected = today
    for d in review_dates:
        # d could be a date or datetime
        review_day = d if not hasattr(d, 'date') else d.date()
        if review_day == expected:
            streak += 1
            expected -= timedelta(days=1)
        elif review_day == expected - timedelta(days=1):
            # Skipped today but reviewed yesterday — still valid streak start
            expected = review_day
            streak += 1
            expected -= timedelta(days=1)
        else:
            break
    return streak
