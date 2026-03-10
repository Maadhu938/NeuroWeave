"""Review / Quiz API — generate quiz questions for a concept and record review results."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.database import get_db
from app.auth import get_current_user
from app.models.models import KnowledgeNode, ReviewLog
from app.services.llm import generate_quiz_llm
from app.services.nama import compute_strength

router = APIRouter()


class GenerateQuizRequest(BaseModel):
    concept: str
    count: int = 5


class SubmitAnswerRequest(BaseModel):
    concept: str
    score: float = Field(..., ge=0.0, le=1.0)  # constrained to 0-1


@router.post("/api/review/quiz")
async def generate_quiz(
    body: GenerateQuizRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate quiz questions for a concept using the user's knowledge content."""
    node = (await db.execute(
        select(KnowledgeNode).where(
            KnowledgeNode.label == body.concept,
            KnowledgeNode.user_id == user["uid"],
        )
    )).scalar_one_or_none()

    if not node:
        return {"questions": [], "concept": body.concept, "strength": 0}

    num_questions = max(1, min(body.count, 15))  # clamp between 1 and 15
    questions = await generate_quiz_llm(node.label, node.content, count=num_questions)
    return {
        "questions": questions,
        "concept": node.label,
        "strength": round((node.strength or 0.0) * 100),
    }


@router.post("/api/review/submit")
async def submit_review(
    body: SubmitAnswerRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Record a review result — update quiz score, review count, and NAMA strength."""
    node = (await db.execute(
        select(KnowledgeNode).where(
            KnowledgeNode.label == body.concept,
            KnowledgeNode.user_id == user["uid"],
        )
    )).scalar_one_or_none()

    if not node:
        return {"success": False, "message": "Concept not found"}

    # Update node stats
    node.review_count += 1
    # Weighted running average for quiz score
    old_score = node.quiz_score or 0.0
    node.quiz_score = round(old_score * 0.7 + body.score * 0.3, 3)
    node.last_reviewed = datetime.utcnow()

    # Log the review
    log = ReviewLog(
        user_id=user["uid"],
        node_id=node.id,
        score=body.score,
    )
    db.add(log)

    # Recompute NAMA strength
    node.strength = await compute_strength(db, node)
    await db.commit()

    return {
        "success": True,
        "newStrength": round(node.strength * 100),
        "reviewCount": node.review_count,
        "quizScore": round(node.quiz_score * 100),
    }
