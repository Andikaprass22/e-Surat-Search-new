import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/constants";
import { JENIS_SURAT } from "@/types";

export type DashboardStats = {
  totalPengguna: number;
  totalKategori: number;
  totalDokumen: number;
  penggunaAktif: number;
  totalSuratMasuk: number;
  totalSuratKeluar: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  "use cache";
  cacheTag(CACHE_TAGS.PENGGUNA_LIST);
  cacheTag(CACHE_TAGS.KATEGORI_LIST);
  cacheTag(CACHE_TAGS.DOKUMEN_LIST);
  console.log("[getDashboardStats] Mengambil statistik dashboard...");

  const [
    totalPengguna,
    totalKategori,
    totalDokumen,
    penggunaAktif,
    totalSuratMasuk,
    totalSuratKeluar,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.category.count(),
    prisma.document.count(),
    prisma.user.count({ where: { banned: false } }),
    prisma.document.count({ where: { jenis: JENIS_SURAT.MASUK } }),
    prisma.document.count({ where: { jenis: JENIS_SURAT.KELUAR } }),
  ]);

  return {
    totalPengguna,
    totalKategori,
    totalDokumen,
    penggunaAktif,
    totalSuratMasuk,
    totalSuratKeluar,
  };
}
