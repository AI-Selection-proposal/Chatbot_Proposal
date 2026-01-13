import dynamic from "next/dynamic";

const Chat = dynamic(() => import("../src/components/Chat"), { ssr: false });

export default function IndexPage() {
  return (
    <div style={{ height: "100vh", background: "#0b0f17", color: "#e6eefc" }}>
      <Chat />
    </div>
  );
}
