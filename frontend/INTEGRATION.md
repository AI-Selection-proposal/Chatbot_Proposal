# Frontend Integration Guide

## Struktur Folder

```
frontend/
├── services/              # ⚠️ SATU-SATUNYA layer untuk API communication
│   ├── api.ts            # Backend API client dengan streaming support
│   ├── sse.ts            # SSE parsing utilities
│   └── README.md
├── src/
│   ├── components/       # React components
│   │   ├── Chat.tsx
│   │   ├── UploadPdf.tsx
│   │   ├── Message.tsx
│   │   ├── Composer.tsx
│   │   └── Sidebar.tsx
│   └── app/
│       ├── layout.tsx
│       └── page.tsx
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   └── index.tsx
├── .env.local            # Environment variables (local)
├── .env.example          # Environment variables template
├── package.json
└── tsconfig.json
```

⚠️ **PENTING**: Folder `lib` di-ignore oleh git (lihat `.gitignore` di root). Oleh karena itu, **semua API logic ada di folder `services/`** untuk memastikan file tidak hilang saat clone/pull.

## Environment Configuration

File `.env.local` sudah dikonfigurasi dengan:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

## Path Aliases

TypeScript path mapping sudah dikonfigurasi di `tsconfig.json`:
- `@/*` → `src/*` - Untuk mengakses src folder
- `@/services/*` → `services/*` - Untuk mengakses services folder

## Import Usage

### Dari Komponen
```typescript
// Import dari services (SATU-SATUNYA cara)
import { streamChat, streamAskPdf, uploadPdf } from '@/services/api';
import type { SsePayload, ChatMessage, UploadPdfResult } from '@/services/api';
```

## API Functions

### Upload PDF
```typescript
const result = await uploadPdf(file);
// Returns: { document_id, filename, num_pages?, message? }
```

### Stream Chat
```typescript
for await (const payload of streamChat(messages, abortSignal)) {
  if (payload.type === 'delta') {
    // Handle streamed text chunk
  } else if (payload.type === 'done') {
    // Stream complete
  } else if (payload.type === 'error') {
    // Handle error
  }
}
```

### Stream Document Q&A
```typescript
for await (const payload of streamAskPdf(docId, question, useImages, signal)) {
  // Same payload structure as streamChat
}
```

## No Missing Dependencies

Semua file sudah terintegrasi dengan benar:
- ✅ `tsconfig.json` sudah dikonfigurasi dengan path mapping `@/services/*`
- ✅ `.env.local` sudah dikonfigurasi dengan backend URL
- ✅ `services/api.ts` dan `services/sse.ts` dengan streaming support lengkap
- ✅ Komponen `Chat.tsx` dan `UploadPdf.tsx` menggunakan `@/services/api`
- ✅ Tidak ada TypeScript errors
- ✅ **Folder `lib` TIDAK digunakan** (di-ignore oleh git)
- ✅ **Semua file akan tersimpan di git** - tidak ada file yang hilang saat clone

## Running the Project

```bash
# Install dependencies (jika belum)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Frontend akan berjalan di http://localhost:3000 dan terhubung ke backend di http://localhost:8080.

## Saat Clone Repository Baru

Tidak perlu membuat file api.ts dan sse.ts lagi karena:
1. File-file tersebut ada di folder `services/` (BUKAN di `lib/`)
2. Folder `services/` **TIDAK** di-ignore oleh git
3. File akan otomatis tersedia setelah `git clone` atau `git pull`
