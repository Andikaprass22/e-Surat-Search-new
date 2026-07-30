import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/constants";

export type DashboardStats = {
  totalPengguna: number;
  totalKategori: number;
  totalDokumen: number;
  penggunaAktif: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  "use cache";
  cacheTag(CACHE_TAGS.PENGGUNA_LIST);
  cacheTag(CACHE_TAGS.KATEGORI_LIST);
  cacheTag(CACHE_TAGS.DOKUMEN_LIST);
  console.log("[getDashboardStats] Mengambil statistik dashboard...");

  const [totalPengguna, totalKategori, totalDokumen, penggunaAktif] =
    await Promise.all([
      prisma.user.count(),
      prisma.category.count(),
      prisma.document.count(),
      prisma.user.count({ where: { banned: false } }),
    ]);

  return { totalPengguna, totalKategori, totalDokumen, penggunaAktif };
}
