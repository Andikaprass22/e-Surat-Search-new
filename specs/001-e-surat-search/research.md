# Research: e-Surat Search

**Feature Branch**: `001-e-surat-search`
**Date**: 2026-06-28
**Stack**: Next.js 16, Shadcn UI, Framer Motion, Neon Postgres, Prisma V7, Better Auth, (No UploadThing)

---

## 1. Next.js 16 — Caching & Data Fetching

### Keputusan
Gunakan `'use cache'` directive pada async Server Components dan async functions untuk caching data. Gunakan `cacheTag()` untuk menandai cache, `updateTag()` dari Server Actions untuk invalidasi segera (read-your-own-writes), dan `revalidateTag()` dari Route Handlers/webhooks untuk invalidasi berbasis waktu/event.

### Temuan Context7 (vercel/next.js v16.2.9)

#### `use cache` Directive (Pengganti `unstable_cache`)
- `unstable_cache` resmi **deprecated** di Next.js 16. Gunakan `'use cache'` directive.
- Dapat diletakkan di atas fungsi async atau komponen async untuk cache output-nya.
- Kombinasikan dengan `cacheLife()` untuk mengontrol durasi cache.

```tsx
import { cacheLife, cacheTag } from 'next/cache'

async function getDokumen(id: string) {
  'use cache'
  cacheLife('hours')
  cacheTag(`dokumen-${id}`, 'dokumen-list')
  return await prisma.document.findUnique({ where: { id } })
}
```

#### `updateTag` vs `revalidateTag`
- **`updateTag`** → dipanggil dari **Server Actions**. Efek segera (cache langsung expired). Untuk "read-your-own-writes" — user melihat perubahan mereka sendiri.
- **`revalidateTag`** → dipanggil dari **Route Handlers** atau webhooks. Menggunakan stale-while-revalidate. Untuk revalidasi berbasis waktu/eksternal.
- **Tidak boleh** menggunakan `force-static` atau `force-dynamic` (deprecated).

```ts
'use server'
import { updateTag } from 'next/cache'

export async function createDocument(formData: FormData) {
  await prisma.document.create({ data: { ... } })
  updateTag('dokumen-list')
  updateTag('tfidf-index')
}
```

#### Strategi Cache Tags untuk e-Surat Search
| Tag | Deskripsi | Diinvalidasi oleh |
|---|---|---|
| `dokumen-list` | Daftar semua dokumen | Create/Update/Delete dokumen |
| `dokumen-[id]` | Detail dokumen spesifik | Update/Delete dokumen tersebut |
| `kategori-list` | Daftar semua kategori | Create/Update/Delete kategori |
| `pengguna-list` | Daftar semua pengguna | Create/Update/Delete pengguna |
| `tfidf-index` | Status indeks TF-IDF | Create/Update/Delete dokumen |
| `riwayat-[userId]` | Riwayat pencarian user | Setiap pencarian baru |
| `laporan-[userId]` | Laporan ringkasan user | Setiap pencarian baru |

#### proxy.ts (Bukan Middleware)
Proyek sudah memiliki `proxy.ts` yang berfungsi sebagai pengganti `middleware.ts`. Pola ini adalah fitur Next.js resmi — file bernama `proxy.ts` di root dieksekusi sebagai middleware di server. Perlu diperluas untuk menangani proteksi rute berbasis peran (admin vs. user).

---

## 2. Better Auth — Autentikasi & Otorisasi

### Keputusan
Gunakan Better Auth dengan prisma adapter. Aktifkan plugin `admin` untuk manajemen pengguna berbasis peran (admin/user), dan plugin `username` untuk login menggunakan username (bukan email). Schema di-generate otomatis dengan `bun x auth@latest generate`.

### Temuan Context7 (better-auth/better-auth v1.6.11)

#### Prisma Adapter Setup
```ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "@better-auth/prisma-adapter"
import { admin, username } from "better-auth/plugins"

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  plugins: [
    admin({
      adminRoles: ["admin"],
      defaultRole: "user",
    }),
    username(),
    nextCookies(),
  ],
  session: {
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
})
```

#### Admin Plugin — Fitur Utama
- Menambahkan field `role` (default: `"user"`), `banned` (boolean), `banReason`, dan `banExpires` ke tabel `user`.
- API built-in: `banUser`, `unbanUser`, `listUsers`, `setRole`.
- Ban otomatis me-revoke semua sesi user tersebut.
- Field `banned: true` = akun dinonaktifkan, login ditolak.

