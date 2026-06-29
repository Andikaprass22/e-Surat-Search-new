# Data Model: e-Surat Search

**Feature Branch**: `001-e-surat-search`
**Date**: 2026-06-28
**Database**: Neon Postgres (Prisma V7)

---

## Skema Prisma Lengkap

> **Catatan**: Model `user`, `session`, `account`, `verification`, `deviceSession` di-generate oleh Better Auth CLI (`bun x auth@latest generate`) dan mencakup field tambahan dari plugin `admin` (role, banned, banReason, banExpires) dan plugin `username` (username).
> Model bisnis di bawah ini ditulis manual di `schema.prisma` setelah schema Better Auth di-generate.

---

### Model Bisnis

#### Kategori (Category)

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
```

**Aturan**:
- `name` bersifat unik — tidak boleh ada dua kategori dengan nama sama.
- Tidak dapat dihapus jika masih memiliki dokumen terkait (FR-014 + klarifikasi: cegah penghapusan).
- Relasi One-to-Many ke `Document`.

---

#### Dokumen (Document)

```prisma
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
  @@index([documentDate])
  @@map("documents")
}
```

**Aturan**:
- `documentNumber` (nomor surat) bersifat unik.
- `content` berupa teks panjang (PostgreSQL `TEXT`).
- `createdById` dan `updatedById` referensi ke `user.id` (Better Auth user) — disimpan sebagai String, bukan foreign key langsung untuk menghindari konflik dengan Better Auth.
- Saat dihapus, semua `DocumentTerm` dan `SearchResult` terkait akan terhapus (cascade).

---

#### Index TF-IDF per Dokumen (DocumentTerm)

```prisma
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
```

**Aturan**:
- Satu baris per kombinasi (dokumen, term).
- `tf` = term frequency dalam dokumen ini.
- `tfidf` = nilai TF-IDF final (TF × IDF global).
- Dihitung ulang setiap kali dokumen ditambahkan/diubah/dihapus.
- Cascade delete saat dokumen induknya dihapus.

---

#### IDF Global per Term (GlobalTermIdf)

```prisma
model GlobalTermIdf {
  term     String @id
  idf      Float
  docCount Int

  @@map("global_term_idf")
}
```

**Aturan**:
- Satu baris per term unik di seluruh corpus.
- `docCount` = jumlah dokumen yang mengandung term ini.
- `idf` = log(totalDokumen / docCount + 1) + 1.
- Di-update setiap kali ada perubahan dokumen (tambah/hapus).

---

#### Riwayat Pencarian (SearchHistory)

```prisma
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
```

**Aturan**:
- Setiap pencarian yang berhasil dijalankan otomatis tersimpan (FR-025).
- `userId` = referensi ke `user.id` dari Better Auth (String, bukan FK langsung).
- `resultCount` = jumlah dokumen yang ditemukan dalam pencarian ini.
- Riwayat bersifat individual per pengguna — tidak ada riwayat lintas pengguna.

---

#### Hasil Pencarian per Entri Riwayat (SearchResult)

```prisma
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
```

**Aturan**:
- Menyimpan dokumen mana saja yang muncul dalam satu pencarian beserta skor relevansinya.
- `relevanceScore` = nilai cosine similarity yang dihitung saat pencarian.
- `rank` = urutan dalam hasil (1 = paling relevan).
- Cascade delete saat riwayat pencarian induknya dihapus.
- Cascade delete saat dokumen yang direferensi dihapus.

---

#### Percobaan Login Gagal (LoginAttempt) — Brute Force Protection

```prisma
model LoginAttempt {
  id             String    @id @default(cuid())
  identifier     String
  failedCount    Int       @default(0)
  lockedUntil    DateTime?
  lastAttemptAt  DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@unique([identifier])
  @@index([identifier])
  @@map("login_attempts")
}
```

**Aturan**:
- `identifier` = username atau email yang dicoba.
- `lockedUntil` = waktu sampai akun terkunci. Null = tidak terkunci.
- Setelah 5 percobaan gagal berturut-turut → `lockedUntil` = now + 5 menit.
- Reset `failedCount` dan `lockedUntil` setelah login berhasil.

---

## Relasi Antar Entitas

```
User (Better Auth)
 ├── createdById → Document (N:1)
 ├── updatedById → Document (N:1)
 └── userId → SearchHistory (1:N)

Category (1:N) → Document
Document (1:N) → DocumentTerm
Document (1:N) → SearchResult

GlobalTermIdf (standalone — per term global)

SearchHistory (1:N) → SearchResult
SearchResult (N:1) → Document
SearchResult (N:1) → SearchHistory

LoginAttempt (standalone — per identifier)
```

---

## Diagram ERD (Ringkas)

```
┌─────────────┐       ┌─────────────────┐       ┌──────────────────┐
│  Category   │ 1───N │    Document     │ 1───N │  DocumentTerm    │
│─────────────│       │─────────────────│       │──────────────────│
│ id          │       │ id              │       │ id               │
│ name        │       │ title           │       │ documentId (FK)  │
│ description │       │ documentNumber  │       │ term             │
│ createdAt   │       │ content (TEXT)  │       │ tf               │
│ updatedAt   │       │ documentDate    │       │ tfidf            │
└─────────────┘       │ categoryId (FK) │       └──────────────────┘
                      │ createdById     │
                      │ updatedById     │       ┌──────────────────┐
                      │ createdAt       │       │  GlobalTermIdf   │
                      │ updatedAt       │       │──────────────────│
                      └─────────────────┘       │ term (PK)        │
                             │ 1:N              │ idf              │
                             ▼                  │ docCount         │
                      ┌─────────────────┐       └──────────────────┘
                      │  SearchResult   │
                      │─────────────────│
                      │ id              │
┌─────────────────┐   │ searchHistoryId │
│  SearchHistory  │N  │ documentId (FK) │
│─────────────────│──1│ relevanceScore  │
│ id              │   │ rank            │
│ userId          │   └─────────────────┘
│ query           │
│ resultCount     │   ┌──────────────────┐
│ createdAt       │   │  LoginAttempt    │
└─────────────────┘   │──────────────────│
                      │ id               │
                      │ identifier       │
                      │ failedCount      │
                      │ lockedUntil      │
                      │ lastAttemptAt    │
                      └──────────────────┘
```

---

## State Transitions

### Dokumen
```
[Ditambahkan] → TERSEDIA → [Diperbarui] → TERSEDIA
                         → [Dihapus]    → DIHAPUS (hard delete)
```
Setiap transisi memicu re-indexing TF-IDF dan invalidasi cache.

### Akun Pengguna (Better Auth Admin Plugin)
```
[Dibuat oleh Admin] → AKTIF → [Dinonaktifkan/Ban] → NONAKTIF
                             → [Dihapus]          → DIHAPUS
                NONAKTIF → [Diaktifkan Kembali]    → AKTIF
```
- `banned: true` = NONAKTIF, sesi langsung dicabut.
- Delete = hard delete, data riwayat pencarian tidak di-cascade (simpan untuk audit).

---

## Aturan Validasi

| Entity | Field | Aturan |
|---|---|---|
| Category | name | Wajib, max 100 karakter, unik |
| Document | title | Wajib, max 255 karakter |
| Document | documentNumber | Wajib, unik, max 50 karakter |
| Document | content | Wajib, min 10 karakter |
| Document | documentDate | Wajib, tanggal valid |
| Document | categoryId | Wajib, harus ada di tabel Category |
| SearchHistory | query | Wajib, min 1 karakter, max 500 karakter |
| LoginAttempt | identifier | Wajib, unik per session tracking |
