# API Contracts: e-Surat Search

**Feature Branch**: `001-e-surat-search`
**Date**: 2026-06-28
**Pattern**: Next.js Server Actions (mutasi) + Server Components dengan `use cache` (baca)

> Aplikasi ini menggunakan **Server Actions** untuk semua mutasi data dan **Server Components** untuk pembacaan data. Tidak ada REST API endpoint publik kecuali route handler Better Auth (`/api/auth/**`).

---

## Konvensi Umum

- Semua Server Actions berada di direktori `app/(dashboard)/*/actions.ts`
- Semua fungsi cache data berada di `lib/data/*.ts` dengan `'use cache'`
- Pemanggil wajib memverifikasi sesi + peran sebelum memanggil action apapun
- Error dikembalikan sebagai `{ success: false, error: string }` atau dilempar ke `forbidden()` / `notFound()` dari Next.js

---

## 1. Autentikasi

### Better Auth Routes (Auto-generated)
| Route | Method | Deskripsi |
|---|---|---|
| `/api/auth/sign-in/username` | POST | Login dengan username + password |
| `/api/auth/sign-out` | POST | Logout, menghapus sesi |
| `/api/auth/get-session` | GET | Mendapatkan sesi aktif |

### Server Action: Verifikasi Sesi + Peran

```typescript
// lib/auth-helpers.ts
export async function requireSession() → Session | redirect('/login')
export async function requireAdmin() → Session | forbidden()
export async function requireUser() → Session | redirect('/login')
```

---

## 2. Manajemen Pengguna (Admin Only)

### Server Actions

```typescript
// app/(dashboard)/admin/pengguna/actions.ts

createUser(data: {
  name: string
  username: string
  email: string
  password: string
  role: 'admin' | 'user'
}) → { success: true, userId: string } | { success: false, error: string }

updateUser(userId: string, data: {
  name?: string
  email?: string
  role?: 'admin' | 'user'
}) → { success: true } | { success: false, error: string }

banUser(userId: string) → { success: true } | { success: false, error: string }
// Memanggil auth.api.banUser() → sesi langsung dicabut

unbanUser(userId: string) → { success: true } | { success: false, error: string }

deleteUser(userId: string) → { success: true } | { success: false, error: string }
```

### Cache Data Functions

```typescript
// lib/data/pengguna.ts

async function getUserList(): Promise<UserListItem[]>
  'use cache'
  cacheTag('pengguna-list')

async function getUserById(id: string): Promise<UserDetail | null>
  'use cache'
  cacheTag(`pengguna-${id}`)
```

### Invalidasi Cache
| Event | Tags Diinvalidasi |
|---|---|
| `createUser` | `pengguna-list` |
| `updateUser(id)` | `pengguna-list`, `pengguna-${id}` |
| `banUser(id)` | `pengguna-list`, `pengguna-${id}` |
| `unbanUser(id)` | `pengguna-list`, `pengguna-${id}` |
| `deleteUser(id)` | `pengguna-list`, `pengguna-${id}` |

---

## 3. Manajemen Kategori (Admin Only)

### Server Actions

```typescript
// app/(dashboard)/admin/kategori/actions.ts

createKategori(data: {
  name: string
  description?: string
}) → { success: true, kategoriId: string } | { success: false, error: string }
// Error jika nama duplikat

updateKategori(id: string, data: {
  name?: string
  description?: string
}) → { success: true } | { success: false, error: string }

deleteKategori(id: string) → { success: true } | { success: false, error: string }
// Error jika masih ada dokumen yang menggunakan kategori ini
```

### Cache Data Functions

```typescript
// lib/data/kategori.ts

async function getKategoriList(): Promise<Kategori[]>
  'use cache'
  cacheTag('kategori-list')

async function getKategoriById(id: string): Promise<Kategori | null>
  'use cache'
  cacheTag(`kategori-${id}`)
```

### Invalidasi Cache
| Event | Tags Diinvalidasi |
|---|---|
| `createKategori` | `kategori-list` |
| `updateKategori(id)` | `kategori-list`, `kategori-${id}` |
| `deleteKategori(id)` | `kategori-list`, `kategori-${id}` |

---

## 4. Manajemen Dokumen (Admin Only)

### Server Actions

