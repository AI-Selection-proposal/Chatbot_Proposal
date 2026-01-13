"use client";

import { useState } from "react";
import { uploadPdf, UploadPdfResult } from "@/lib/api";

export default function UploadPdf({
  onUploaded
}: {
  onUploaded: (res: UploadPdfResult) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>("");

  async function onUpload() {
    if (!file || busy) return;
    setBusy(true);
    setErr("");
    try {
      const res = await uploadPdf(file);
      onUploaded(res);
      setFile(null);
    } catch (e: any) {
      setErr(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        flexWrap: "wrap"
      }}
    >
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          setFile(f);
        }}
        style={{
          padding: 8,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 10,
          color: "#e6eefc"
        }}
      />

      <button
        onClick={onUpload}
        disabled={!file || busy}
        style={{
          padding: "8px 16px",
          borderRadius: 8,
          background: !file || busy ? "#e0e0e0" : "#1976d2",
          color: "#ffffff",
          border: "none",
          cursor: !file || busy ? "not-allowed" : "pointer",
          fontSize: 13,
          fontWeight: 600
        }}
      >
        {busy ? "📤 Mengupload..." : "📁 Upload PDF"}
      </button>

      {err ? (
        <div style={{ fontSize: 12, color: "#ffb4b4" }}>{err}</div>
      ) : null}

      <div style={{ fontSize: 12, opacity: 0.7 }}>
        Tip: for best demo, ask: “Summarize key findings and explain the figure on
        page X.”
      </div>
    </div>
  );
}
