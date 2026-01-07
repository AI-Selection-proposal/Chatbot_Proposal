from __future__ import annotations

from typing import Any, Dict, List, Tuple
from pathlib import Path

from backend.app.core.config import settings
from backend.app.services.chroma_store import ChromaStore
from backend.app.services.embeddings import EmbeddingModel

def _truncate(s: str, max_chars: int) -> str:
    s = s or ""
    return s if len(s) <= max_chars else s[:max_chars] + "\n...[truncated]..."

def retrieve_context(
    chroma: ChromaStore,
    embedder: EmbeddingModel,
    doc_id: str,
    question: str,
    top_k: int,
) -> Tuple[str, List[Dict[str, Any]]]:
    q_emb = embedder.embed([question])[0]
    res = chroma.query(
        query_embedding=q_emb,
        top_k=top_k,
        where={"doc_id": doc_id},
    )

    docs = (res.get("documents") or [[]])[0]
    metas = (res.get("metadatas") or [[]])[0]
    ids = (res.get("ids") or [[]])[0]
    dists = (res.get("distances") or [[]])[0]

    items: List[Dict[str, Any]] = []
    context_parts: List[str] = []

    for i, (doc, meta) in enumerate(zip(docs, metas)):
        page = meta.get("page", "?")
        ctype = meta.get("type", "text")
        context_parts.append(f"[Page {page} | {ctype}]\n{doc}\n")
        items.append({
            "id": ids[i] if i < len(ids) else None,
            "page": page,
            "type": ctype,
            "distance": dists[i] if i < len(dists) else None,
            "page_image": meta.get("page_image"),
        })

    context = _truncate("\n".join(context_parts), settings.max_context_chars)
    return context, items

def pick_page_images(items: List[Dict[str, Any]], max_images: int) -> List[str]:
    # pick unique page images from top chunks
    seen = set()
    images: List[str] = []
    for it in items:
        p = it.get("page_image")
        if not p:
            continue
        if p in seen:
            continue
        if Path(p).exists():
            images.append(p)
            seen.add(p)
        if len(images) >= max_images:
            break
    return images

def build_multimodal_messages(question: str, context: str, image_paths: List[str]) -> List[Dict[str, Any]]:
    """
    vLLM OpenAI-compatible messages.
    We pass retrieved context as text plus optional images.
    """
    user_content: List[Dict[str, Any]] = []
    user_content.append({"type": "text", "text": f"Question:\n{question}"})
    if context.strip():
        user_content.append({"type": "text", "text": f"Relevant excerpts from the PDF:\n{context}"})
    for p in image_paths:
        # For local file paths, the simplest prototype approach is to serve them via backend static route.
        # We'll use /static/... URL in the route layer.
        user_content.append({"type": "image_url", "image_url": {"url": p}})

    return [
        {
            "role": "system",
            "content": (
                "You are a helpful assistant that answers questions about a PDF document. "
                "Use the provided excerpts and any provided page images. "
                "If you are unsure, say what information is missing."
            ),
        },
        {
            "role": "user",
            "content": user_content,
        },
    ]
