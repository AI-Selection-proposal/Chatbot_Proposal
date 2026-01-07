from __future__ import annotations

from sentence_transformers import SentenceTransformer
from typing import List
import numpy as np

class EmbeddingModel:
    def __init__(self, model_name: str):
        self.model = SentenceTransformer(model_name)

    def embed(self, texts: List[str]) -> List[List[float]]:
        vecs = self.model.encode(
            texts,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        if isinstance(vecs, np.ndarray):
            return vecs.astype("float32").tolist()
        return [v.astype("float32").tolist() for v in vecs]
