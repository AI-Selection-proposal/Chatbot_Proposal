from __future__ import annotations

from pathlib import Path
from typing import Tuple, List
import uuid

from backend.app.core.config import settings
from backend.app.pipelines.pdf_parse import parse_pdf_to_text_and_page_images
from backend.app.pipelines.chunking import simple_chunk_text, Chunk
from backend.app.services.embeddings import EmbeddingModel
from backend.app.services.chroma_store import ChromaStore

def ingest_pdf(
    pdf_path: Path,
    chroma: ChromaStore,
    embedder: EmbeddingModel,
) -> Tuple[str, int, int]:
    """
    Returns: (doc_id, pages, chunks_upserted)
    """
    doc_id = uuid.uuid4().hex[:12]

    images_dir = settings.extract_dir / "images" / doc_id
    parsed = parse_pdf_to_text_and_page_images(
        pdf_path=pdf_path,
        out_images_dir=images_dir,
        dpi=settings.render_dpi,
        doc_id=doc_id,
    )

    chunks: List[Chunk] = []
    for art in parsed.artifacts:
        page_no = art.page_index + 1
        for j, ct in enumerate(simple_chunk_text(art.text, max_chars=1200, overlap=150)):
            chunk_id = f"{doc_id}_p{page_no}_c{j}"
            chunks.append(
                Chunk(
                    chunk_id=chunk_id,
                    text=ct,
                    metadata={
                        "doc_id": doc_id,
                        "page": page_no,
                        "type": "text",
                        "page_image": str(art.image_path),  # helpful for later
                        "source_file": parsed.filename,
                    },
                )
            )

    if not chunks:
        return doc_id, parsed.pages, 0

    texts = [c.text for c in chunks]
    embs = embedder.embed(texts)

    chroma.upsert(
        ids=[c.chunk_id for c in chunks],
        embeddings=embs,
        documents=texts,
        metadatas=[c.metadata for c in chunks],
    )

    return doc_id, parsed.pages, len(chunks)
