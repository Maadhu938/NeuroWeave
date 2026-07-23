from datetime import datetime, timedelta
from typing import List, Dict, Any

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth import get_current_user
from app.models.models import KnowledgeNode, ReviewLog, UploadRecord

router = APIRouter()


def _s(value: Any) -> float:
    return float(value or 0.0)

def _i(value: Any) -> int:
    return int(value or 0)


@router.get("/api/notifications")
async def get_notifications(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Return real notifications derived from the user's actual knowledge graph and review activity."""
    uid = user["uid"]
    now = datetime.utcnow()

    nodes = (await db.execute(select(KnowledgeNode).where(KnowledgeNode.user_id == uid))).scalars().all()
    notifications: List[Dict] = []

    if not nodes:
        notifications.append({
            "id": "welcome",
            "title": "Welcome to Neuroweave",
            "description": "Upload your first document to start building your knowledge graph.",
            "time": "now",
            "priority": "info",
        })
        return {"notifications": notifications}

    weak_critical = [n for n in nodes if _s(n.strength) < 0.3]
    if weak_critical:
        labels = ", ".join(str(n.label) for n in weak_critical[:3])
        notifications.append({
            "id": "weak-concepts",
            "title": "Critical review needed",
            "description": f"{len(weak_critical)} concept(s) critically weak: {labels}. Review them before they fade.",
            "time": "now",
            "priority": "critical",
        })

    overdue = [n for n in nodes if n.last_reviewed is None or (now - n.last_reviewed).total_seconds() > 7 * 86400]
    if overdue:
        notifications.append({
            "id": "overdue",
            "title": "Overdue reviews",
            "description": f"{len(overdue)} concept(s) haven't been reviewed in over 7 days.",
            "time": "today",
            "priority": "high",
        })

    strong_nodes = [n for n in nodes if _s(n.strength) >= 0.8 and _i(n.review_count) > 0]
    if strong_nodes:
        notifications.append({
            "id": "strengths",
            "title": "Concepts mastered",
            "description": f"{len(strong_nodes)} concept(s) have reached 80%+ strength. Great work!",
            "time": "today",
            "priority": "success",
        })

    recent_uploads = (await db.execute(
        select(UploadRecord).where(
            UploadRecord.user_id == uid,
            UploadRecord.created_at >= now - timedelta(hours=24),
        )
    )).scalars().all()
    if recent_uploads:
        names = ", ".join(str(r.filename or "text input") for r in recent_uploads[:3])
        notifications.append({
            "id": "uploads",
            "title": "Recent uploads processed",
            "description": f"{len(recent_uploads)} upload(s) in the last 24h: {names}",
            "time": "recent",
            "priority": "info",
        })

    streak = await _compute_streak(db, uid)
    if streak >= 3:
        notifications.append({
            "id": "streak",
            "title": "Study streak maintained",
            "description": f"You've reviewed concepts for {streak} consecutive days. Keep it up!",
            "time": "today",
            "priority": "success",
        })

    priority_order = {"critical": 0, "high": 1, "success": 2, "info": 3}
    notifications.sort(key=lambda n: priority_order.get(n["priority"], 4))

    return {"notifications": notifications}


async def _compute_streak(db: AsyncSession, user_id: str) -> int:
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
    streak = 0
    expected = today
    for d in review_dates:
        review_day = d if not hasattr(d, 'date') else d.date()
        if review_day == expected:
            streak += 1
            expected -= timedelta(days=1)
        elif review_day == expected - timedelta(days=1):
            expected = review_day
            streak += 1
            expected -= timedelta(days=1)
        else:
            break
    return streak
