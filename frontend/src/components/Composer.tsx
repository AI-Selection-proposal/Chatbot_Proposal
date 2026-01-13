"use client";

import { useEffect, useRef, useState } from "react";

export default function Composer({
  busy,
  onSend,
  darkMode = false
}: {
  busy: boolean;
  onSend: (text: string) => Promise<void> | void;
  darkMode?: boolean;
}) {
  const [text, setText] = useState("");
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    taRef.current?.focus();
  }, []);

  async function submit() {
    const t = text.trim();
    if (!t) return;
    setText("");
    await onSend(t);
  }

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
      <textarea
        ref={taRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ketik pesan Anda di sini..."
        rows={2}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!busy) submit();
          }
        }}
        style={{
          flex: 1,
          resize: "none",
          padding: 12,
          borderRadius: 12,
          background: darkMode ? "#2a2a40" : "#ffffff",
          border: darkMode ? "2px solid #444" : "2px solid #e0e0e0",
          color: darkMode ? "#e0e0e0" : "#1a1a1a",
          outline: "none",
          fontSize: 14
        }}
      />

      <button
        onClick={submit}
        disabled={busy || !text.trim()}
        style={{
          padding: "10px 20px",
          borderRadius: 12,
          background: busy || !text.trim() ? (darkMode ? "#333" : "#e0e0e0") : "#1976d2",
          color: "#ffffff",
          border: "none",
          cursor: busy || !text.trim() ? "not-allowed" : "pointer",
          fontSize: 14,
          fontWeight: 600,
          minWidth: 90
        }}
      >
        {busy ? "⏳" : "Kirim"}
      </button>
    </div>
  );
}
