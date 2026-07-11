import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/constants";
import type { RiwayatItem, RiwayatDetail } from "@/types";

export async function getRiwayatList(userId: string): Promise<RiwayatItem[]> {
  "use cache";
  cacheTag(CACHE_TAGS.RIWAYAT(userId));
  cacheTag(CACHE_TAGS.RIWAYAT_ALL);
  console.log(`[getRiwayatList] Mengambil riwayat user: ${userId}`);

  const rows = await prisma.searchHistory.findMany({
    where: { userId },
    select: {
      id: true,
      query: true,
      resultCount: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r) => ({
    id: r.id,
    query: r.query,
    resultCount: r.resultCount,
    createdAt: r.createdAt,
  }));
}

export async function getRiwayatDetail(
  historyId: string,
  userId: string
): Promise<RiwayatDetail | null> {
  "use cache";
  cacheTag(CACHE_TAGS.RIWAYAT_DETAIL(historyId));
  console.log(`[getRiwayatDetail] Mengambil detail riwayat ID: ${historyId}`);

  const row = await prisma.searchHistory.findUnique({
    where: { id: historyId },
    select: {
      id: true,
      query: true,
      resultCount: true,
      createdAt: true,
      userId: true,
      results: {
        select: {
          id: true,
          documentId: true,
          searchHistoryId: true,
          relevanceScore: true,
          document: {
            select: {
              title: true,
              documentNumber: true,
              documentDate: true,
              category: { select: { name: true } },
              filePath: true,
            },
          },
        },
        orderBy: { rank: "asc" },
      },
    },
  });

  if (!row || row.userId !== userId) return null;

  return {
    id: row.id,
    query: row.query,
    resultCount: row.resultCount,
    createdAt: row.createdAt,
    results: row.results.map((r) => ({
      id: r.id,
      dokumenId: r.documentId,
      historyId: r.searchHistoryId,
      relevanceScore: r.relevanceScore,
      dokumen: {
        judul: r.document.title,
        nomorSurat: r.document.documentNumber,
        tanggal: r.document.documentDate,
        kategori: { nama: r.document.category.name },
      },
      hasFilePath: Boolean(r.document.filePath),
    })),
  };
}
