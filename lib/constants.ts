export const APP_NAME = "e-Surat Search";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

export const CACHE_TAGS = {
  DOKUMEN_LIST: "dokumen-list",
  KATEGORI_LIST: "kategori-list",
  PENGGUNA_LIST: "pengguna-list",
  TFIDF_INDEX: "tfidf-index",
  DOKUMEN: (id: string) => `dokumen-${id}`,
  KATEGORI: (id: string) => `kategori-${id}`,
  PENGGUNA: (id: string) => `pengguna-${id}`,
  RIWAYAT: (userId: string) => `riwayat-${userId}`,
  RIWAYAT_ALL: "riwayat-all",
  RIWAYAT_DETAIL: (historyId: string) => `riwayat-detail-${historyId}`,
  LAPORAN: (userId: string) => `laporan-${userId}`,
  TEMPLATE_LIST: (userId: string) => `template-list-${userId}`,
  TEMPLATE: (id: string) => `template-${id}`,
} as const;
