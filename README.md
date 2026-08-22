# e-Surat Search — Sistem Informasi Kearsipan Surat

> **Pencarian arsip surat berbasis TF-IDF** dengan peringkat relevansi, manajemen arsip lengkap, dan dashboard statistik.

**Stack**: Next.js 16, Prisma 7 + Neon Postgres, Better Auth (admin/username), Tailwind v4, Shadcn UI, Framer Motion

---

## Fitur Utama

- **Autentikasi & Otorisasi**: login username/password, proteksi rute `proxy.ts` + Server Component guards, brute-force lock 5×5 menit, session 7 hari, banned → revoke.
- **Manajemen Pengguna (Admin)**: create/read/update/ban/unban/delete, guard self-ban/self-delete/last-admin, `updateTag` cache.
- **Manajemen Kategori**: create/read/update/delete dengan cegah hapus jika masih dipakai dokumen.
- **Manajemen Dokumen/Arsip (Admin)**: CRUD dokumen dengan metadata kearsipan (`jenis` SURAT_MASUK/SURAT_KELUAR, pengirim, penerima, perihal, disposisi, lokasiArsip, statusArsip AKTIF/RETENSI/DIMUSNAHKAN, tanggalTerima), upload PDF/DOCX (ekstrak teks via `pdf-parse`/`mammoth`), TF-IDF auto-indexing.
- **Pencarian TF-IDF**: tokenisasi Bahasa Indonesia, stopwords, `TF = freq/total`, `IDF = log(N/df)+1`, cosine similarity, ranking, history otomatis (`GET /api/pencarian?q=`).
- **Riwayat & Laporan**: riwayat per user (isolated), laporan ringkasan (total, top keywords, tren 7 hari), rekap arsip per bulan (admin).
- **Dashboard Admin**: total dokumen, kategori, pengguna, pengguna aktif, surat masuk/keluar.
- **Audit Trail**: `DocumentLog` (CREATE/UPDATE/DELETE) dengan pelaku (username), SetNull on delete agar jejak tidak hilang.

---

## Struktur

```
app/(public)/login          → login
app/(dashboard)/pencarian    → pencarian + detail [id]
app/(dashboard)/riwayat      → riwayat + detail [id]
app/(dashboard)/laporan      → laporan
app/(dashboard)/admin/{pengguna,kategori,dokumen} → admin
lib/tfidf/{tokenizer,engine,stopwords} → TF-IDF
lib/data/*                   → cached data layer ('use cache')
prisma/schema.prisma         → schema (User, Category, Document, DocumentTerm, GlobalTermIdf, SearchHistory, SearchResult, LoginAttempt, DocumentLog)
```

## Setup

```bash
bun install
cp .env.example .env  # isi DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_APP_URL
bun run db:generate
bun run db:migrate
bun run db:seed        # buat admin awal
bun run dev
```

## Scripts

```bash
bun run dev | build | start | lint | typecheck
bun run db:generate | db:migrate | db:seed | db:studio
bun prisma/seed-mock.ts  # generate 10k dokumen untuk benchmark SC-001 (<5s)
```

## Catatan TF-IDF

- Pre-computed: `DocumentTerm.tf/tfidf` + `GlobalTermIdf.idf/docCount` dihitung saat `triggerTfidfIndexing` / `recalculateGlobalIdf`
- Formula: `TF = freq/totalTerms`, `IDF = log(N/df)+1`, `TF-IDF = TF*IDF`, `cosine = dot/(||q||*||d||)`
- Cache: `getTfidfIndex()` `'use cache'` + `cacheTag('tfidf-index')` + `cacheLife('hours')`, invalidasi via `updateTag`/`revalidateTag`

## Env

Lihat `.env.example`. `UPLOADTHING_TOKEN` tidak lagi diperlukan (local fs `uploads/`).

---
