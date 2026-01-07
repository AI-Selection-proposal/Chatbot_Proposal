from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import List
import fitz  # pymupdf

@dataclass
class PageArtifact:
    page_index: int
    text: str
    image_path: Path  # rendered full page image (for vision grounding)

@dataclass
class ParsedPDF:
    doc_id: str
    filename: str
    pages: int
    artifacts: List[PageArtifact]

def parse_pdf_to_text_and_page_images(
    pdf_path: Path,
    out_images_dir: Path,
    dpi: int = 150,
    doc_id: str = "doc",
) -> ParsedPDF:
    out_images_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(str(pdf_path))
    artifacts: List[PageArtifact] = []

    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)

    for i in range(doc.page_count):
        page = doc.load_page(i)
        text = page.get_text("text") or ""

        pix = page.get_pixmap(matrix=mat, alpha=False)
        img_path = out_images_dir / f"{doc_id}_page_{i+1}.png"
        pix.save(str(img_path))

        artifacts.append(PageArtifact(page_index=i, text=text, image_path=img_path))

    return ParsedPDF(
        doc_id=doc_id,
        filename=pdf_path.name,
        pages=doc.page_count,
        artifacts=artifacts,
    )
