# Implementation Plan: e-Surat Search

**Branch**: `001-e-surat-search` | **Date**: 2026-06-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-e-surat-search/spec.md`

---

## Summary

e-Surat Search adalah sistem pencarian dokumen berbasis web yang menggunakan algoritma TF-IDF (Term Frequency–Inverse Document Frequency) untuk mengukur relevansi antara kueri pencarian pengguna dan dokumen tersimpan. Sistem mencakup dua peran: Administrator (manajemen pengguna, dokumen, kategori) dan Pengguna (pencarian, riwayat, laporan). Dibangun di atas Next.js 16 dengan pendekatan Server Components, Server Actions, dan `'use cache'` directive untuk performa maksimal.

---

## Technical Context

**Language/Version**: TypeScript 5 + Node.js 20
**Primary Dependencies**: Next.js 16, Better Auth 1.6.x, Prisma V7, Shadcn UI, Framer Motion
**Storage**: Neon Postgres (serverless) via `@prisma/adapter-neon`
**Testing**: TypeScript type checking (`bun run typecheck`), manual E2E testing
**Target Platform**: Web browser (intranet/internal network)
**Project Type**: Web application (Next.js App Router, full-stack)
**Performance Goals**: Pencarian selesai dalam <5 detik untuk corpus hingga 10.000 dokumen
**Constraints**: TF-IDF pre-calculated (indexing approach), akses rute berbasis peran, caching maksimal dengan `'use cache'`
**Scale/Scope**: ~10.000 dokumen, jumlah pengguna terbatas (internal organisasi)

---

## Constitution Check

*Tidak ada constitution yang didefinisikan untuk proyek ini (constitution.md masih template kosong). Rules yang berlaku berasal dari user input:*

| Rule | Status |
|---|---|
| ✅ Gunakan `bun` (bukan npm/yarn/pnpm) | Diterapkan di semua perintah |
| ✅ Gunakan `'use cache'` (bukan `force-static`/`force-dynamic`) | Semua komponen data menggunakan `use cache` |
| ✅ Gunakan `proxy.ts` (bukan `middleware.ts`) | File `proxy.ts` sudah ada, akan diperluas |
| ✅ Gunakan Prisma V7 `prisma-client` provider (bukan `prisma-client-js`) | Schema sudah dikonfigurasi dengan benar |
| ✅ Gunakan Context7 untuk dokumentasi | Digunakan di phase 0 research |
| ✅ UploadThing tidak digunakan (tidak ada gambar di spec) | Dikonfirmasi dari spec — konten teks saja |
| ✅ Better Auth dengan prisma adapter + schema auto-generate | `bun x auth@latest generate` |
| ✅ Dilarang menulis komentar di kode | Diterapkan di semua file implementasi |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-e-surat-search/
├── plan.md              ← File ini
├── research.md          ← Phase 0 output ✅
├── data-model.md        ← Phase 1 output ✅
├── quickstart.md        ← Phase 1 output ✅
├── contracts/
│   └── api-contracts.md ← Phase 1 output ✅
└── tasks.md             ← Phase 2 output (via /speckit-tasks)
```

### Source Code (repository root)

```text
app/
├── (public)/
│   └── login/
│       └── page.tsx              ← Halaman login Bahasa Indonesia
├── (dashboard)/
│   ├── layout.tsx                ← Layout + auth guard
│   ├── dashboard/
│   │   └── page.tsx              ← Redirect berdasarkan role
│   ├── pencarian/
│   │   ├── page.tsx
│   │   └── actions.ts
│   ├── riwayat/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── laporan/
│   │   └── page.tsx
│   └── admin/
│       ├── layout.tsx
│       ├── page.tsx
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
│       └── [...all]/route.ts

lib/
├── auth.ts                       ← Better Auth config (update: tambah plugin admin + username)
├── auth-client.ts                ← Better Auth client (update: tambah adminClient)
├── prisma.ts                     ← Singleton Prisma + Neon (sudah benar)
├── data/
│   ├── dokumen.ts
│   ├── kategori.ts
│   ├── pengguna.ts
│   ├── riwayat.ts
│   └── laporan.ts
└── tfidf/
    ├── engine.ts
    ├── tokenizer.ts
    └── stopwords.ts

components/
├── ui/                           ← Shadcn (install per kebutuhan)
├── layout/
│   ├── app-sidebar.tsx
│   └── header.tsx
├── dokumen/
├── kategori/
├── pengguna/
├── pencarian/
└── laporan/

prisma/
├── schema.prisma                 ← Diperbarui setelah bun x auth@latest generate
└── seed.ts

proxy.ts                          ← Diperluas untuk proteksi rute berbasis role
types/
└── index.ts
next.config.ts                    ← Tambahkan experimental.dynamicIO: true
```

