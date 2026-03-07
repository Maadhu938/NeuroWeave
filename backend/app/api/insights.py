from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth import get_current_user
from app.services.insights import get_insights_data

router = APIRouter()


@router.get("/api/insights")
async def insights(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await get_insights_data(db, user["uid"])