#### Username Plugin
- Memungkinkan login dengan username (selain email).
- Menambahkan field `username` (unique) ke tabel `user`.
- Mendukung `maxUsernameLength`, `minUsernameLength`, dll.

#### Schema Generation (Wajib)
Schema Prisma harus di-generate dari Better Auth — **jangan tulis manual**:
```bash
bun x auth@latest generate
```
Perintah ini membaca konfigurasi `auth.ts` dan menghasilkan model Prisma yang kompatibel (termasuk plugin admin dan username).

#### Peran Sistem
| Peran | Akses |
|---|---|
| `admin` | Manajemen pengguna, dokumen, kategori, semua laporan |
| `user` | Pencarian, riwayat pencarian, laporan pribadi |

#### Kontrol Akses di Server Components & Actions
```tsx
import { forbidden } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user.role !== 'admin') forbidden()
  return <AdminDashboard />
}
```

#### Proteksi Rute di proxy.ts
proxy.ts perlu diperbarui untuk:
1. Menolak akses ke `/dashboard/admin/**` jika role bukan `admin`
2. Menolak akses ke `/dashboard/**` jika tidak terautentikasi
3. Redirect ke role-appropriate dashboard setelah login

---

## 3. Prisma V7 + Neon Postgres

### Keputusan
Gunakan Prisma V7 dengan provider `prisma-client` (bukan `prisma-client-js` yang sudah deprecated). Output wajib ditentukan secara eksplisit. Gunakan `PrismaNeon` adapter dari `@prisma/adapter-neon`. Pola singleton di `lib/prisma.ts` sudah benar.

### Temuan Context7 (prisma/prisma v7.6.0 & websites/prisma_io)

#### Generator V7 (Breaking Change dari V6)
```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}
```
- ❌ `prisma-client-js` → **DEPRECATED** di V7
- ✅ `prisma-client` → Wajib di V7
- `output` bersifat **mandatory** di V7

#### Prisma Client Singleton (Neon)
Kode `lib/prisma.ts` yang sudah ada sudah benar:
```typescript
import { PrismaClient } from "@/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

#### Import dari Generated Path
Wajib import dari path yang dihasilkan, bukan dari package:
```typescript
import { PrismaClient } from "@/generated/prisma/client"
```

#### Koneksi Neon
- Gunakan satu `DATABASE_URL` (connection string pooled Neon).
- PrismaNeon menggunakan HTTP/WebSocket sesuai environment.

---

## 4. TF-IDF — Algoritma & Implementasi

### Keputusan
Gunakan pendekatan **pra-perhitungan (indexing)** sesuai keputusan klarifikasi: TF dan IDF dihitung dan disimpan di database saat dokumen ditambahkan/diperbarui/dihapus. Saat pencarian, hanya skor cosine similarity yang dihitung secara dinamis.

### Desain Algoritma TF-IDF

#### Rumus
- **TF(t, d)** = (frekuensi term t dalam dokumen d) / (total term dalam d)
- **IDF(t)** = log(total dokumen / dokumen yang mengandung term t + 1) + 1
- **TF-IDF(t, d)** = TF(t, d) × IDF(t)
- **Cosine Similarity** = Σ(TF-IDF_query × TF-IDF_doc) / (||query|| × ||doc||)

#### Pra-pemrosesan Teks (Bahasa Indonesia)
1. Lowercase semua teks
2. Hapus tanda baca dan karakter khusus
3. Tokenisasi (split by whitespace)
4. **Stopwords Bahasa Indonesia**: dan, atau, yang, di, ke, dari, dengan, adalah, ini, itu, untuk, pada, oleh, dalam, tidak, juga, akan, sudah, telah, lebih, dapat, bisa, ada, serta, tersebut, hal, bahwa, karena, sehingga, namun, tetapi, dll.
5. Simpan token yang tersisa sebagai terms

#### Skema Penyimpanan Index
```
DocumentTerm {
  id         String   (cuid)
  documentId String   (FK → Document)
  term       String
  tf         Float    (term frequency untuk dokumen ini)
  tfidf      Float    (nilai TF-IDF final)
}

