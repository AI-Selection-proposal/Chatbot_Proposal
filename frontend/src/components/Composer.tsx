"use client";

import { useEffect, useRef, useState } from "react";

export default function Composer({
  busy,
  onSend
}: {
  busy: boolean;
  onSend: (text: string) => Promise<void> | void;
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
        placeholder="Type a message…"
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
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#e6eefc",
          outline: "none",
          fontSize: 14
        }}
      />

      <button
        onClick={submit}
        disabled={busy || !text.trim()}
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          background: busy || !text.trim() ? "rgba(255,255,255,0.06)" : "#24324a",
          color: "#e6eefc",
          border: "1px solid rgba(255,255,255,0.12)",
          cursor: busy || !text.trim() ? "not-allowed" : "pointer",
          fontSize: 14,
          minWidth: 90
        }}
      >
        {busy ? "…" : "Send"}
      </button>
    </div>
  );
}
