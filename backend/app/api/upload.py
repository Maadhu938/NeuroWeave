from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth import get_current_user
from app.models.models import UploadRecord
from app.services.ingestion import ingest_text, extract_text_from_pdf, extract_text_from_docx

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".doc", ".docx"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
MAX_TEXT_LENGTH = 500_000  # 500K chars


class TextUploadRequest(BaseModel):
    text: str


@router.post("/api/upload")
async def upload_file(file: UploadFile = File(...), user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Validate extension
    filename = file.filename or "untitled"
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    # Read and validate size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large. Max 20 MB.")

    # Extract text
    if ext == ".pdf":
        text = extract_text_from_pdf(content)
    elif ext in (".doc", ".docx"):
        text = extract_text_from_docx(content)
    else:
        text = content.decode("utf-8", errors="replace")

    if not text.strip():
        raise HTTPException(400, "Could not extract text from file.")

    concepts, relationships = await ingest_text(db, text, filename=filename, user_id=user["uid"])
    return {"concepts": concepts, "relationshipsFound": relationships}


@router.post("/api/upload/text")
async def upload_text(body: TextUploadRequest, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not body.text.strip():
        raise HTTPException(400, "Text cannot be empty.")
    if len(body.text.strip()) < 50:
        raise HTTPException(400, "Text is too short. Please provide at least 50 characters of meaningful content.")
    if len(body.text) > MAX_TEXT_LENGTH:
        raise HTTPException(400, f"Text too long. Maximum {MAX_TEXT_LENGTH:,} characters.")

    concepts, relationships = await ingest_text(db, body.text, user_id=user["uid"])
    return {"concepts": concepts, "relationshipsFound": relationships}


@router.get("/api/uploads/recent")
async def get_recent_uploads(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(UploadRecord)
        .where(UploadRecord.user_id == user["uid"])
        .order_by(UploadRecord.created_at.desc())
        .limit(20)
    )
    records = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "filename": r.filename,
            "sourceType": r.source_type,
            "conceptsExtracted": r.concepts_extracted,
            "relationshipsFound": r.relationships_found,
            "createdAt": r.created_at.isoformat() if r.created_at else None,
        }
        for r in records
    ]
