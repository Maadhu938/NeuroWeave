"""Sentence-Transformer embedding service (singleton)."""

from functools import lru_cache
from typing import List

import numpy as np
from sentence_transformers import SentenceTransformer

from app.config import settings


@lru_cache(maxsize=1)
def _get_model() -> SentenceTransformer:
    return SentenceTransformer(settings.embedding_model)


def embed_texts(texts: List[str]) -> List[List[float]]:
    """Return L2-normalised embeddings for a list of texts."""
    model = _get_model()
    vectors = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    return vectors.tolist()


def embed_single(text: str) -> List[float]:
    return embed_texts([text])[0]


def cosine_similarity(a: List[float], b: List[float]) -> float:
    a_arr, b_arr = np.array(a), np.array(b)
    return float(np.dot(a_arr, b_arr) / (np.linalg.norm(a_arr) * np.linalg.norm(b_arr) + 1e-9))
