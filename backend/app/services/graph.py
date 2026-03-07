"""Knowledge graph construction and traversal."""

import math
import random
from typing import List, Dict

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import KnowledgeNode, KnowledgeEdge


async def get_graph_data(db: AsyncSession, user_id: str) -> Dict:
    """Return all nodes with position hints for the Brain Map."""
    nodes = (await db.execute(select(KnowledgeNode).where(KnowledgeNode.user_id == user_id))).scalars().all()
    edges = (await db.execute(select(KnowledgeEdge).where(KnowledgeEdge.user_id == user_id))).scalars().all()

    # Build adjacency map
    adj: Dict[str, List[str]] = {}
    for edge in edges:
        sid, tid = str(edge.source_id), str(edge.target_id)
        adj.setdefault(sid, []).append(tid)
        adj.setdefault(tid, []).append(sid)

    # Assign positions using a simple force-directed seed
    result_nodes = []
    for i, node in enumerate(nodes):
        nid = str(node.id)
        angle = (i / max(len(nodes), 1)) * 6.2832
        radius = 200 + (i % 3) * 80
        result_nodes.append({
            "id": nid,
            "label": node.label,
            "x": round(400 + radius * math.cos(angle)),
            "y": round(300 + radius * math.sin(angle)),
            "strength": round((node.strength or 0.0) * 100),
            "connections": adj.get(nid, []),
            "category": node.category,
        })
    return {"nodes": result_nodes}


async def get_heatmap_data(db: AsyncSession, user_id: str) -> List[Dict]:
    """Return topic-level strength summary for the memory heatmap."""
    nodes = (await db.execute(select(KnowledgeNode).where(KnowledgeNode.user_id == user_id))).scalars().all()
    result = []
    for n in nodes:
        s = round((n.strength or 0.0) * 100)
        if s >= 85:
            cat = "strong"
        elif s >= 70:
            cat = "moderate"
        elif s >= 60:
            cat = "weak"
        else:
            cat = "critical"
        result.append({"topic": n.label, "strength": s, "category": cat})
    return result


async def get_node_by_label(db: AsyncSession, label: str, user_id: str) -> KnowledgeNode | None:
    return (await db.execute(
        select(KnowledgeNode).where(
            KnowledgeNode.label == label,
            KnowledgeNode.user_id == user_id,
        )
    )).scalar_one_or_none()
