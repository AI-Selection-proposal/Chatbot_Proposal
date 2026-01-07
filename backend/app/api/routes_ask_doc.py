from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pathlib import Path
from typing import AsyncIterator

from backend.app.core.config import settings
from backend.app.models.schemas import AskDocRequest
from backend.app.services.chroma_store import ChromaStore
from backend.app.services.embeddings import EmbeddingModel
from backend.app.services.vllm_client import VLLMClient
from backend.app.services.rag import retrieve_context, pick_page_images, build_multimodal_messages
from backend.app.utils.sse import sse_wrap_text_stream

router = APIRouter()

def _to_static_url(req: Request, local_path: str) -> str:
    # Convert /abs/path/to/.../data/extracted/images/<doc_id>/<file>.png
    # to http://host:8080/static/images/<doc_id>/<file>.png
    p = Path(local_path)
    # Expect it to be under EXTRACT_DIR/images
    try:
        rel = p.relative_to(settings.extract_dir / "images")
    except Exception:
        return local_path  # fallback
    base = str(req.base_url).rstrip("/")
    return f"{base}/static/images/{rel.as_posix()}"

@router.post("/ask/pdf")
async def ask_pdf(req: Request, payload: AskDocRequest):
    chroma = ChromaStore(str(settings.chroma_persist_dir))
    embedder = EmbeddingModel(settings.embed_model)

    top_k = payload.top_k or settings.top_k
    context, items = retrieve_context(chroma, embedder, payload.doc_id, payload.question, top_k=top_k)

    image_paths: list[str] = []
    if payload.use_images:
        local_images = pick_page_images(items, max_images=settings.attach_images_max)
        image_paths = [_to_static_url(req, p) for p in local_images]

    messages = build_multimodal_messages(payload.question, context, image_paths)

    client = VLLMClient(
        base_url=settings.vllm_base_url,
        api_key=settings.vllm_api_key,
        model=settings.chat_vlm_model,
        timeout_s=180.0,
    )

    async def token_stream() -> AsyncIterator[str]:
        async for t in client.stream_chat_completions(messages):
            yield t

    return StreamingResponse(
        sse_wrap_text_stream(token_stream()),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
