import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diksaintek Chatbot",
  description: "Asisten Riset Indonesia - Chat dengan dokumen menggunakan AI"
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
