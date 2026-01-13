from __future__ import annotations
import os
from typing import List, Optional

# FastAPI & Pydantic
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Database & AI
import chromadb
from chromadb.config import Settings
from openai import OpenAI

# Internal Imports (Existing)
from backend.app.core.config import settings, ensure_dirs
from backend.app.core.logging import setup_logging
from backend.app.api.routes_health import router as health_router
from backend.app.api.routes_upload import router as upload_router
from backend.app.api.routes_chat import router as chat_router
from backend.app.api.routes_ask_doc import router as ask_doc_router
from backend.app.api.routes_extract import router as extract_router 

# --- INITIALIZE GLOBAL CLIENTS ---

# Initialize ChromaDB
chroma_client = chromadb.Client(Settings(
    persist_directory="./chroma_db"
))

# Get or create collection
collection = chroma_client.get_or_create_collection(
    name="documents",
    metadata={"hnsw:space": "cosine"}
)

# Initialize OpenAI client pointing to vLLM
client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="dummy-key" # vLLM doesn't need real key
)

# --- MODELS ---

class Document(BaseModel):
    content: str
    metadata: Optional[dict] = {}

class Query(BaseModel):
    question: str
    top_k: int = 3

class ChatMessage(BaseModel):
    message: str
    use_context: bool = True

# --- APP FACTORY ---

def create_app() -> FastAPI:
    setup_logging()
    ensure_dirs()

    app = FastAPI(title=settings.app_name)

    # CORS Configuration
    # Menggabungkan "*" dan localhost:8000 dari kedua versi
    origins = ["*"] 
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[72.61.215.182],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Serve extracted images
    images_root = (settings.extract_dir / "images").resolve()
    app.mount("/static/images", StaticFiles(directory=str(images_root)), name="images")

    # Include existing routers
    app.include_router(health_router)
    app.include_router(upload_router)
    app.include_router(chat_router)
    app.include_router(ask_doc_router)
    app.include_router(extract_router) 

    # --- NEW ROUTES INTEGRATION ---

    @app.post("/documents/add")
    async def add_document(doc: Document):
        """Add document to ChromaDB"""
        try:
            doc_id = f"doc_{collection.count() + 1}"
            collection.add(
                documents=[doc.content],
                metadatas=[doc.metadata],
                ids=[doc_id]
            )
            return {"status": "success", "id": doc_id}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/documents/query")
    async def query_documents(query: Query):
        """Query similar documents from ChromaDB"""
        try:
            results = collection.query(
                query_texts=[query.question],
                n_results=query.top_k
            )
            return {
                "documents": results["documents"][0],
                "metadatas": results["metadatas"][0],
                "distances": results["distances"][0]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/chat")
    async def chat(chat_msg: ChatMessage):
        """Chat with context from ChromaDB"""
        try:
            context = ""
            if chat_msg.use_context:
                # Retrieve relevant documents
                results = collection.query(
                    query_texts=[chat_msg.message],
                    n_results=3
                )
                if results["documents"][0]:
                    context = "\n\n".join(results["documents"][0])

            # Build prompt
            if context:
                prompt = f"Based on the following context, answer the question.\n\nContext:\n{context}\n\nQuestion: {chat_msg.message}\nAnswer:"
            else:
                prompt = chat_msg.message

            # Call vLLM through OpenAI API
            response = client.chat.completions.create(
                model="meta-llama/Llama-2-7b-chat-hf",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            return {
                "response": response.choices[0].message.content,
                "context_used": context if chat_msg.use_context else None
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # Override/Update Health Route
    @app.get("/health_status")
    async def health_status():
        return {"status": "healthy", "documents_count": collection.count()}

    return app

app = create_app()