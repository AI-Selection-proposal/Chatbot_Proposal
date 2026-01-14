/**
 * API client for backend services
 */

import { parseSseStream, SsePayload } from './sse';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Upload PDF result interface
 */
export interface UploadPdfResult {
  document_id: string;
  doc_id: string;
  filename: string;
  num_pages?: number;
  pages?: number;
  chunks_upserted?: number;
  message?: string;
}

/**
 * Chat message interface
 */
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Re-export SsePayload type
export type { SsePayload };

/**
 * Health check endpoint
 */
export async function checkHealth(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

/**
 * Upload PDF file
 */
export async function uploadPdf(file: File): Promise<UploadPdfResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(error.detail || 'Upload failed');
  }

  return response.json();
}

/**
 * Stream chat responses
 */
export async function* streamChat(
  messages: Array<{ role: string; content: string }>,
  signal?: AbortSignal
): AsyncGenerator<SsePayload> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Chat request failed' }));
    throw new Error(error.detail || 'Chat request failed');
  }

  yield* parseSseStream(response, signal);
}

/**
 * Stream document Q&A responses
 */
export async function* streamAskPdf(
  documentId: string,
  question: string,
  useImages: boolean = true,
  signal?: AbortSignal
): AsyncGenerator<SsePayload> {
  const response = await fetch(`${API_BASE_URL}/ask_doc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      document_id: documentId,
      question,
      use_images: useImages,
    }),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Ask document failed' }));
    throw new Error(error.detail || 'Ask document failed');
  }

  yield* parseSseStream(response, signal);
}