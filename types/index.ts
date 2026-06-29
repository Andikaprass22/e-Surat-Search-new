export type UserRole = "admin" | "user";

export interface UserListItem {
  id: string;
  name: string;
  username: string | null;
  email: string | null;
  role: UserRole;
  banned: boolean;
  createdAt: Date;
}

export interface DokumenListItem {
  id: string;
  judul: string;
  nomorSurat: string;
  tanggal: Date;
  kategoriId: string;
  kategoriName?: string;
}

export interface DokumenDetail extends DokumenListItem {
  konten: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResultItem {
  id: string;
  dokumenId: string;
  historyId: string;
  relevanceScore: number;
  dokumen: {
    judul: string;
    nomorSurat: string;
    tanggal: Date;
    kategori: {
      nama: string;
    };
  };
}

export interface RiwayatItem {
  id: string;
  query: string;
  createdAt: Date;
  resultCount: number;
}

export interface RiwayatDetail extends RiwayatItem {
  results: SearchResultItem[];
}

export interface LaporanRingkasan {
  totalPencarian: number;
  topKeywords: { query: string; count: number }[];
  trendHarian: { tanggal: string; count: number }[];
}

export type TfidfIndex = {
  // Map dari term ke dokumen id dan term frequency-nya (tf * idf)
  [term: string]: {
    idf: number;
    docs: {
      [documentId: string]: number; // tf-idf score
    };
  };
};
