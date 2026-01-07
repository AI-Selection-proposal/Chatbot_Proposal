import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF VLM RAG Demo",
  description: "Chat + PDF (text+image+tables) demo using vLLM + ChromaDB"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui, Arial" }}>
        {children}
      </body>
    </html>
  );
}
