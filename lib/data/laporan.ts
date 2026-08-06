import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/constants";
import { JENIS_SURAT } from "@/types";
import type { LaporanRingkasan } from "@/types";

export type RekapArsipItem = {
  bulan: string;
  suratMasuk: number;
  suratKeluar: number;
};

export type RekapArsip = {
  totalSuratMasuk: number;
  totalSuratKeluar: number;
  perBulan: RekapArsipItem[];
};

export async function getRekapArsip(): Promise<RekapArsip> {
  "use cache";
  cacheTag(CACHE_TAGS.DOKUMEN_LIST);
  cacheLife("minutes");
  console.log("[getRekapArsip] Mengambil rekap arsip surat...");

  const [totalSuratMasuk, totalSuratKeluar, rows] = await Promise.all([
    prisma.document.count({ where: { jenis: JENIS_SURAT.MASUK } }),
    prisma.document.count({ where: { jenis: JENIS_SURAT.KELUAR } }),
    prisma.document.findMany({
      where: { jenis: { in: [JENIS_SURAT.MASUK, JENIS_SURAT.KELUAR] } },
      select: { jenis: true, documentDate: true },
    }),
  ]);

  const map = new Map<string, { masuk: number; keluar: number }>();
  for (const r of rows) {
    const key = r.documentDate.toISOString().slice(0, 7);
    const entry = map.get(key) ?? { masuk: 0, keluar: 0 };
    if (r.jenis === JENIS_SURAT.MASUK) entry.masuk += 1;
    else if (r.jenis === JENIS_SURAT.KELUAR) entry.keluar += 1;
    map.set(key, entry);
  }

  const perBulan: RekapArsipItem[] = [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([bulan, { masuk, keluar }]) => ({
      bulan,
      suratMasuk: masuk,
      suratKeluar: keluar,
    }));

  return { totalSuratMasuk, totalSuratKeluar, perBulan };
}

export async function getLaporanRingkasan(
  userId: string
): Promise<LaporanRingkasan> {
  "use cache";
  cacheTag(CACHE_TAGS.LAPORAN(userId));
  cacheLife("minutes");
  console.log(`[getLaporanRingkasan] Mengambil laporan user: ${userId}`);

  const [totalPencarian, topKeywordsRaw, trendRaw] = await Promise.all([
    prisma.searchHistory.count({ where: { userId } }),

    prisma.searchHistory.groupBy({
      by: ["query"],
      where: { userId },
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 10,
    }),

    prisma.searchHistory.findMany({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true },
    }),
  ]);

  const topKeywords = topKeywordsRaw.map((k) => ({
    query: k.query,
    count: k._count.query,
  }));

  const trendMap: Record<string, number> = {};
  for (const t of trendRaw) {
    const day = t.createdAt.toISOString().split("T")[0]!;
    trendMap[day] = (trendMap[day] ?? 0) + 1;
  }

  const trendHarian = Object.entries(trendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tanggal, count]) => ({ tanggal, count }));

  console.log(
    `[getLaporanRingkasan] Total: ${totalPencarian}, keywords: ${topKeywords.length}, tren: ${trendHarian.length} hari`
  );

  return { totalPencarian, topKeywords, trendHarian };
}
