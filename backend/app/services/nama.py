"""NAMA — Neuroweave Adaptive Memory Algorithm.

MemoryStrength = w1 * review_count
               + w2 * quiz_score
               + w3 * graph_reinforcement       (Σ neighbor_strength × edge_weight)
               − w4 * time_decay                (log(days_since_review + 1))

All weights are tuneable; strength is clamped to [0, 1].
"""

import math
from datetime import datetime, timezone
from typing import List, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import KnowledgeNode, KnowledgeEdge

# Default NAMA weights
W1_REVIEW = 0.10   # review count contribution (diminishing)
W2_QUIZ = 0.30     # quiz score contribution
W3_GRAPH = 0.25    # neighbour reinforcement
W4_DECAY = 0.20    # time decay penalty


def _clamp(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, value))


async def compute_strength(db: AsyncSession, node: KnowledgeNode) -> float:
    """Compute NAMA strength for a single node."""
    # Nodes that have never been reviewed have 0% strength
    if node.review_count == 0:
        return 0.0

    # Base strength for reviewed nodes
    base = 0.5

    # Review factor (diminishing returns via sqrt)
    review_factor = W1_REVIEW * min(math.sqrt(node.review_count), 5.0) / 5.0

    # Quiz factor
    quiz_factor = W2_QUIZ * (node.quiz_score or 0.0)

    # Graph reinforcement
    graph_factor = await _graph_reinforcement(db, node)

    # Time decay
    decay_factor = _time_decay(node.last_reviewed)

    strength = base + review_factor + quiz_factor + graph_factor - decay_factor
    return round(_clamp(strength), 3)


async def _graph_reinforcement(db: AsyncSession, node: KnowledgeNode) -> float:
    """Sum of (neighbour_strength × edge_weight) for all connected nodes."""
    edges_out = (await db.execute(
        select(KnowledgeEdge).where(KnowledgeEdge.source_id == node.id)
    )).scalars().all()
    edges_in = (await db.execute(
        select(KnowledgeEdge).where(KnowledgeEdge.target_id == node.id)
    )).scalars().all()

    neighbour_ids = [(e.target_id, e.weight) for e in edges_out] + \
                    [(e.source_id, e.weight) for e in edges_in]

    if not neighbour_ids:
        return 0.0

    total = 0.0
    for nid, weight in neighbour_ids:
        neighbour = (await db.execute(
            select(KnowledgeNode).where(KnowledgeNode.id == nid)
        )).scalar_one_or_none()
        if neighbour:
            total += (neighbour.strength or 0.0) * weight

    # Normalise so the maximum contribution equals W3_GRAPH
    return W3_GRAPH * _clamp(total / max(len(neighbour_ids), 1))


def _time_decay(last_reviewed: datetime | None) -> float:
    """Logarithmic decay penalty based on days since last review."""
    if last_reviewed is None:
        return W4_DECAY * 0.5  # moderate penalty for never-reviewed
    now = datetime.utcnow()
    # last_reviewed from DB is naive. Ensure both are naive.
    if last_reviewed.tzinfo is not None:
        last_reviewed = last_reviewed.replace(tzinfo=None)
    
    days = (now - last_reviewed).total_seconds() / 86400
    return W4_DECAY * _clamp(math.log(days + 1) / 5.0)


async def refresh_all_strengths(db: AsyncSession, user_id: str | None = None) -> None:
    """Recompute strength for every node in the database."""
    query = select(KnowledgeNode)
    if user_id:
        query = query.where(KnowledgeNode.user_id == user_id)
    nodes = (await db.execute(query)).scalars().all()
    for node in nodes:
        node.strength = await compute_strength(db, node)
    await db.commit()


async def decay_curve(db: AsyncSession, concept: str, user_id: str) -> List[dict]:
    """Return a projected 30-day decay curve for a concept."""
    node = (await db.execute(
        select(KnowledgeNode).where(KnowledgeNode.label == concept, KnowledgeNode.user_id == user_id)
    )).scalar_one_or_none()

    base_strength = node.strength if node else 0.5
    review_days = {0, 1, 3, 7, 14}  # simulated optimal review points

    points = []
    for day in range(31):
        reviewed = day in review_days
        decay = math.log(day + 1) / 5.0
        strength = _clamp(base_strength - (W4_DECAY * decay) + (0.15 if reviewed else 0.0))
        points.append({"day": day, "strength": round(strength, 3), "reviewed": reviewed})
    return points
