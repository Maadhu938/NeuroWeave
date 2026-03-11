"""PDF and text ingestion → chunking → concept extraction → graph building."""

import re
from typing import List, Tuple

import fitz  # PyMuPDF
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import KnowledgeNode, KnowledgeEdge, UploadRecord
from app.services.embedding import embed_batch, cosine_similarity
from app.services.llm import extract_concepts_llm


def extract_text_from_pdf(file_bytes: bytes) -> str:
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        pages = [page.get_text() for page in doc]
    return "\n".join(pages)


def extract_text_from_docx(file_bytes: bytes) -> str:
    import io
    from docx import Document
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join(p.text for p in doc.paragraphs)


def chunk_text(text: str, max_tokens: int = 500, overlap: int = 50) -> List[str]:
    """Split text into overlapping word-level chunks."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i : i + max_tokens])
        if chunk.strip():
            chunks.append(chunk.strip())
        i += max_tokens - overlap
    return chunks if chunks else [text.strip()]


async def ingest_text(
    db: AsyncSession,
    text: str,
    filename: str | None = None,
    user_id: str | None = None,
) -> Tuple[List[str], int]:
    """Full ingestion pipeline: chunk → extract concepts → embed → store nodes + edges.
    Returns (concept_labels, relationship_count).
    """
    # 1. Hard cap text size to keep memory bounded on small dynos
    if len(text) > 120_000:
        text = text[:120_000]

    # 2. Chunk input
    chunks = chunk_text(text)

    # 3. Extract concepts via LLM
    concept_labels = await extract_concepts_llm(text[:6000])  # first ~6k chars for extraction
    if not concept_labels:
        # Fallback: treat each chunk title as a concept
        concept_labels = _fallback_concepts(chunks)

    # 4. Build a small description for each concept from the source text
    concept_snippets = _match_concepts_to_chunks(concept_labels, chunks)

    # 5. Embed concept snippets in small batches to reduce memory spikes
    all_texts = [f"{label}: {snippet}" for label, snippet in concept_snippets]
    embeddings = []
    batch_size = 4
    for i in range(0, len(all_texts), batch_size):
        batch = all_texts[i : i + batch_size]
        batch_vectors = await embed_batch(batch)
        embeddings.extend(batch_vectors)

    # 5. Upsert nodes
    created_nodes: List[KnowledgeNode] = []
    for (label, snippet), emb in zip(concept_snippets, embeddings):
        # Check for existing node with same label for this user
        query = select(KnowledgeNode).where(KnowledgeNode.label == label)
        if user_id:
            query = query.where(KnowledgeNode.user_id == user_id)
        existing = (await db.execute(query)).scalar_one_or_none()
        if existing:
            existing.content = snippet
            existing.embedding = emb
            created_nodes.append(existing)
        else:
            node = KnowledgeNode(label=label, content=snippet, embedding=emb, category=_infer_category(label), user_id=user_id)
            db.add(node)
            created_nodes.append(node)
    await db.flush()

    # 6. Build edges between related concepts (cosine sim > 0.35)
    edge_count = 0
    for i, node_a in enumerate(created_nodes):
        for j, node_b in enumerate(created_nodes):
            if j <= i:
                continue
            sim = cosine_similarity(embeddings[i], embeddings[j])
            if sim > 0.35:
                edge = KnowledgeEdge(source_id=node_a.id, target_id=node_b.id, weight=round(sim, 3), user_id=user_id)
                db.add(edge)
                edge_count += 1

    # 7. Record upload
    db.add(UploadRecord(
        filename=filename,
        source_type="file" if filename else "text",
        concepts_extracted=len(created_nodes),
        relationships_found=edge_count,
        user_id=user_id,
    ))

    await db.commit()
    return [n.label for n in created_nodes], edge_count


def _fallback_concepts(chunks: List[str]) -> List[str]:
    """Extract crude concept labels from chunks when LLM is unavailable."""
    labels = []
    for ch in chunks[:20]:
        words = ch.split()[:5]
        label = " ".join(words).strip(".,;:!?")
        if label:
            labels.append(label)
    return labels[:15]


def _match_concepts_to_chunks(labels: List[str], chunks: List[str]) -> List[Tuple[str, str]]:
    """Gather ALL relevant chunks for each concept — not just one."""
    results = []
    for label in labels:
        label_lower = label.lower()
        label_words = set(label_lower.split())

        # Score every chunk for relevance to this concept
        scored_chunks: List[Tuple[int, str]] = []
        for chunk in chunks:
            chunk_lower = chunk.lower()
            if label_lower in chunk_lower:
                score = 10
            else:
                score = sum(1 for w in label_words if w in chunk_lower)
            if score > 0:
                scored_chunks.append((score, chunk))

        # Sort by score descending and collect the top matches
        scored_chunks.sort(key=lambda x: x[0], reverse=True)

        if scored_chunks:
            # Concatenate all relevant chunks up to ~4000 chars
            parts = []
            total_len = 0
            for _score, chunk in scored_chunks:
                if total_len + len(chunk) > 4000:
                    remaining = 4000 - total_len
                    if remaining > 200:
                        parts.append(chunk[:remaining])
                    break
                parts.append(chunk)
                total_len += len(chunk)
            snippet = "\n\n".join(parts)
        else:
            # No match found — use the first chunk as fallback
            snippet = chunks[0][:2000] if chunks else label

        results.append((label, snippet))
    return results


def _infer_category(label: str) -> str:
    """Rule-based category inference with broader keyword matching."""
    label_lower = label.lower()

    categories = {
        "Science": ["physics", "chemistry", "biology", "quantum", "atom", "cell",
                    "molecule", "gene", "dna", "electron", "force", "energy",
                    "photon", "wave", "thermodynamics", "entropy", "reaction",
                    "organism", "evolution", "ecology", "neuroscience"],
        "Mathematics": ["math", "algebra", "calculus", "geometry", "equation",
                        "theorem", "integral", "derivative", "matrix", "vector",
                        "probability", "statistics", "linear", "trigonometry",
                        "logarithm", "polynomial", "graph theory"],
        "Computer Science": ["algorithm", "data structure", "programming", "code",
                             "software", "computer", "network", "api", "java",
                             "python", "javascript", "react", "database", "sql",
                             "oop", "object oriented", "class", "inheritance",
                             "polymorphism", "encapsulation", "abstraction",
                             "function", "variable", "loop", "array", "linked list",
                             "tree", "sorting", "searching", "hash", "stack",
                             "queue", "compiler", "operating system", "thread",
                             "memory management", "pointer", "interface",
                             "html", "css", "web", "frontend", "backend",
                             "machine learning", "deep learning", "neural network",
                             "ai", "artificial intelligence", "tensorflow",
                             "pytorch", "model", "training", "classification"],
        "History": ["history", "war", "civilization", "empire", "revolution",
                    "ancient", "medieval", "colonial", "independence", "dynasty"],
        "Literature": ["literature", "poetry", "novel", "author", "narrative",
                       "fiction", "drama", "shakespeare", "genre"],
        "Business": ["business", "marketing", "economics", "finance", "management",
                     "accounting", "investment", "strategy", "entrepreneurship"],
        "Psychology": ["psychology", "cognition", "behavior", "perception",
                       "memory", "learning theory", "motivation", "emotion"],
        "Languages": ["grammar", "vocabulary", "syntax", "language", "linguistics",
                      "english", "spanish", "french", "german", "hindi"],
    }

    for cat, keywords in categories.items():
        for kw in keywords:
            if kw in label_lower:
                return cat
    return "General"
