from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


def _p(key: str, default: str) -> Path:
    return Path(os.getenv(key, default)).resolve()


@dataclass(frozen=True)
class Settings:
    # Storage
    chroma_persist_dir: Path = _p("CHROMA_PERSIST_DIR", "./chroma")
    upload_dir: Path = _p("UPLOAD_DIR", "./data/uploads")
    extract_dir: Path = _p("EXTRACT_DIR", "./data/extracted")
    sqlite_path: Path = _p("SQLITE_PATH", "./data/sqlite/app.db")

    # vLLM OpenAI-compatible endpoint
    vllm_base_url: str = os.getenv("VLLM_BASE_URL", "http://127.0.0.1:8000/v1")
    vllm_api_key: str = os.getenv("VLLM_API_KEY", "local-dev")
    chat_vlm_model: str = os.getenv("CHAT_VLM_MODEL", "Qwen/Qwen3-VL-7B-Instruct")

    # Embeddings
    embed_model: str = os.getenv("EMBED_MODEL", "BAAI/bge-small-en-v1.5")

    # RAG
    top_k: int = int(os.getenv("TOP_K", "6"))
    max_context_chars: int = int(os.getenv("MAX_CONTEXT_CHARS", "14000"))
    attach_images_max: int = int(os.getenv("ATTACH_IMAGES_MAX", "2"))

    # PDF extraction
    render_dpi: int = int(os.getenv("RENDER_DPI", "150"))

    # App
    app_name: str = os.getenv("APP_NAME", "PDF-VLM-RAG-Demo")


settings = Settings()


def ensure_dirs() -> None:
    settings.chroma_persist_dir.mkdir(parents=True, exist_ok=True)
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    (settings.extract_dir / "text").mkdir(parents=True, exist_ok=True)
    (settings.extract_dir / "images").mkdir(parents=True, exist_ok=True)
    settings.sqlite_path.parent.mkdir(parents=True, exist_ok=True)
