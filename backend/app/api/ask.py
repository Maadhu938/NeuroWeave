from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth import get_current_user
from app.services.retrieval import search_similar
from app.services.llm import ask_brain_llm

router = APIRouter()


class AskRequest(BaseModel):
    question: str


@router.post("/api/ask")
async def ask_brain(body: AskRequest, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not body.question.strip():
        return {"answer": "Please ask a question.", "relatedConcepts": [], "knowledgeNodes": []}

    # Vector + keyword search for relevant context
    results = await search_similar(db, body.question, user["uid"], top_k=10)

    # Build rich context: include concept label as a header for each chunk
    context_chunks = []
    for node, sim in results:
        if node.content:
            context_chunks.append(f"[Concept: {node.label}]\n{node.content}")
    # Preserve relevance order (highest similarity first), deduplicate
    seen = set()
    related_concepts = []
    for node, _ in results:
        if node.label not in seen:
            seen.add(node.label)
            related_concepts.append(node.label)
    knowledge_nodes = [str(node.id) for node, _ in results]

    answer = await ask_brain_llm(body.question, context_chunks, related_concepts)

    return {
        "answer": answer,
        "relatedConcepts": related_concepts,
        "knowledgeNodes": knowledge_nodes,
    }
