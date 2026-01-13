"use client";

import { useMemo, useRef, useState, useEffect } from "react";
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
        "Selamat datang di **Diksaintek Chatbot** 👋\n\nSilakan *upload dokumen PDF* untuk memulai. Saya siap membantu Anda menganalisis dan menjawab pertanyaan tentang dokumen Anda."
    }
  ]);

  const [docId, setDocId] = useState<string>("");
  const [askDoc, setAskDoc] = useState<boolean>(false);
  const [useImages, setUseImages] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const chatAreaRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll ketika ada pesan baru
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const canAskDoc = askDoc && !!docId;

  const headerHint = useMemo(() => {
    if (!docId) return "Belum ada dokumen";
    return `Dokumen aktif: ${docId.slice(0, 12)}...`;
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

    try {
      if (canAskDoc) {
        for await (const payload of streamAskPdf(docId, text.trim(), useImages, abort.signal)) {
          if (payload.type === "delta" && payload.text) {
            updateLastAssistant(payload.text);
          } else if (payload.type === "done") {
            setBusy(false);
            abortRef.current = null;
          } else if (payload.type === "error") {
            throw new Error(payload.error || "Stream error");
          }
        }
      } else {
        const messages = [{ role: "user", content: text.trim() }];
        for await (const payload of streamChat(messages, abort.signal)) {
          if (payload.type === "delta" && payload.text) {
            updateLastAssistant(payload.text);
          } else if (payload.type === "done") {
            setBusy(false);
            abortRef.current = null;
          } else if (payload.type === "error") {
            throw new Error(payload.error || "Stream error");
          }
        }
      }
      // Ensure busy is false if loop completes
      setBusy(false);
      abortRef.current = null;
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
        height: "100vh",
        background: darkMode ? "#1a1a2e" : "#f5f7fa"
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "2px solid #1e88e5",
          background: "linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: 0.3, color: "#fff" }}>
            🎓 Diksaintek Chatbot
          </div>
          <div style={{ opacity: 0.9, fontSize: 13, color: "#e3f2fd" }}>{headerHint}</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 500
              }}
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? "🌞" : "🌙"}
            </button>
            <label style={{ display: "flex", gap: 6, alignItems: "center", color: "#fff" }}>
              <input
                type="checkbox"
                checked={askDoc}
                onChange={(e) => setAskDoc(e.target.checked)}
              />
              <span style={{ fontSize: 13 }}>Mode Dokumen</span>
            </label>

            <label style={{ display: "flex", gap: 6, alignItems: "center", color: "#fff" }}>
              <input
                type="checkbox"
                checked={useImages}
                onChange={(e) => setUseImages(e.target.checked)}
                disabled={!askDoc}
              />
              <span style={{ fontSize: 13, opacity: askDoc ? 1 : 0.6 }}>
                Sertakan Gambar
              </span>
            </label>

            <button
              onClick={stop}
              disabled={!busy}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                background: busy ? "#d32f2f" : "rgba(255,255,255,0.2)",
                color: "#fff",
                border: "none",
                cursor: busy ? "pointer" : "not-allowed",
                opacity: busy ? 1 : 0.5,
                fontSize: 13,
                fontWeight: 500
              }}
            >
              ⏸️ Stop
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
                  `✅ **Dokumen berhasil diupload!**\n\n` +
                  `📄 **File:** ${res.filename}\n` +
                  `📊 **Halaman:** ${res.pages}\n` +
                  `🔍 **Chunks:** ${res.chunks_upserted}\n` +
                  `🆔 **ID:** ${res.doc_id}\n\n` +
                  `Silakan aktifkan **"Mode Dokumen"** dan tanyakan apapun tentang dokumen Anda! 🚀`
              });
            }}
          />
        </div>
      </div>

      {/* Chat area */}
      <div 
        ref={chatAreaRef}
        style={{ 
          overflow: "auto", 
          background: darkMode ? "#1a1a2e" : "#f5f7fa" 
        }}
      >
        <MessageList messages={messages} darkMode={darkMode} />
      </div>

      {/* Composer */}
      <div
        style={{
          padding: 14,
          borderTop: darkMode ? "2px solid #333" : "2px solid #e0e0e0",
          background: darkMode ? "#16213e" : "#ffffff"
        }}
      >
        <Composer busy={busy} onSend={onSend} darkMode={darkMode} />
        <div style={{ 
          marginTop: 8, 
          fontSize: 12, 
          opacity: 0.7, 
          color: darkMode ? "#90caf9" : "#666" 
        }}>
          📍 Mode:{" "}
          <b style={{ color: darkMode ? "#64b5f6" : "#1976d2" }}>
            {canAskDoc ? "Analisis Dokumen (RAG + Vision)" : "Chat Umum"}
          </b>
          {askDoc && !docId ? " — Silakan upload dokumen terlebih dahulu" : ""}
        </div>
      </div>
    </div>
  );
}
