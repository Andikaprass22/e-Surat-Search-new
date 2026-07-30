# Quickstart: e-Surat Search

**Feature Branch**: `001-e-surat-search`
**Date**: 2026-06-28

Panduan setup dan pengembangan lokal untuk e-Surat Search.

---

## Prasyarat

- Node.js 20+
- Bun (package manager — **wajib, jangan pakai npm/yarn/pnpm**)
- Database Neon Postgres (buat project di https://neon.tech)
- Git

---

## 1. Clone & Install Dependencies

```bash
git clone <repo-url>
bun install
```

---

## 2. Setup Environment Variables

Salin file `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Isi variabel berikut di `.env.local`:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
BETTER_AUTH_SECRET="buat-secret-acak-minimal-32-karakter"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 3. Generate Better Auth Schema

Better Auth menghasilkan model Prisma secara otomatis berdasarkan konfigurasi `lib/auth.ts`:

```bash
bun x auth@latest generate
```

Perintah ini akan memperbarui `prisma/schema.prisma` dengan model:
- `user` (+ field admin plugin: `role`, `banned`, `banReason`, `banExpires`)
- `user` (+ field username plugin: `username`)
- `session`, `account`, `verification`, `deviceSession`

---

## 4. Tambahkan Model Bisnis ke schema.prisma

Setelah Better Auth menghasilkan schema, tambahkan model bisnis berikut ke `prisma/schema.prisma`:

```prisma
model Category {
  id          String     @id @default(cuid())
  name        String     @unique
  description String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  documents   Document[]

  @@index([name])
  @@map("categories")
}

model Document {
  id             String         @id @default(cuid())
  title          String
  documentNumber String         @unique
  content        String         @db.Text
  documentDate   DateTime
  categoryId     String
  category       Category       @relation(fields: [categoryId], references: [id])
  createdById    String
  updatedById    String?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  terms          DocumentTerm[]
  searchResults  SearchResult[]

  @@index([categoryId])
  @@index([documentNumber])
  @@map("documents")
}

model DocumentTerm {
  id         String   @id @default(cuid())
  documentId String
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  term       String
  tf         Float
  tfidf      Float

  @@unique([documentId, term])
  @@index([term])
  @@index([documentId])
  @@map("document_terms")
}

model GlobalTermIdf {
  term     String @id
  idf      Float
  docCount Int

  @@map("global_term_idf")
}

model SearchHistory {
  id          String         @id @default(cuid())
  userId      String
  query       String
  resultCount Int
  createdAt   DateTime       @default(now())
  results     SearchResult[]

  @@index([userId])
  @@index([createdAt])
  @@map("search_histories")
}

model SearchResult {
  id              String        @id @default(cuid())
  searchHistoryId String
  searchHistory   SearchHistory @relation(fields: [searchHistoryId], references: [id], onDelete: Cascade)
  documentId      String
  document        Document      @relation(fields: [documentId], references: [id], onDelete: Cascade)
  relevanceScore  Float
  rank            Int

  @@index([searchHistoryId])
  @@index([documentId])
  @@map("search_results")
}

model LoginAttempt {
  id            String    @id @default(cuid())
  identifier    String    @unique
  failedCount   Int       @default(0)
  lockedUntil   DateTime?
  lastAttemptAt DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([identifier])
  @@map("login_attempts")
}
```

---

## 5. Generate Prisma Client & Migrate Database

```bash
bun run db:generate
bun run db:migrate
```

Atau untuk production:
```bash
bunx prisma migrate deploy
```

---

## 6. Seed Database (Admin Awal)

```bash
bun run db:seed
```

Script seed akan membuat akun Administrator awal:
- **Username**: `admin`
- **Password**: (sesuai yang dikonfigurasi di seed.ts)

---

## 7. Jalankan Development Server

```bash
bun run dev
```

Akses aplikasi di: http://localhost:3000

---

## 8. Instalasi Komponen Shadcn

Komponen Shadcn di-install per kebutuhan. Contoh:

```bash
bunx shadcn@latest add button
bunx shadcn@latest add input
bunx shadcn@latest add table
bunx shadcn@latest add card
bunx shadcn@latest add form
bunx shadcn@latest add dialog
bunx shadcn@latest add badge
bunx shadcn@latest add sidebar
bunx shadcn@latest add dropdown-menu
bunx shadcn@latest add alert
bunx shadcn@latest add separator
```

---

## 9. Instalasi Framer Motion

```bash
bun add framer-motion
```

---

## 10. Struktur Direktori yang Akan Dibuat

```
app/
├── (public)/
│   └── login/
│       └── page.tsx              ← Halaman login
├── (dashboard)/
│   ├── layout.tsx                ← Layout dasbor (auth guard)
│   ├── dashboard/
│   │   └── page.tsx              ← Redirect ke role dashboard
│   ├── pencarian/
│   │   ├── page.tsx              ← Halaman pencarian (user)
│   │   └── actions.ts            ← Server Action pencarian
│   ├── riwayat/
│   │   ├── page.tsx              ← Daftar riwayat
│   │   └── [id]/page.tsx         ← Detail riwayat
│   ├── laporan/
│   │   └── page.tsx              ← Laporan pencarian
│   └── admin/
│       ├── layout.tsx            ← Layout admin (role guard)
│       ├── page.tsx              ← Dasbor admin
│       ├── pengguna/
│       │   ├── page.tsx
│       │   └── actions.ts
│       ├── dokumen/
│       │   ├── page.tsx
│       │   └── actions.ts
│       └── kategori/
│           ├── page.tsx
│           └── actions.ts
├── api/
│   └── auth/
│       └── [...all]/route.ts     ← Better Auth route handler

lib/
├── auth.ts                       ← Better Auth config (diperbarui)
├── auth-client.ts                ← Better Auth client
├── prisma.ts                     ← Prisma singleton (sudah ada)
├── data/
│   ├── dokumen.ts               ← Cached data functions
│   ├── kategori.ts
│   ├── pengguna.ts
│   ├── riwayat.ts
│   └── laporan.ts
└── tfidf/
    ├── engine.ts                 ← TF-IDF kalkulasi + indexing
    ├── tokenizer.ts              ← Tokenisasi + stopwords BI
    └── stopwords.ts              ← Daftar stopwords Bahasa Indonesia

components/
├── ui/                           ← Shadcn UI components
├── layout/
│   ├── sidebar.tsx
│   ├── header.tsx
│   └── nav-user.tsx
├── dokumen/
│   ├── dokumen-table.tsx
│   ├── dokumen-form.tsx
│   └── dokumen-detail.tsx
├── kategori/
│   └── kategori-form.tsx
├── pengguna/
│   └── pengguna-table.tsx
├── pencarian/
│   ├── search-bar.tsx
│   └── search-results.tsx
└── laporan/
    └── laporan-chart.tsx

prisma/
├── schema.prisma                 ← Schema lengkap (Better Auth + bisnis)
└── seed.ts                       ← Seed admin awal

proxy.ts                          ← Route protection (diperbarui)
types/
└── index.ts                      ← Tipe data bersama
```

---

## 11. Konfigurasi Better Auth (lib/auth.ts — versi final)

```typescript
import { betterAuth } from "better-auth"
import { prismaAdapter } from "@better-auth/prisma-adapter"
import { nextCookies } from "better-auth/next-js"
import { admin, username } from "better-auth/plugins"
import { prisma } from "./prisma"

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins:
    process.env.NODE_ENV === "development"
      ? (request?: Request) => [request?.headers.get("origin") ?? "*"]
      : [process.env.BETTER_AUTH_URL!, process.env.NEXT_PUBLIC_APP_URL!],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  plugins: [
    nextCookies(),
    admin({
      adminRoles: ["admin"],
      defaultRole: "user",
    }),
    username(),
  ],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
})

export type Session = typeof auth.$Infer.Session
```

---

## 12. Konfigurasi next.config.ts

```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    dynamicIO: true,
  },
}

export default nextConfig
```

> `dynamicIO: true` diperlukan untuk mengaktifkan `'use cache'` directive di Next.js 16.
