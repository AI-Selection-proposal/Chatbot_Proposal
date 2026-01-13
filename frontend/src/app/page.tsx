"use client";

import dynamic from "next/dynamic";

const Chat = dynamic(() => import("@/components/Chat"), { ssr: false });

export default function Page() {
  return (
    <div style={{ height: "100vh", background: "#f5f7fa", color: "#1a1a1a" }}>
      <Chat />
    </div>
  );
}