GlobalTermIdf {
  term       String   (unique)
  idf        Float    (IDF global)
  docCount   Int      (jumlah dokumen yang mengandung term ini)
}
```

#### Alur Saat Dokumen Ditambahkan
1. Tokenisasi teks dokumen (judul + konten)
2. Hitung TF per term per dokumen
3. Update `docCount` di `GlobalTermIdf` untuk setiap term
4. **Recalculate IDF global** untuk semua term yang terpengaruh
5. Update `tfidf` di semua `DocumentTerm` yang terkait term tersebut
6. Invalidasi cache `tfidf-index` dengan `updateTag('tfidf-index')`

#### Alur Saat Pencarian
1. Tokenisasi kueri user (same preprocessing)
2. Lookup TF-IDF dokumen dari database (via cache jika tersedia)
3. Hitung cosine similarity antara kueri dan setiap dokumen
4. Sort descending berdasarkan similarity score
5. Kembalikan top-N hasil dengan skor relevansi

---

## 5. Shadcn UI + Tailwind CSS v4

### Keputusan
Gunakan Shadcn UI (`shadcn` v3.8.5) yang sudah terpasang di project. Tailwind CSS v4 (bukan v3) — sintaks konfigurasi berbeda. Framer Motion untuk animasi antarmuka.

### Catatan Penting
- Proyek menggunakan Tailwind CSS v4 (`@tailwindcss/postcss`, bukan `tailwind.config.js`)
- Shadcn sudah dikonfigurasi (`components.json` ada)
- Komponen Shadcn di-install per-kebutuhan dengan: `bunx shadcn@latest add [component]`
- Framer Motion: `bun add framer-motion`

---

## 6. UploadThing — Keputusan Tidak Digunakan

### Keputusan
**UploadThing TIDAK DIGUNAKAN** untuk fitur ini.

### Alasan
Sesuai spesifikasi (Assumptions): "Sistem tidak menangani pengunggahan file fisik (PDF, Word, dll.) — konten dokumen dimasukkan sebagai teks langsung oleh Administrator melalui antarmuka."

Tidak ada gambar atau file yang perlu di-upload dalam aplikasi e-Surat Search. UploadThing sudah terpasang di project (sebagai bagian dari starter template) tetapi tidak akan digunakan untuk fitur ini.

---

## 7. Strategi Caching Menyeluruh

### Cache Layers

| Layer | Mekanisme | Contoh |
|---|---|---|
| **Server Component Cache** | `'use cache'` + `cacheTag()` | DaftarDokumen, DaftarKategori, DaftarPengguna |
| **Data Function Cache** | `'use cache'` pada async functions | `getDokumenById()`, `getKategoriList()` |
| **TF-IDF Index Cache** | `'use cache'` + `cacheTag('tfidf-index')` | `getTfidfIndex()` |
| **Session Cache** | Better Auth cookieCache (5 min) | Session validation |

### Invalidasi Cache (Server Actions)
```ts
'use server'
import { updateTag } from 'next/cache'

export async function createDokumen(data) {
  await prisma.document.create({ data })
  await reindexDocument(...)
  updateTag('dokumen-list')
  updateTag('tfidf-index')
}

export async function deleteDokumen(id: string) {
  await prisma.document.delete({ where: { id } })
  await recalculateGlobalIdf()
  updateTag('dokumen-list')
  updateTag(`dokumen-${id}`)
  updateTag('tfidf-index')
}
```

---

## 8. Penanganan Brute-Force Login

### Implementasi
Better Auth tidak memiliki built-in rate limiting untuk login. Implementasi manual menggunakan `verification` table atau tabel `loginAttempt` custom:
- Track percobaan gagal per username/IP di database
- Setelah 5 percobaan gagal berturut-turut → set `lockedUntil` = now + 5 menit
- Cek `lockedUntil` sebelum memproses login
- Reset counter setelah login berhasil

---

## 9. Struktur Rute Aplikasi

```
/login                          → Halaman login (public)
/dashboard                      → Redirect ke role dashboard
/dashboard/pencarian            → Pencarian dokumen (user)
/dashboard/hasil/[historyId]    → Hasil pencarian dari riwayat (user)
/dashboard/riwayat              → Riwayat pencarian (user)
/dashboard/laporan              → Laporan pencarian (user)
/dashboard/admin                → Dasbor administrator (admin only)
/dashboard/admin/pengguna       → Manajemen pengguna (admin only)
/dashboard/admin/dokumen        → Manajemen dokumen (admin only)
/dashboard/admin/kategori       → Manajemen kategori (admin only)
```

---

## 10. Lingkungan & Environment Variables

```env
DATABASE_URL=                   # Neon Postgres connection string
BETTER_AUTH_SECRET=             # Secret untuk signing session
BETTER_AUTH_URL=                # URL aplikasi (untuk redirect)
NEXT_PUBLIC_APP_URL=            # Public URL (untuk CORS)
```
