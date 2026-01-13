# backend/app/api/routes_extract.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from backend.app.models.schemas import ChatRequest # Gunakan schema yang sudah ada atau buat baru

router = APIRouter()

@router.post("/extract/schema")
async def extract_schema(payload: ChatRequest):
    # Logika passing API ke AI dengan instruksi khusus (Schema)
    # ...
    pass