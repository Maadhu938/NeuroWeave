from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth import get_current_user
from app.services.insights import get_topbar_metrics, get_ai_insight_cards

router = APIRouter()


@router.get("/api/metrics/topbar")
async def topbar_metrics(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await get_topbar_metrics(db, user["uid"])


@router.get("/api/ai/insights")
async def ai_insights(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await get_ai_insight_cards(db, user["uid"])