**Structure Decision**: Single Next.js App Router project (full-stack). Frontend dan backend diintegrasikan dalam satu aplikasi Next.js menggunakan Server Components, Server Actions, dan route handlers Better Auth.

---

## Design Decisions

### 1. TF-IDF: Pre-computed Indexing
- TF dan IDF dihitung dan disimpan di `DocumentTerm` dan `GlobalTermIdf` saat dokumen CRUD.
- Saat pencarian: hanya cosine similarity yang dihitung secara on-the-fly.
- **Keuntungan**: Pencarian sangat cepat (<1 detik rata-rata).
- **Tradeoff**: Operasi CRUD dokumen sedikit lebih lambat (indexing overhead). *Dimitigasi dengan mengkalkulasi ulang IDF hanya pada term (kata) yang ada di dokumen terkait, bukan seluruh corpus database.*

### 2. Caching: `use cache` + tag-based invalidation
- Semua data reads menggunakan `'use cache'` directive.
- Mutasi menggunakan `updateTag()` dari Server Actions.
- Tag hierarchy: `dokumen-list`, `dokumen-[id]`, `tfidf-index`, `kategori-list`, `pengguna-list`, `riwayat-[userId]`, `laporan-[userId]`.

### 3. Proteksi Rute: proxy.ts + Server Component guards
- `proxy.ts` → proteksi level path (redirect ke `/login` jika belum auth, redirect ke `/403` jika role salah).
- Server Components & Actions → verifikasi ulang di level komponen/aksi (defense in depth).

### 4. Better Auth Admin Plugin
- Gunakan `banned` field dari admin plugin untuk "nonaktifkan akun" (FR-009).
- `banUser` otomatis me-revoke semua sesi aktif.
- User dengan `banned: true` ditolak saat login oleh Better Auth.

### 5. UploadThing: Tidak Digunakan
- Spec menyatakan konten dokumen adalah teks murni (bukan file upload).
- UploadThing sudah terpasang di starter template namun tidak akan digunakan untuk fitur ini.

---

## Complexity Tracking

| Keputusan | Alasan | Alternatif Ditolak |
|---|---|---|
| TF-IDF manual (tanpa library eksternal) | Tidak ada TF-IDF library yang matang untuk Bahasa Indonesia + Next.js | Elasticsearch: terlalu berat untuk intranet kecil |
| Pre-computed indexing | Target <5 detik untuk 10.000 dokumen | Real-time: terlalu lambat untuk corpus besar |
| Stopwords manual BI | Tidak ada library Bahasa Indonesia yang tersedia di lingkungan ini | NLTK/spaCy: Python-only |

---

## Verification Plan

### Automated Checks
```bash
bun run typecheck   ← TypeScript type check
bun run lint        ← ESLint check
bun run build       ← Production build test
```

### Manual Verification

1. **Autentikasi**
   - Login sebagai admin → redirect ke `/dashboard/admin`
   - Login sebagai user → redirect ke `/dashboard/pencarian`
   - Login dengan kredensial salah → pesan error, tidak masuk
   - Akses `/dashboard/admin` sebagai user → forbidden/redirect

2. **Manajemen Pengguna**
   - Buat user baru → login dengan user baru berhasil
   - Ban user → login dengan user tersebut gagal
   - Unban user → login kembali berhasil
   - Hapus user → user tidak ada di daftar

3. **Manajemen Dokumen & Kategori**
   - CRUD kategori lengkap
   - CRUD dokumen lengkap
   - Hapus kategori yang masih memiliki dokumen → error ditampilkan

4. **Pencarian TF-IDF**
   - Tambah 3+ dokumen, cari dengan keyword yang ada di salah satunya → dokumen tersebut di posisi #1
   - Cari keyword yang tidak ada → pesan "tidak ditemukan"
   - Riwayat tersimpan otomatis setelah pencarian

5. **Riwayat & Laporan**
   - Buka riwayat → daftar pencarian muncul
   - Klik entri riwayat → hasil pencarian lama muncul kembali
   - Buka laporan → ringkasan kata kunci dan tren muncul

6. **Brute Force Protection**
   - Gagal login 5x berturut-turut → akun terkunci 5 menit
   - Coba login saat terkunci → pesan kunci ditampilkan
