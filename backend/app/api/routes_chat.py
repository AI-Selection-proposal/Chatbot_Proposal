from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from typing import AsyncIterator

from backend.app.core.config import settings
from backend.app.models.schemas import ChatRequest
from backend.app.services.vllm_client import VLLMClient
from backend.app.utils.sse import sse_wrap_text_stream

router = APIRouter()

@router.post("/chat")
async def chat(payload: ChatRequest):
    system = payload.system or "You are a helpful assistant."
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": payload.message},
    ]

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
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )
