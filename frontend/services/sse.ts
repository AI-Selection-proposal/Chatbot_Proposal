/**
 * Server-Sent Events (SSE) utility functions
 */

export type SsePayload =
  | { type: "delta"; text: string }
  | { type: "done" }
  | { type: "error"; error?: string };

/**
 * Parse SSE stream into async generator of payloads
 */
export async function* parseSseStream(
  response: Response,
  signal?: AbortSignal
): AsyncGenerator<SsePayload> {
  if (!response.body) {
    throw new Error("No response body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      if (signal?.aborted) {
        reader.cancel();
        return;
      }

      const { done, value } = await reader.read();

      if (done) {
        yield { type: "done" };
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;

        const dataStr = trimmed.slice(5).trim();
        if (!dataStr) continue;

        // Handle special markers
        if (dataStr === "[DONE]") {
          yield { type: "done" };
          return;
        }

        try {
          const parsed = JSON.parse(dataStr);
          
          // Handle different response formats
          if (parsed.error) {
            yield { type: "error", error: parsed.error };
            return;
          }

          // Handle delta text (various formats)
          const text =
            parsed.delta ||
            parsed.text ||
            parsed.content ||
            parsed.choices?.[0]?.delta?.content ||
            "";

          if (text) {
            yield { type: "delta", text };
          }
        } catch (err) {
          // If not JSON, treat as plain text
          yield { type: "delta", text: dataStr };
        }
      }
    }
  } catch (error: any) {
    if (signal?.aborted) {
      return;
    }
    yield { type: "error", error: error?.message || "Stream error" };
  } finally {
    reader.releaseLock();
  }
}
