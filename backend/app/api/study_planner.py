from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth import get_current_user
from app.services.planner import get_study_plan_data

router = APIRouter()


@router.get("/api/study-plan")
async def study_plan(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await get_study_plan_data(db, user["uid"])
