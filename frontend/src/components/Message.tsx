"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function bubbleStyle(role: ChatMessage["role"], darkMode: boolean): React.CSSProperties {
  const isUser = role === "user";
  if (darkMode) {
    return {
      maxWidth: 700,
      margin: "12px 16px",
      padding: "12px 16px",
      borderRadius: 16,
      background: isUser ? "#1976d2" : "#2a2a40",
      color: "#ffffff",
      border: isUser ? "none" : "1px solid #444",
      lineHeight: 1.6,
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      marginLeft: isUser ? "auto" : "16px",
      marginRight: isUser ? "16px" : "auto"
    };
  }
  return {
    maxWidth: 700,
    margin: "12px 16px",
    padding: "12px 16px",
    borderRadius: 16,
    background: isUser ? "#1976d2" : "#ffffff",
    color: isUser ? "#ffffff" : "#1a1a1a",
    border: isUser ? "none" : "1px solid #e0e0e0",
    lineHeight: 1.6,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginLeft: isUser ? "auto" : "16px",
    marginRight: isUser ? "16px" : "auto"
  };
}

export default function MessageList({ messages, darkMode = false }: { messages: ChatMessage[], darkMode?: boolean }) {
  return (
    <div style={{ padding: "14px 12px 40px", maxWidth: 1000, margin: "0 auto" }}>
      {messages.map((m, idx) => (
        <div key={idx} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
          <div style={bubbleStyle(m.role, darkMode)}>
            <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6, fontWeight: 600 }}>
              {m.role === "user" ? "Anda" : "🎓 Assistant"}
            </div>

          {m.role === "assistant" ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
                  return inline ? (
                    <code
                      style={{
                        background: darkMode ? "#1a1a2e" : "#f5f5f5",
                        color: darkMode ? "#ff6b6b" : "#d32f2f",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 13
                      }}
                    >
                      {children}
                    </code>
                  ) : (
                    <pre
                      style={{
                        background: darkMode ? "#1a1a2e" : "#f5f5f5",
                        color: darkMode ? "#e0e0e0" : "#1a1a1a",
                        padding: 12,
                        borderRadius: 8,
                        overflowX: "auto",
                        fontSize: 13,
                        border: darkMode ? "1px solid #444" : "1px solid #e0e0e0"
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
                        border: darkMode ? "1px solid #444" : "1px solid #e0e0e0",
                        padding: 8,
                        background: darkMode ? "#1a1a2e" : "#f5f5f5",
                        color: darkMode ? "#e0e0e0" : "#1a1a1a"
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
                        border: darkMode ? "1px solid #444" : "1px solid #e0e0e0",
                        padding: 8,
                        color: darkMode ? "#e0e0e0" : "#1a1a1a"
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
      </div>
      ))}
    </div>
  );
}
