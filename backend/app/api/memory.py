from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth import get_current_user
from app.services.graph import get_heatmap_data
from app.services.nama import decay_curve

router = APIRouter()


@router.get("/api/memory/heatmap")
async def memory_heatmap(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await get_heatmap_data(db, user["uid"])


@router.get("/api/memory/decay")
async def memory_decay(concept: str = Query(...), user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await decay_curve(db, concept, user["uid"])
