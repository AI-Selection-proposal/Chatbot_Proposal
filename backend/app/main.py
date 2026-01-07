from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import settings, ensure_dirs
from backend.app.core.logging import setup_logging

from backend.app.api.routes_health import router as health_router
from backend.app.api.routes_upload import router as upload_router
from backend.app.api.routes_chat import router as chat_router
from backend.app.api.routes_ask_doc import router as ask_doc_router

def create_app() -> FastAPI:
    setup_logging()
    ensure_dirs()

    app = FastAPI(title=settings.app_name)

    # CORS for your Next.js frontend (prototype)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # tighten later
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Serve extracted images for vision prompts
    # URL: /static/images/<doc_id>/<doc_id>_page_<n>.png
    images_root = (settings.extract_dir / "images").resolve()
    app.mount("/static/images", StaticFiles(directory=str(images_root)), name="images")

    app.include_router(health_router)
    app.include_router(upload_router)
    app.include_router(chat_router)
    app.include_router(ask_doc_router)

    return app

app = create_app()
