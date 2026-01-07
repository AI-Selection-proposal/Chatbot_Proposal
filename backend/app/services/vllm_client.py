from __future__ import annotations

import httpx
from typing import Any, AsyncIterator, Dict, List, Optional

class VLLMClient:
    """
    Minimal OpenAI-compatible client for vLLM with SSE streaming.
    We consume the server's streaming response and yield text deltas.
    """

    def __init__(self, base_url: str, api_key: str, model: str, timeout_s: float = 120.0):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model = model
        self.timeout = timeout_s

    def _headers(self) -> dict:
        return {"Authorization": f"Bearer {self.api_key}"}

    async def stream_chat_completions(self, messages: List[Dict[str, Any]], temperature: float = 0.2) -> AsyncIterator[str]:
        url = f"{self.base_url}/chat/completions"
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "stream": True,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            async with client.stream("POST", url, headers=self._headers(), json=payload) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line:
                        continue
                    if line.startswith("data: "):
                        data = line[len("data: "):].strip()
                        if data == "[DONE]":
                            break
                        # Parse OpenAI stream chunk
                        try:
                            import json
                            chunk = json.loads(data)
                            delta = chunk["choices"][0].get("delta", {})
                            text = delta.get("content")
                            if text:
                                yield text
                        except Exception:
                            # Ignore malformed chunks (prototype)
                            continue
