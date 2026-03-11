"""Vector similarity search + keyword fallback using pgvector."""

from typing import List, Tuple

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import KnowledgeNode
from app.services.embedding import embed_single


async def search_similar(db: AsyncSession, query: str, user_id: str, top_k: int = 8) -> List[Tuple[KnowledgeNode, float]]:
    """Find the top_k most relevant knowledge nodes combining vector similarity and keyword match."""
    query_vec = await embed_single(query)
    vec_literal = "[" + ",".join(str(v) for v in query_vec) + "]"

    # 1. Vector similarity search
    vector_sql = text("""
        SELECT id, label, category, content, strength, review_count, quiz_score,
               last_reviewed, created_at,
               1 - (embedding <=> cast(:vec as vector)) AS similarity
        FROM knowledge_nodes
        WHERE embedding IS NOT NULL AND user_id = :uid
        ORDER BY embedding <=> cast(:vec as vector)
        LIMIT :k
    """)
    vector_rows = (await db.execute(vector_sql, {"vec": vec_literal, "k": top_k, "uid": user_id})).fetchall()

    # 2. Keyword search — find nodes whose label or content contains query words
    query_words = [w for w in query.lower().split() if len(w) > 2]
    keyword_rows = []
    if query_words:
        # Build ILIKE conditions for each significant word
        like_pattern = "%".join(query_words[:5])  # up to 5 words
        keyword_sql = text("""
            SELECT id, label, category, content, strength, review_count, quiz_score,
                   last_reviewed, created_at,
                   0.5 AS similarity
            FROM knowledge_nodes
            WHERE user_id = :uid
              AND (LOWER(label) LIKE :pattern OR LOWER(content) LIKE :pattern)
            LIMIT :k
        """)
        keyword_rows = (await db.execute(keyword_sql, {
            "uid": user_id,
            "pattern": f"%{like_pattern}%",
            "k": top_k,
        })).fetchall()

    # 3. Merge results — vector results first, then keyword matches (deduped)
    seen_ids = set()
    nodes_with_score = []

    for row in vector_rows:
        if row.id not in seen_ids:
            seen_ids.add(row.id)
            nodes_with_score.append((_row_to_node(row), float(row.similarity)))

    for row in keyword_rows:
        if row.id not in seen_ids:
            seen_ids.add(row.id)
            nodes_with_score.append((_row_to_node(row), 0.5))

    return nodes_with_score[:top_k]


def _row_to_node(row) -> KnowledgeNode:
    return KnowledgeNode(
        id=row.id, label=row.label, category=row.category,
        content=row.content, strength=row.strength,
        review_count=row.review_count, quiz_score=row.quiz_score,
        last_reviewed=row.last_reviewed, created_at=row.created_at,
    )
