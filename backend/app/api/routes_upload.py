from __future__ import annotations

from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil

from backend.app.core.config import settings
from backend.app.models.schemas import UploadResponse
from backend.app.services.chroma_store import ChromaStore
from backend.app.services.embeddings import EmbeddingModel
from backend.app.pipelines.ingest import ingest_pdf

router = APIRouter()

@router.post("/upload/pdf", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    dst = settings.upload_dir / file.filename
    dst.parent.mkdir(parents=True, exist_ok=True)

    with dst.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    chroma = ChromaStore(str(settings.chroma_persist_dir))
    embedder = EmbeddingModel(settings.embed_model)

    doc_id, pages, chunks_upserted = ingest_pdf(dst, chroma, embedder)

    return UploadResponse(
        doc_id=doc_id,
        filename=file.filename,
        pages=pages,
        chunks_upserted=chunks_upserted,
    )
