from fastapi import APIRouter, Depends
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth import get_current_user
from app.models.models import KnowledgeNode, KnowledgeEdge, ReviewLog, UploadRecord

router = APIRouter()


@router.delete("/api/user/data")
async def clear_user_data(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Delete all knowledge nodes, edges, reviews, and upload records for the current user."""
    uid = user["uid"]
    await db.execute(delete(ReviewLog).where(ReviewLog.user_id == uid))
    await db.execute(delete(KnowledgeEdge).where(KnowledgeEdge.user_id == uid))
    await db.execute(delete(KnowledgeNode).where(KnowledgeNode.user_id == uid))
    await db.execute(delete(UploadRecord).where(UploadRecord.user_id == uid))
    await db.commit()
    return {"status": "cleared"}
