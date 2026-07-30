import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/constants";
import type { LaporanRingkasan } from "@/types";

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
