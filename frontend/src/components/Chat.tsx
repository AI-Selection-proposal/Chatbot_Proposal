"use client";

import { useMemo, useRef, useState } from "react";
import UploadPdf from "./UploadPdf";
import MessageList, { ChatMessage } from "./Message";
import Composer from "./Composer";
import { streamAskPdf, streamChat } from "@/lib/api";
import type { SsePayload } from "@/lib/sse";

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! *Upload a PDF*, **then enable** “Ask Document” to query it. I will stream answers."
    }
  ]);

  const [docId, setDocId] = useState<string>("");
  const [askDoc, setAskDoc] = useState<boolean>(false);
  const [useImages, setUseImages] = useState<boolean>(true);

  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const canAskDoc = askDoc && !!docId;

  const headerHint = useMemo(() => {
    if (!docId) return "No PDF loaded";
    return `Active doc_id: ${docId}`;
  }, [docId]);

  function appendMessage(msg: ChatMessage) {
    setMessages((prev) => [...prev, msg]);
  }

  function updateLastAssistant(delta: string) {
    setMessages((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (!last || last.role !== "assistant") return prev;
      copy[copy.length - 1] = { ...last, content: last.content + delta };
      return copy;
    });
  }

  function stop() {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
  }

  async function onSend(text: string) {
    if (!text.trim() || busy) return;

    appendMessage({ role: "user", content: text.trim() });

    // Create empty assistant bubble for streaming
    appendMessage({ role: "assistant", content: "" });

    setBusy(true);
    const abort = new AbortController();
    abortRef.current = abort;

    const handle = (p: SsePayload) => {
      if (p.type === "delta") updateLastAssistant(p.text);
      if (p.type === "done") {
        setBusy(false);
        abortRef.current = null;
      }
    };

    try {
      if (canAskDoc) {
        await streamAskPdf(docId, text.trim(), useImages, handle, abort.signal);
      } else {
        await streamChat(text.trim(), handle, abort.signal);
      }
    } catch (e: any) {
      // On error, end busy + show error in assistant
      setBusy(false);
      abortRef.current = null;
      updateLastAssistant(
        `\n\n[Error] ${e?.message ?? "Failed to stream response."}`
      );
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        height: "100vh"
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "#0b0f17",
          position: "sticky",
          top: 0,
          zIndex: 10
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontWeight: 700, letterSpacing: 0.2 }}>
            PDF VLM RAG Demo
          </div>
          <div style={{ opacity: 0.7, fontSize: 12 }}>{headerHint}</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={askDoc}
                onChange={(e) => setAskDoc(e.target.checked)}
              />
              <span style={{ fontSize: 13 }}>Ask Document</span>
            </label>

            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={useImages}
                onChange={(e) => setUseImages(e.target.checked)}
                disabled={!askDoc}
              />
              <span style={{ fontSize: 13, opacity: askDoc ? 1 : 0.5 }}>
                Include Page Images
              </span>
            </label>

            <button
              onClick={stop}
              disabled={!busy}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                background: busy ? "#24324a" : "rgba(255,255,255,0.06)",
                color: "#e6eefc",
                border: "1px solid rgba(255,255,255,0.12)",
                cursor: busy ? "pointer" : "not-allowed",
                fontSize: 13
              }}
            >
              Stop
            </button>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <UploadPdf
            onUploaded={(res) => {
              setDocId(res.doc_id);
              // auto-enable doc mode after upload (nice for demos)
              setAskDoc(true);

              appendMessage({
                role: "assistant",
                content:
                  `PDF ingested ✅\n` +
                  `• filename: ${res.filename}\n` +
                  `• pages: ${res.pages}\n` +
                  `• chunks: ${res.chunks_upserted}\n` +
                  `• doc_id: ${res.doc_id}\n\n` +
                  `Now ask questions with “Ask Document” enabled.`
              });
            }}
          />
        </div>
      </div>

      {/* Chat area */}
      <div style={{ overflow: "auto" }}>
        <MessageList messages={messages} />
      </div>

      {/* Composer */}
      <div
        style={{
          padding: 14,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "#0b0f17"
        }}
      >
        <Composer busy={busy} onSend={onSend} />
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
          Mode:{" "}
          <b>{canAskDoc ? "PDF Q&A (RAG + Vision)" : "Chat (no document)"}</b>
          {askDoc && !docId ? " — upload a PDF first." : ""}
        </div>
      </div>
    </div>
  );
}
