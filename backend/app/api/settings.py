from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth import get_current_user
from app.models.models import KnowledgeNode, KnowledgeEdge, ReviewLog, UploadRecord, UserSettings

router = APIRouter()

class PreferencesPayload(BaseModel):
    dailyReminders: bool = True
    autoStudyPlans: bool = True
    smartConnections: bool = True
    studyDuration: str = "30 minutes"
    decayAlerts: bool = True
    aiInsights: bool = True
    weeklyReport: bool = False


@router.get("/api/user/settings")
async def get_user_settings(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = user["uid"]
    row = (
        await db.execute(select(UserSettings).where(UserSettings.user_id == uid))
    ).scalar_one_or_none()
    return row.preferences if row else {}


@router.put("/api/user/settings")
async def update_user_settings(payload: PreferencesPayload, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = user["uid"]
    existing = (
        await db.execute(select(UserSettings).where(UserSettings.user_id == uid))
    ).scalar_one_or_none()
    if existing:
        existing.preferences = payload.model_dump()
    else:
        db.add(UserSettings(user_id=uid, preferences=payload.model_dump()))
    await db.commit()
    return {"status": "saved"}


@router.delete("/api/user/data")
async def clear_user_data(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Delete all knowledge nodes, edges, reviews, and upload records for the current user."""
    uid = user["uid"]
    await db.execute(delete(ReviewLog).where(ReviewLog.user_id == uid))
    await db.execute(delete(KnowledgeEdge).where(KnowledgeEdge.user_id == uid))
    await db.execute(delete(KnowledgeNode).where(KnowledgeNode.user_id == uid))
    await db.execute(delete(UploadRecord).where(UploadRecord.user_id == uid))
    await db.execute(delete(UserSettings).where(UserSettings.user_id == uid))
    await db.commit()
    return {"status": "cleared"}
