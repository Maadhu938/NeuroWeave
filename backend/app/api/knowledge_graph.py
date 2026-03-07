from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete as sql_delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth import get_current_user
from app.models.models import KnowledgeNode, KnowledgeEdge, ReviewLog
from app.services.graph import get_graph_data

router = APIRouter()


@router.get("/api/knowledge-graph")
async def knowledge_graph(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await get_graph_data(db, user["uid"])


@router.delete("/api/knowledge-graph/node/{label}")
async def delete_node(label: str, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Delete a single knowledge node and its edges/reviews by label."""
    node = (await db.execute(
        select(KnowledgeNode).where(
            KnowledgeNode.label == label,
            KnowledgeNode.user_id == user["uid"],
        )
    )).scalar_one_or_none()

    if not node:
        raise HTTPException(404, "Node not found")

    # Delete edges and reviews referencing this node
    await db.execute(sql_delete(KnowledgeEdge).where(
        (KnowledgeEdge.source_id == node.id) | (KnowledgeEdge.target_id == node.id)
    ))
    await db.execute(sql_delete(ReviewLog).where(ReviewLog.node_id == node.id))
    await db.delete(node)
    await db.commit()

    return {"success": True, "deleted": label}
