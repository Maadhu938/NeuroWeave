"""Study planner — adaptive scheduling based on NAMA strength scores."""

from datetime import datetime, timezone, timedelta
from typing import Dict, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import KnowledgeNode, ReviewLog
from app.services.nama import refresh_all_strengths


async def get_study_plan_data(db: AsyncSession, user_id: str) -> Dict:
    """Build StudyPlanData matching the frontend contract."""
    # Refresh NAMA strengths so the plan uses up-to-date scores
    await refresh_all_strengths(db, user_id)

    nodes = (await db.execute(select(KnowledgeNode).where(KnowledgeNode.user_id == user_id))).scalars().all()

    if not nodes:
        return _empty_plan()

    # ── Real review data ────────────────────────────────────
    now = datetime.utcnow()
    week_start = now - timedelta(days=now.weekday())  # Monday 00:00
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None)

    # Reviews done this week grouped by weekday (0=Mon … 6=Sun)
    week_logs = (await db.execute(
        select(ReviewLog).where(
            ReviewLog.user_id == user_id,
            ReviewLog.reviewed_at >= week_start,
        )
    )).scalars().all()

    reviews_by_day: Dict[int, int] = {}
    for log in week_logs:
        ts = log.reviewed_at
        day_idx = ts.weekday()  # 0=Mon
        reviews_by_day[day_idx] = reviews_by_day.get(day_idx, 0) + 1

    # Reviews done today
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_logs = [l for l in week_logs if l.reviewed_at >= today_start]

    # All-time review stats
    total_reviews_all = sum(n.review_count for n in nodes)
    reviewed_nodes = [n for n in nodes if n.review_count > 0]
    reviewed_concepts = set(n.label for n in reviewed_nodes)

    # Nodes that are genuinely mastered: reviewed at least once AND strength >= 0.8
    mastered = sum(1 for n in nodes if n.review_count > 0 and (n.strength or 0) >= 0.8)

    # ── Sort by strength ascending → weakest first ──────────
    sorted_nodes = sorted(nodes, key=lambda n: n.strength or 0.0)
    # Only consider genuinely weak concepts (below retention threshold)
    WEAK_THRESHOLD = 0.7
    weak_nodes = [n for n in sorted_nodes if (n.strength or 0.0) < WEAK_THRESHOLD]

    # Recommendations — only concepts not yet reviewed today
    today_reviewed_ids = set()
    for log in today_logs:
        today_reviewed_ids.add(log.node_id)

    recommendations = []
    for n in weak_nodes[:8] or sorted_nodes[:4]:
        s = n.strength or 0.0
        priority = "critical" if s < 0.25 else "high" if s < 0.45 else "medium" if s < 0.65 else "low"
        time = "15 min" if s < 0.3 else "10 min" if s < 0.6 else "5 min"
        recommendations.append({
            "concept": n.label,
            "time": time,
            "priority": priority,
            "strength": round(s * 100),
        })

    # ── Week schedule ───────────────────────────────────────
    total_recs = len(recommendations)
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    week_schedule = []
    for i, day in enumerate(days):
        planned = max(1, total_recs // 7 + (1 if i < total_recs % 7 else 0))
        done = reviews_by_day.get(i, 0)
        # Estimate time: weaker concepts need more time
        avg_strength = sum(n.strength or 0 for n in sorted_nodes[:planned]) / max(planned, 1)
        est_minutes = planned * (15 if avg_strength < 0.3 else 10 if avg_strength < 0.6 else 5)
        week_schedule.append({
            "day": day,
            "sessions": planned,
            "completed": min(done, planned),
            "total": est_minutes,
        })

    # ── Milestones (based on real review activity) ──────────
    milestones = []

    # 1. Master 10 concepts — must be reviewed + high strength
    milestones.append({
        "title": "Master 10 concepts",
        "progress": min(100, mastered * 10),
        "dueDate": "This week",
    })

    # 2. Complete today's reviews
    today_target = max(1, len(recommendations))
    today_done = len(today_logs)
    milestones.append({
        "title": f"Complete today's reviews ({today_done}/{today_target})",
        "progress": min(100, round(today_done / today_target * 100)),
        "dueDate": "Today",
    })

    # 3. Review all topics at least once
    total_topics = len(nodes)
    reviewed_count = len(reviewed_nodes)
    milestones.append({
        "title": f"Review all {total_topics} topics",
        "progress": round(reviewed_count / total_topics * 100) if total_topics > 0 else 0,
        "dueDate": "This week",
    })

    # ── Stats ───────────────────────────────────────────────
    avg_quiz = 0
    if reviewed_nodes:
        avg_quiz = round(sum(n.quiz_score or 0 for n in reviewed_nodes) / len(reviewed_nodes) * 100)

    weekly_reviews = sum(reviews_by_day.values())
    stats = {
        "totalReviews": weekly_reviews,
        "completed": len(today_logs),
        "timeSpent": f"{weekly_reviews * 5} min",
        "avgScore": avg_quiz,
    }

    return {
        "recommendations": recommendations,
        "weekSchedule": week_schedule,
        "milestones": milestones,
        "stats": stats,
    }


def _empty_plan() -> Dict:
    return {
        "recommendations": [],
        "weekSchedule": [
            {"day": d, "sessions": 0, "completed": 0, "total": 0}
            for d in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        ],
        "milestones": [
            {"title": "Upload your first document", "progress": 0, "dueDate": "Today"}
        ],
        "stats": {"totalReviews": 0, "completed": 0, "timeSpent": "0 min", "avgScore": 0},
    }
