from __future__ import annotations

import json
from typing import Any, AsyncIterator

def sse_event(data: Any, event: str = "message") -> str:
    # SSE format: event + data
    payload = json.dumps(data, ensure_ascii=False)
    return f"event: {event}\ndata: {payload}\n\n"


async def sse_wrap_text_stream(text_stream: AsyncIterator[str]) -> AsyncIterator[str]:
    async for token in text_stream:
        yield sse_event({"type": "delta", "text": token})
    yield sse_event({"type": "done"}, event="done")
