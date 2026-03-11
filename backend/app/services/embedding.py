"""Embedding service backed by Hugging Face Inference API."""

from typing import List

import httpx
import numpy as np

from app.config import settings


HF_ENDPOINT = (
    "https://api-inference.huggingface.co/pipeline/feature-extraction/"
    "sentence-transformers/all-MiniLM-L6-v2"
)


async def _fetch_embeddings(texts: List[str]) -> List[List[float]]:
    """Call Hugging Face feature-extraction endpoint for one or more texts."""
    if not settings.hf_api_key:
        raise RuntimeError("HF_API_KEY is not configured.")

    headers = {
        "Authorization": f"Bearer {settings.hf_api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(HF_ENDPOINT, headers=headers, json={"inputs": texts})
        resp.raise_for_status()
        data = resp.json()

    # HF returns:
    # - single text: [dim]
    # - batch: [[dim], [dim], ...]
    if isinstance(data[0], (float, int)):
        vectors = [data]
    else:
        vectors = data

    # L2-normalise each vector
    normalised: List[List[float]] = []
    for vec in vectors:
        arr = np.asarray(vec, dtype=float)
        norm = float(np.linalg.norm(arr))
        if norm > 0.0:
            arr = arr / norm
        normalised.append(arr.tolist())
    return normalised


async def embed_batch(texts: List[str]) -> List[List[float]]:
    """Return L2-normalised embeddings for a list of texts."""
    if not texts:
        return []
    return await _fetch_embeddings(texts)


async def embed_single(text: str) -> List[float]:
    """Return L2-normalised embedding for a single text."""
    vectors = await _fetch_embeddings([text])
    return vectors[0]


def cosine_similarity(a: List[float], b: List[float]) -> float:
    a_arr, b_arr = np.array(a), np.array(b)
    return float(np.dot(a_arr, b_arr) / (np.linalg.norm(a_arr) * np.linalg.norm(b_arr) + 1e-9))
