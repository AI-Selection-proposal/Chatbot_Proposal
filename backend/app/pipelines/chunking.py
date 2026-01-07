from __future__ import annotations

from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass
class Chunk:
    chunk_id: str
    text: str
    metadata: Dict[str, Any]

def simple_chunk_text(text: str, max_chars: int = 1200, overlap: int = 150) -> List[str]:
    text = (text or "").strip()
    if not text:
        return []
    chunks: List[str] = []
    start = 0
    while start < len(text):
        end = min(len(text), start + max_chars)
        chunks.append(text[start:end])
        if end == len(text):
            break
        start = max(0, end - overlap)
    return chunks
