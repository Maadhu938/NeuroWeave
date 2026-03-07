from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth import get_current_user
from app.services.insights import get_dashboard_data

router = APIRouter()


@router.get("/api/dashboard")
async def dashboard(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await get_dashboard_data(db, user["uid"])
