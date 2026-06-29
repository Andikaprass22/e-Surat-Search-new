# Tasks: e-Surat Search

**Input**: Design documents dari `/specs/001-e-surat-search/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Stack**: Next.js 16, Shadcn UI, Framer Motion, Neon Postgres, Prisma V7, Better Auth
**Aturan Kode**:
- Dilarang menulis komentar di kode
- Semua dependency install dengan `bun` (bukan npm/yarn/pnpm)
- Gunakan `'use cache'` bukan `force-static`/`force-dynamic`
- Gunakan `updateTag` dari Server Actions, `revalidateTag` dari Route Handlers
- Prisma: provider `prisma-client`, output wajib ditentukan
- Better Auth: schema di-generate dengan `bun x auth@latest generate`
- UploadThing TIDAK digunakan

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Dapat dijalankan paralel (file berbeda, tanpa dependensi antar satu sama lain)
- **[Story]**: User story terkait (US1–US6)

---

## Phase 1: Setup (Infrastruktur Bersama)

**Tujuan**: Konfigurasi proyek, environment, dan dependency dasar

- [x] T001 Aktifkan `experimental.dynamicIO: true` di `next.config.ts` agar `'use cache'` directive berfungsi di Next.js 16
- [x] T002 Install Framer Motion: jalankan `bun add framer-motion` di terminal
- [x] T003 Install TanStack Table untuk data table: jalankan `bun add @tanstack/react-table` di terminal
- [x] T004 [P] Install komponen Shadcn yang dibutuhkan: jalankan `bunx shadcn@latest add button input label card table badge dialog alert separator sheet skeleton toast dropdown-menu` di terminal
- [x] T005 [P] Install komponen Shadcn sidebar dan form: jalankan `bunx shadcn@latest add sidebar form select textarea` di terminal
- [x] T006 [P] Buat file `types/index.ts` dengan semua shared types: `UserListItem`, `DokumenListItem`, `DokumenDetail`, `SearchResultItem`, `RiwayatItem`, `RiwayatDetail`, `LaporanRingkasan`
- [x] T007 Buat file `lib/constants.ts` berisi konstanta aplikasi: `STOPWORDS_BI` (daftar stopwords Bahasa Indonesia), `APP_NAME`, `ROLES`, `CACHE_TAGS`
- [x] T008 Buat file `lib/tfidf/stopwords.ts` berisi array stopwords Bahasa Indonesia lengkap (dan, atau, yang, di, ke, dari, dengan, adalah, ini, itu, untuk, pada, oleh, dalam, tidak, juga, akan, sudah, telah, lebih, dapat, bisa, ada, serta, tersebut, hal, bahwa, karena, sehingga, namun, tetapi, saat, ketika, juga, hanya, sangat, selalu, setiap, tentang, antara, setelah, sebelum, hingga, bahkan, seperti, secara, maupun, kemudian, serta, demi, sesuai, sehingga, agar, bila, jika, maka, lalu, pun, atas, bawah, depan, belakang, sekitar)
- [x] T009 [P] Buat file `lib/tfidf/tokenizer.ts` dengan fungsi `tokenize(text: string): string[]` yang melakukan: lowercase, hapus tanda baca, split whitespace, filter stopwords, filter token < 2 karakter
- [x] T010 [P] Buat file `lib/tfidf/engine.ts` dengan fungsi `triggerTfidfIndexing`, `recalculateGlobalIdf`, `computeSearchResults`, `getTfidfIndex` — semuanya sebagai async functions yang berinteraksi dengan Prisma

**Checkpoint**: Infrastruktur dasar siap, dependency terinstall, tipe dan utilities tersedia

---

## Phase 2: Foundational (Prasyarat Blokir)

**Tujuan**: Database schema, autentikasi, dan routing — HARUS selesai sebelum user story apapun

⚠️ **KRITIS**: Tidak ada implementasi user story yang dapat dimulai sebelum phase ini selesai

- [x] T011 Update `lib/auth.ts`: tambahkan plugin `admin` (adminRoles: ["admin"], defaultRole: "user") dan plugin `username()` ke konfigurasi Better Auth yang sudah ada
- [x] T012 Jalankan `bun x auth@latest generate` di terminal untuk generate schema Prisma dari konfigurasi Better Auth (menghasilkan model user dengan field role, banned, username, dll.)
- [x] T013 Update `lib/auth-client.ts`: tambahkan `adminClient` dari `better-auth/client/plugins` ke `createAuthClient`
- [x] T014 Tambahkan model bisnis ke `prisma/schema.prisma` setelah schema Better Auth: `Category`, `Document`, `DocumentTerm`, `GlobalTermIdf`, `SearchHistory`, `SearchResult`, `LoginAttempt` (sesuai data-model.md)
- [x] T015 Jalankan `bun run db:generate` di terminal untuk generate Prisma Client dari schema terbaru
- [x] T016 Jalankan `bun run db:migrate` di terminal untuk membuat tabel di Neon Postgres
- [x] T017 Update `prisma/seed.ts`: buat akun Administrator awal menggunakan `auth.api.createUser` dengan role `admin`, username `admin`, dan password default
- [x] T018 Jalankan `bun run db:seed` di terminal untuk mengisi data Administrator awal
- [x] T019 Update `proxy.ts`: tambahkan proteksi rute berbasis peran — redirect ke `/` jika mengakses `/dashboard/admin/**` dengan role bukan `admin`, tetap pertahankan logika CORS dan redirect login yang sudah ada
- [x] T020 [P] Buat `lib/auth-helpers.ts` dengan fungsi `requireSession()`, `requireAdmin()`, `requireUser()` — masing-masing memanggil `auth.api.getSession` dari `next/headers` dan melempar `redirect` atau `forbidden()` jika tidak memenuhi syarat. **Penting**: untuk mutasi kritikal, verifikasi status `banned` langsung ke database (bypass 5-menit cookie cache).
- [x] T021 [P] Buat struktur direktori lengkap sesuai plan.md: `lib/data/`, `lib/tfidf/`, `components/layout/`, `components/dokumen/`, `components/kategori/`, `components/pengguna/`, `components/pencarian/`, `components/laporan/`, `types/`
- [x] T022 Buat `app/(dashboard)/layout.tsx`: layout wrapper yang memanggil `requireSession()`, menampilkan `AppSidebar` dengan navigasi berbasis role, dan membungkus children dengan `SidebarProvider`
- [x] T023 [P] Buat `components/layout/app-sidebar.tsx`: sidebar menggunakan komponen Shadcn `Sidebar` — menampilkan menu berbeda untuk role `admin` vs `user`, menggunakan Framer Motion untuk animasi hover item menu
- [x] T024 [P] Buat `components/layout/header.tsx`: header dengan nama pengguna aktif, badge role, dan tombol logout yang memanggil `authClient.signOut()`

**Checkpoint**: Foundation siap — database tersedia, autentikasi berfungsi, routing terproteksi, layout dasar ada

---

## Phase 3: User Story 1 — Autentikasi dan Kontrol Akses (Priority: P1) 🎯 MVP

**Goal**: Administrator dan Pengguna dapat login dan mengakses fitur sesuai perannya

**Independent Test**: Login sebagai admin → dasbor admin muncul. Login sebagai user → halaman pencarian muncul. User tidak bisa akses `/dashboard/admin`. Sesi expired → redirect ke login.

### Implementasi US1

- [ ] T025 [US1] Buat `app/(public)/login/page.tsx`: halaman login dengan form username + password, animasi Framer Motion `initial={{ opacity: 0, y: 20 }}` pada card login, teks seluruhnya Bahasa Indonesia
- [ ] T026 [US1] Buat `app/(public)/login/actions.ts`: Server Action `loginAction(formData)` yang: (1) cek LoginAttempt — tolak jika `lockedUntil` masih aktif dengan pesan error Bahasa Indonesia, (2) panggil `auth.api.signInWithUsername`, (3) reset counter jika berhasil, (4) increment counter dan set lock jika gagal (kunci 5 menit setelah 5 percobaan)
- [ ] T027 [US1] Buat `app/(dashboard)/dashboard/page.tsx`: redirect ke `/dashboard/admin` jika role `admin`, redirect ke `/dashboard/pencarian` jika role `user`
- [ ] T028 [US1] Buat `app/(dashboard)/admin/layout.tsx`: memanggil `requireAdmin()`, tampilkan forbidden jika bukan admin
- [ ] T029 [US1] Buat `app/forbidden.tsx`: halaman 403 dengan pesan Bahasa Indonesia dan tombol kembali ke dashboard, animasi Framer Motion
- [ ] T030 [US1] Buat `app/not-found.tsx`: halaman 404 dengan pesan Bahasa Indonesia dan tombol kembali

**Checkpoint**: Login, logout, redirect berbasis role, dan brute-force protection berfungsi penuh

---

## Phase 4: User Story 2 — Manajemen Pengguna oleh Administrator (Priority: P2)

**Goal**: Administrator dapat membuat, melihat, memperbarui, menonaktifkan, dan menghapus akun Pengguna

**Independent Test**: Buat user baru dari UI admin → login dengan user tersebut berhasil. Ban user → login ditolak. Unban → login berhasil. Hapus → user hilang dari daftar.

### Implementasi US2

- [ ] T031 [P] [US2] Buat `lib/data/pengguna.ts`: fungsi `getUserList()` dan `getUserById(id)` dengan `'use cache'` + `cacheTag('pengguna-list')` / `cacheTag(\`pengguna-\${id}\`)`
- [ ] T032 [US2] Buat `app/(dashboard)/admin/pengguna/actions.ts`: Server Actions `createUser`, `updateUser`, `banUser`, `unbanUser`, `deleteUser` — masing-masing memanggil `requireAdmin()`, melakukan operasi via `auth.api.*`, lalu `updateTag` cache yang relevan (`pengguna-list`, `pengguna-\${id}`)
- [ ] T033 [US2] Buat `app/(dashboard)/admin/pengguna/page.tsx`: Server Component yang memanggil `getUserList()`, tampilkan dalam tabel menggunakan Shadcn Table, dengan kolom nama, username, email, role, status (badge), dan aksi (dropdown menu)
- [ ] T034 [P] [US2] Buat `components/pengguna/pengguna-table.tsx`: Client Component (`"use client"`) dengan DataTable menggunakan `@tanstack/react-table`, kolom-kolom sesuai `UserListItem`, dengan sorting dan filtering
- [ ] T035 [US2] Buat `components/pengguna/pengguna-form-dialog.tsx`: Client Component dialog Shadcn untuk tambah/edit pengguna, dengan form fields: nama, username, email, password (hanya saat buat baru), role (select); menggunakan `useActionState` dengan Server Action
- [ ] T036 [P] [US2] Buat `components/pengguna/ban-confirm-dialog.tsx`: dialog konfirmasi untuk ban/unban/hapus pengguna dengan animasi Framer Motion `AnimatePresence`

**Checkpoint**: CRUD pengguna oleh admin berfungsi penuh, ban/unban bekerja, cache terinvalidasi dengan benar

---

## Phase 5: User Story 3 — Manajemen Kategori Dokumen (Priority: P3)

**Goal**: Administrator dapat membuat, melihat, memperbarui, dan menghapus kategori dokumen

**Independent Test**: Buat kategori baru → muncul di daftar. Edit → perubahan tersimpan. Hapus kategori yang memiliki dokumen → error ditampilkan. Hapus kategori kosong → berhasil.

### Implementasi US3

- [ ] T037 [P] [US3] Buat `lib/data/kategori.ts`: fungsi `getKategoriList()` dan `getKategoriById(id)` dengan `'use cache'` + `cacheTag('kategori-list')` / `cacheTag(\`kategori-\${id}\`)`
- [ ] T038 [US3] Buat `app/(dashboard)/admin/kategori/actions.ts`: Server Actions `createKategori`, `updateKategori`, `deleteKategori` — `deleteKategori` wajib cek apakah kategori masih memiliki dokumen (`prisma.document.count`), tolak dengan error jika ada; masing-masing panggil `updateTag` setelah mutasi
- [ ] T039 [US3] Buat `app/(dashboard)/admin/kategori/page.tsx`: Server Component tampilkan daftar kategori dalam tabel Shadcn dengan kolom nama, deskripsi, jumlah dokumen, dan aksi (edit/hapus)
- [ ] T040 [P] [US3] Buat `components/kategori/kategori-form-dialog.tsx`: dialog untuk tambah/edit kategori dengan field nama dan deskripsi opsional

**Checkpoint**: CRUD kategori berfungsi, proteksi penghapusan kategori dengan dokumen aktif

---

## Phase 6: User Story 4 — Manajemen Dokumen oleh Administrator (Priority: P4)

**Goal**: Administrator dapat menambahkan, melihat, memperbarui, dan menghapus dokumen

**Independent Test**: Tambah dokumen baru → muncul di daftar dan TF-IDF ter-index. Edit → perubahan tersimpan dan re-indexed. Hapus → hilang dari daftar dan dari hasil pencarian.

### Implementasi US4

- [ ] T041 [P] [US4] Buat `lib/data/dokumen.ts`: fungsi `getDokumenList(params?)` dan `getDokumenById(id)` dengan `'use cache'` + `cacheTag('dokumen-list')` / `cacheTag(\`dokumen-\${id}\`)`
- [ ] T042 [US4] Buat `app/(dashboard)/admin/dokumen/actions.ts`: Server Actions `createDokumen`, `updateDokumen`, `deleteDokumen` — setelah create/update panggil `triggerTfidfIndexing(id)`, setelah delete panggil `recalculateGlobalIdf()`; setiap action `updateTag(['dokumen-list', 'tfidf-index'])` dan `updateTag(\`dokumen-\${id}\`)` jika relevan
- [ ] T043 [US4] Implementasi fungsi `triggerTfidfIndexing(documentId: string)` di `lib/tfidf/engine.ts`: (1) ambil konten dokumen, (2) tokenisasi judul+konten, (3) hitung TF per term, (4) upsert `DocumentTerm` di database, (5) panggil `recalculateGlobalIdf()`
- [ ] T044 [P] [US4] Implementasi fungsi `recalculateGlobalIdf(affectedTerms?: string[])` di `lib/tfidf/engine.ts`: (1) hitung total dokumen, (2) untuk setiap *affected term* (atau semua jika kosong), group DocumentTerm by term → dapat docCount, (3) hitung IDF = log(totalDokumen / docCount + 1) + 1, (4) upsert hanya `GlobalTermIdf` yang terpengaruh, (5) update nilai `tfidf` di `DocumentTerm` = TF × IDF. *(Optimasi ini wajib agar tidak memblokir server saat CRUD pada skala 10.000 dokumen)*
- [ ] T045 [US4] Buat `app/(dashboard)/admin/dokumen/page.tsx`: Server Component tampilkan daftar dokumen dalam DataTable dengan kolom judul, nomor surat, tanggal, kategori, dan aksi
- [ ] T046 [P] [US4] Buat `app/(dashboard)/admin/dokumen/[id]/page.tsx`: halaman detail dokumen dengan semua informasi lengkap
- [ ] T047 [P] [US4] Buat `components/dokumen/dokumen-form.tsx`: form tambah/edit dokumen dengan fields: judul, nomor surat, tanggal (date picker), konten (textarea), kategori (select dari `getKategoriList()`); menggunakan `useActionState`
- [ ] T048 [P] [US4] Buat `components/dokumen/dokumen-table.tsx`: DataTable Client Component untuk daftar dokumen dengan sorting, filtering per kategori
- [ ] T049 [US4] Buat `app/(dashboard)/admin/page.tsx`: dasbor admin dengan statistik: jumlah dokumen, kategori, pengguna aktif — data dari cached functions dengan Framer Motion stagger animation pada card statistik

**Checkpoint**: CRUD dokumen berfungsi penuh, TF-IDF auto-indexed setiap mutasi dokumen

---

## Phase 7: User Story 5 — Pencarian Dokumen dengan TF-IDF (Priority: P5)

**Goal**: Pengguna dapat mencari dokumen dengan kata kunci, hasil diurutkan berdasarkan skor relevansi TF-IDF

**Independent Test**: Masukkan kata kunci yang ada di salah satu dokumen → dokumen tersebut muncul di urutan #1 dengan skor relevansi tertinggi. Kata kunci tidak ditemukan → pesan "tidak ditemukan" muncul. Setelah pencarian → riwayat tersimpan otomatis.

### Implementasi US5

- [ ] T050 [US5] Implementasi fungsi `getTfidfIndex()` di `lib/tfidf/engine.ts`: async function dengan `'use cache'` + `cacheTag('tfidf-index')` + `cacheLife('hours')` — query semua `DocumentTerm` dan `GlobalTermIdf` dari Prisma, kembalikan sebagai `TfidfIndex` map
- [ ] T051 [P] [US5] Implementasi fungsi `computeSearchResults(query: string, index: TfidfIndex, userId: string)` di `lib/tfidf/engine.ts`: (1) tokenisasi query, (2) untuk setiap dokumen di index hitung cosine similarity, (3) sort descending, (4) simpan ke `SearchHistory` + `SearchResult` di Prisma, (5) invalidasi `updateTag(\`riwayat-\${userId}\`)` dan `updateTag(\`laporan-\${userId}\`)`, (6) kembalikan hasil terurut
- [ ] T052 [US5] Buat `app/(dashboard)/pencarian/actions.ts`: Server Action `searchDokumenAction(query: string)` — panggil `requireUser()`, validasi input (tidak boleh kosong, max 500 karakter), panggil `getTfidfIndex()` lalu `computeSearchResults()`, kembalikan `{ historyId, results }`
- [ ] T053 [US5] Buat `app/(dashboard)/pencarian/page.tsx`: Server Component halaman pencarian dengan `SearchBar` dan area hasil
- [ ] T054 [P] [US5] Buat `components/pencarian/search-bar.tsx`: Client Component dengan input pencarian, tombol cari, state loading menggunakan `useActionState`, animasi Framer Motion pada tombol dan input focus
- [ ] T055 [P] [US5] Buat `components/pencarian/search-results.tsx`: Client Component menampilkan hasil pencarian — setiap hasil tampilkan `SearchResultCard` dengan judul, nomor surat, tanggal, kategori, dan skor relevansi (progress bar visual); animasi `staggerChildren` Framer Motion untuk tiap kartu muncul bertahap
- [ ] T056 [P] [US5] Buat `components/pencarian/search-result-card.tsx`: Card komponen untuk satu hasil pencarian — tampilkan badge skor relevansi (0–100%), highlight informasi dokumen; animasi `whileHover={{ scale: 1.01 }}` dan `motion.div` dengan `initial={{ opacity: 0, y: 20 }}`
- [ ] T057 [P] [US5] Buat `components/pencarian/empty-search.tsx`: komponen tampilan saat tidak ada hasil pencarian atau belum ada pencarian, dengan ilustrasi dan teks Bahasa Indonesia

**Checkpoint**: Pencarian TF-IDF berfungsi, hasil terurut berdasarkan relevansi, riwayat tersimpan otomatis, UI responsif dengan animasi

---

## Phase 8: User Story 6 — Riwayat dan Laporan Pencarian (Priority: P6)

**Goal**: Pengguna dapat melihat riwayat pencarian sebelumnya dan laporan ringkasan aktivitas pencarian

**Independent Test**: Buka riwayat → daftar pencarian muncul dengan kata kunci dan waktu. Klik entri → hasil pencarian terkait tampil. Buka laporan → jumlah pencarian dan kata kunci tersering tersedia.

### Implementasi US6

- [ ] T058 [P] [US6] Buat `lib/data/riwayat.ts`: fungsi `getRiwayatList(userId: string)` dengan `'use cache'` + `cacheTag(\`riwayat-\${userId}\`)`, dan `getRiwayatDetail(historyId, userId)` dengan `cacheTag(\`riwayat-detail-\${historyId}\`)`
- [ ] T059 [P] [US6] Buat `lib/data/laporan.ts`: fungsi `getLaporanRingkasan(userId: string)` dengan `'use cache'` + `cacheTag(\`laporan-\${userId}\`)` + `cacheLife('minutes')` — hitung total pencarian, top 10 kata kunci tersering, tren 7 hari terakhir dari `SearchHistory`
- [ ] T060 [US6] Buat `app/(dashboard)/riwayat/page.tsx`: Server Component yang memanggil `requireUser()` dan `getRiwayatList(userId)`, tampilkan daftar riwayat dalam tabel/list dengan tanggal, kata kunci, dan jumlah hasil; setiap baris dapat diklik untuk lihat detail
- [ ] T061 [US6] Buat `app/(dashboard)/riwayat/[id]/page.tsx`: Server Component yang memanggil `getRiwayatDetail(id, userId)`, tampilkan kembali hasil pencarian menggunakan `SearchResultCard` yang sama dari US5 — data dari Prisma via cache
- [ ] T062 [US6] Buat `app/(dashboard)/laporan/page.tsx`: Server Component yang memanggil `getLaporanRingkasan(userId)`, tampilkan ringkasan: jumlah total pencarian (stat card), daftar kata kunci tersering (badge list), tren pencarian harian (sederhana: list dengan tanggal dan jumlah); semua teks Bahasa Indonesia
- [ ] T063 [P] [US6] Buat `components/laporan/laporan-stats-card.tsx`: Client Component card statistik dengan Framer Motion counter animation untuk angka total pencarian
- [ ] T064 [P] [US6] Buat `components/laporan/keyword-trend-list.tsx`: menampilkan daftar kata kunci tersering dengan badge frekuensi, animasi stagger masuk

**Checkpoint**: Riwayat pencarian dapat diakses, detail riwayat menampilkan hasil sebelumnya, laporan ringkasan tersedia

---

## Phase 9: Polish & Cross-Cutting Concerns

**Tujuan**: Pemoles UI, konsistensi Bahasa Indonesia, loading states, dan pengalaman pengguna

- [ ] T065 Buat `app/loading.tsx` global loading skeleton menggunakan Shadcn `Skeleton` + Framer Motion pulse
- [ ] T066 [P] Buat `app/(dashboard)/pencarian/loading.tsx`: skeleton khusus halaman pencarian (search bar placeholder + result card skeletons)
- [ ] T067 [P] Buat `app/(dashboard)/admin/dokumen/loading.tsx`: skeleton tabel dokumen
- [ ] T068 [P] Buat `app/(dashboard)/admin/pengguna/loading.tsx`: skeleton tabel pengguna
- [ ] T069 Buat `components/ui/confirm-dialog.tsx`: komponen dialog konfirmasi reusable dengan `AnimatePresence` Framer Motion — digunakan untuk hapus dokumen, kategori, dan pengguna
- [ ] T070 [P] Buat `components/ui/page-header.tsx`: header halaman reusable dengan judul, deskripsi opsional, dan slot action button; animasi `initial={{ opacity: 0, x: -10 }}`
- [ ] T071 [P] Buat `components/ui/stat-card.tsx`: card statistik reusable untuk dasbor admin dan laporan
- [ ] T072 Audit semua teks UI: pastikan seluruh label, pesan error, pesan sukses, placeholder, dan teks antarmuka menggunakan Bahasa Indonesia
- [ ] T073 [P] Pastikan semua form memiliki validasi client-side dengan pesan error Bahasa Indonesia dan validasi server-side di Server Actions
- [ ] T074 Jalankan `bun run typecheck` untuk memastikan tidak ada TypeScript error
- [ ] T075 Jalankan `bun run build` untuk memastikan production build berhasil tanpa error
- [ ] T076 Lakukan manual end-to-end verification sesuai Verification Plan di `plan.md`: autentikasi, manajemen pengguna, CRUD dokumen/kategori, pencarian TF-IDF, riwayat, laporan, brute-force protection
- [ ] T077 Buat skrip `prisma/seed-mock.ts` untuk men-*generate* 10.000 dokumen percobaan dan catat waktu eksekusi pencarian untuk memvalidasi SC-001 (Pencarian < 5 detik).

---

## Dependencies & Urutan Eksekusi

### Dependensi Phase

- **Phase 1 (Setup)**: Tidak ada dependensi — dapat dimulai segera
- **Phase 2 (Foundational)**: Bergantung pada selesainya Phase 1 — **memblokir semua user story**
- **Phase 3–8 (User Stories)**: Semua bergantung pada selesainya Phase 2
  - US3 (Kategori) harus selesai sebelum US4 (Dokumen) — karena dokumen membutuhkan kategori
  - US4 (Dokumen) harus selesai sebelum US5 (Pencarian) — karena pencarian membutuhkan dokumen ter-index
  - US5 (Pencarian) harus selesai sebelum US6 (Riwayat) — karena riwayat membutuhkan data pencarian
  - US1 (Autentikasi) dan US2 (Pengguna) dapat dikerjakan paralel setelah Phase 2
- **Phase 9 (Polish)**: Bergantung pada semua user story selesai

### Dependensi Antar User Story

```
Phase 2 Foundational
    ↓
US1 (Autentikasi) ←→ US2 (Pengguna) [bisa paralel]
                           ↓
                    US3 (Kategori)
                           ↓
                    US4 (Dokumen + TF-IDF Index)
                           ↓
                    US5 (Pencarian TF-IDF)
                           ↓
                    US6 (Riwayat + Laporan)
```

### Dependensi dalam Setiap Task Group

- T012 (generate auth schema) → T014 (tambah model bisnis) → T015 (generate prisma) → T016 (migrate)
- T043 + T044 (TF-IDF engine) → T052 (search action) → T053–T057 (UI pencarian)
- T058 + T059 (data functions) → T060–T064 (riwayat & laporan UI)

---

## Contoh Eksekusi Paralel

### Phase 1 — Paralel setelah T001
```
T001 (next.config.ts) selesai, lalu:
├── T002 bun add framer-motion
├── T003 bun add @tanstack/react-table
├── T004 bunx shadcn add [komponen batch 1]
├── T005 bunx shadcn add [komponen batch 2]
├── T006 types/index.ts
├── T007 lib/constants.ts
├── T008 lib/tfidf/stopwords.ts
├── T009 lib/tfidf/tokenizer.ts
└── T010 lib/tfidf/engine.ts (stub)
```

### Phase 2 — Paralel setelah T016 selesai
```
T019 (proxy.ts update)
├── T020 lib/auth-helpers.ts
├── T021 struktur direktori
├── T022 dashboard layout
├── T023 app-sidebar.tsx
└── T024 header.tsx
```

### Phase 6 — Paralel dalam US4
```
T042 (actions) selesai, lalu:
├── T043 triggerTfidfIndexing
├── T044 recalculateGlobalIdf
├── T045 dokumen/page.tsx
├── T046 dokumen/[id]/page.tsx
├── T047 dokumen-form.tsx
├── T048 dokumen-table.tsx
└── T049 admin/page.tsx
```

---

## Strategi Implementasi

### MVP Pertama (User Story 1 Saja)

1. Selesaikan Phase 1: Setup
2. Selesaikan Phase 2: Foundational (KRITIS — memblokir semua story)
3. Selesaikan Phase 3: User Story 1 (Autentikasi)
4. **BERHENTI dan VALIDASI**: Test login admin/user, proteksi rute
5. Deploy/demo jika siap

### Pengiriman Inkremental

1. Setup + Foundational → Foundation siap
2. US1 (Autentikasi) → Login berfungsi → Demo
3. US2 (Pengguna) → Manajemen pengguna berfungsi → Demo
4. US3 (Kategori) → Kategori tersedia → Demo
5. US4 (Dokumen + TF-IDF) → Dokumen ter-index → Demo
6. US5 (Pencarian) → Pencarian berfungsi → **Fitur inti siap!** → Demo
7. US6 (Riwayat + Laporan) → Riwayat & laporan berfungsi → Demo
8. Polish → Production ready

---

## Catatan

- [P] = file berbeda, tidak ada dependensi antar task tersebut — dapat dikerjakan serentak
- Label [Story] memetakan task ke user story spesifik untuk keterlacakan
- Setiap user story dapat diimplementasikan dan diuji secara independen
- Commit setelah setiap task atau grup logis
- Berhenti di setiap checkpoint untuk validasi story secara independen
- **Dilarang komentar di kode** sesuai aturan proyek
- **Semua dependency install dengan `bun`** (bukan npm/yarn/pnpm)
- Semua teks UI dalam **Bahasa Indonesia**
