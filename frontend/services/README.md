# Frontend Services

Folder ini berisi service utilities untuk komunikasi dengan backend. **Ini adalah satu-satunya layer untuk API communication** - tidak ada duplikasi di folder lain.

## Files

### `api.ts`
API client dengan fungsi-fungsi untuk berkomunikasi dengan backend endpoints:

#### Streaming Functions (untuk komponen React)
- `streamChat(messages, signal)` - Stream chat responses dengan async generator
- `streamAskPdf(documentId, question, useImages, signal)` - Stream document Q&A responses

#### Upload Functions
- `uploadPdf(file)` - Upload file PDF, returns `UploadPdfResult`

#### Utility Functions
- `checkHealth()` - Health check endpoint

#### Types
- `UploadPdfResult` - Interface untuk hasil upload
- `ChatMessage` - Interface untuk pesan chat
- `SsePayload` - Union type untuk streaming payloads (re-exported dari sse.ts)

### `sse.ts`
Utilities untuk menangani Server-Sent Events (SSE) untuk streaming responses:
- `parseSseStream(response, signal)` - Parse SSE stream menjadi async generator dari `SsePayload`
- `SsePayload` - Type untuk streaming payloads (delta, done, error)

## Usage

Import langsung dari `@/services`:

```typescript
import { uploadPdf, streamChat, streamAskPdf } from '@/services/api';
import type { SsePayload, ChatMessage, UploadPdfResult } from '@/services/api';

// Upload PDF
const result = await uploadPdf(file);

// Stream chat
for await (const payload of streamChat(messages, abortSignal)) {
  if (payload.type === 'delta') {
    // Handle text chunk
  } else if (payload.type === 'done') {
    // Stream complete
  }
}

// Stream document Q&A
for await (const payload of streamAskPdf(docId, question, useImages, signal)) {
  // Same as streamChat
}
```

## Environment Variables

Pastikan file `.env.local` sudah dikonfigurasi:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

## Important Notes

⚠️ **Folder `lib` di-ignore oleh git!** Semua API logic ada di folder `services` ini untuk memastikan tidak ada file yang hilang saat clone/pull repository.