```typescript
// app/(dashboard)/admin/dokumen/actions.ts

createDokumen(data: {
  title: string
  documentNumber: string
  content: string
  documentDate: Date
  categoryId: string
}) → { success: true, dokumentId: string } | { success: false, error: string }
// Setelah create: triggerTfidfIndexing(dokumentId)

updateDokumen(id: string, data: {
  title?: string
  documentNumber?: string
  content?: string
  documentDate?: Date
  categoryId?: string
}) → { success: true } | { success: false, error: string }
// Setelah update: triggerTfidfReindexing(id)

deleteDokumen(id: string) → { success: true } | { success: false, error: string }
// Setelah delete: recalculateGlobalIdf()
```

### Cache Data Functions

```typescript
// lib/data/dokumen.ts

async function getDokumenList(params?: {
  categoryId?: string
  page?: number
  pageSize?: number
}): Promise<PaginatedResult<DokumenListItem>>
  'use cache'
  cacheTag('dokumen-list')

async function getDokumenById(id: string): Promise<DokumenDetail | null>
  'use cache'
  cacheTag(`dokumen-${id}`)

async function getDokumenCount(): Promise<number>
  'use cache'
  cacheTag('dokumen-list')
```

### Invalidasi Cache
| Event | Tags Diinvalidasi |
|---|---|
| `createDokumen` | `dokumen-list`, `tfidf-index` |
| `updateDokumen(id)` | `dokumen-list`, `dokumen-${id}`, `tfidf-index` |
| `deleteDokumen(id)` | `dokumen-list`, `dokumen-${id}`, `tfidf-index` |

---

## 5. Pencarian TF-IDF (User)

### Server Action

```typescript
// app/(dashboard)/pencarian/actions.ts

searchDokumen(query: string): Promise<{
  historyId: string
  results: SearchResultItem[]
}>
// SearchResultItem = { document: DokumenSummary, relevanceScore: number, rank: number }
// Secara otomatis menyimpan ke SearchHistory + SearchResult
// Invalidasi cache: updateTag(`riwayat-${userId}`), updateTag(`laporan-${userId}`)
```

### TF-IDF Engine Functions

```typescript
// lib/tfidf/engine.ts

async function getTfidfIndex(): Promise<TfidfIndex>
  'use cache'
  cacheTag('tfidf-index')
  // Membaca semua DocumentTerm + GlobalTermIdf dari database

async function computeSearchResults(
  query: string,
  index: TfidfIndex
): Promise<RankedResult[]>
// Pure function, tidak ada I/O database (hanya kalkulasi)

async function triggerTfidfIndexing(documentId: string): Promise<void>
// Tokenisasi, hitung TF, update GlobalTermIdf, update DocumentTerm, recalculate IDF global

async function recalculateGlobalIdf(): Promise<void>
// Dijalankan setelah delete dokumen
```

---

## 6. Riwayat Pencarian (User)

### Cache Data Functions

```typescript
// lib/data/riwayat.ts

async function getRiwayatList(userId: string): Promise<RiwayatItem[]>
  'use cache'
  cacheTag(`riwayat-${userId}`)

async function getRiwayatDetail(historyId: string, userId: string): Promise<RiwayatDetail | null>
  'use cache'
  cacheTag(`riwayat-detail-${historyId}`)
```

---

## 7. Laporan Pencarian (User)

### Cache Data Functions

```typescript
// lib/data/laporan.ts

async function getLaporanRingkasan(userId: string): Promise<LaporanRingkasan>
  'use cache'
  cacheTag(`laporan-${userId}`)
  cacheLife('minutes')
  // LaporanRingkasan = {
  //   totalPencarian: number
  //   kataKunciTersering: { query: string, count: number }[]
  //   trenHarian: { date: string, count: number }[]
  // }
```

---

## 8. Tipe Data Bersama

```typescript
// types/index.ts

type UserListItem = {
  id: string
  name: string
  username: string
  email: string
  role: 'admin' | 'user'
  banned: boolean
  createdAt: Date
}

type DokumenListItem = {
  id: string
  title: string
  documentNumber: string
  documentDate: Date
  category: { id: string; name: string }
}

type DokumenDetail = DokumenListItem & {
  content: string
  createdById: string
  updatedById: string | null
  createdAt: Date
  updatedAt: Date
}

type SearchResultItem = {
  document: DokumenListItem
  relevanceScore: number
  rank: number
}

type RiwayatItem = {
  id: string
  query: string
  resultCount: number
  createdAt: Date
}

type RiwayatDetail = RiwayatItem & {
  results: SearchResultItem[]
}
```
