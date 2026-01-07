from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Optional, List, Literal


class UploadResponse(BaseModel):
    doc_id: str
    filename: str
    pages: int
    chunks_upserted: int


class AskDocRequest(BaseModel):
    doc_id: str
    question: str
    use_images: bool = True
    top_k: int | None = None


class ChatRequest(BaseModel):
    # plain chat (no RAG)
    message: str
    system: Optional[str] = None


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
