"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function bubbleStyle(role: ChatMessage["role"]): React.CSSProperties {
  const isUser = role === "user";
  return {
    maxWidth: 900,
    width: "100%",
    margin: "10px auto",
    padding: "14px 16px",
    borderRadius: 14,
    background: isUser ? "#1b2a44" : "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    lineHeight: 1.5
  };
}

export default function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div style={{ padding: "14px 12px 40px" }}>
      {messages.map((m, idx) => (
        <div key={idx} style={bubbleStyle(m.role)}>
          <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 8 }}>
            {m.role === "user" ? "You" : "Assistant"}
          </div>

          {m.role === "assistant" ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
                  return inline ? (
                    <code
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        padding: "2px 6px",
                        borderRadius: 6,
                        fontSize: 13
                      }}
                    >
                      {children}
                    </code>
                  ) : (
                    <pre
                      style={{
                        background: "#0f172a",
                        padding: 12,
                        borderRadius: 10,
                        overflowX: "auto",
                        fontSize: 13
                      }}
                    >
                      <code className={className}>{children}</code>
                    </pre>
                  );
                },
                table({ children }) {
                  return (
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          borderCollapse: "collapse",
                          width: "100%",
                          marginTop: 8
                        }}
                      >
                        {children}
                      </table>
                    </div>
                  );
                },
                th({ children }) {
                  return (
                    <th
                      style={{
                        border: "1px solid rgba(255,255,255,0.2)",
                        padding: 8,
                        background: "rgba(255,255,255,0.1)"
                      }}
                    >
                      {children}
                    </th>
                  );
                },
                td({ children }) {
                  return (
                    <td
                      style={{
                        border: "1px solid rgba(255,255,255,0.2)",
                        padding: 8
                      }}
                    >
                      {children}
                    </td>
                  );
                }
              }}
            >
              {m.content || "…"}
            </ReactMarkdown>
          ) : (
            <div style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>
              {m.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
