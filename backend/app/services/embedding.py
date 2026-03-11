"""Embedding service backed by Hugging Face Inference API."""

from typing import List

import httpx
import numpy as np

from app.config import settings


HF_ENDPOINT = (
    "https://router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5"
)


async def _fetch_embeddings(texts: List[str]) -> List[List[float]]:
    """Call Hugging Face feature-extraction endpoint for one or more texts."""
    if not settings.hf_api_key:
        raise RuntimeError("HF_API_KEY is not configured.")

    headers = {
        "Authorization": f"Bearer {settings.hf_api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "inputs": texts,
        "options": {"wait_for_model": True}
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(HF_ENDPOINT, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()

    # Handle HuggingFace response shapes safely
    if isinstance(data[0], (float, int)):
        vectors = [data]

    elif isinstance(data[0][0], (float, int)):
        vectors = data

    else:
        # sometimes HF returns [[[...]]]
        vectors = [item[0] for item in data]

    # L2 normalisation (important for cosine similarity search)
    normalised: List[List[float]] = []

    for vec in vectors:
        arr = np.asarray(vec, dtype=float)
        norm = float(np.linalg.norm(arr))

        if norm > 0:
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
    """Compute cosine similarity between two embeddings."""
    a_arr = np.array(a)
    b_arr = np.array(b)

    return float(
        np.dot(a_arr, b_arr)
        / (np.linalg.norm(a_arr) * np.linalg.norm(b_arr) + 1e-9)
    )