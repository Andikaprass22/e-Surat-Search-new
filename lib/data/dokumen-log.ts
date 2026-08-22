import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/constants";
import type { DocumentLogItem } from "@/types";

export async function getDocumentLogs(
  documentId: string
): Promise<DocumentLogItem[]> {
  "use cache";
  cacheTag(CACHE_TAGS.DOKUMEN(documentId));
  console.log(`[getDocumentLogs] Mengambil log dokumen ID: ${documentId}`);

  const rows = await prisma.documentLog.findMany({
    where: { documentId },
    orderBy: { createdAt: "desc" },
  });

  const userIds = [...new Set(rows.map((r) => r.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, username: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u.username ?? u.name]));

  return rows.map((r) => ({
    id: r.id,
    aksi: r.aksi,
    keterangan: r.keterangan,
    pelaku: userMap.get(r.userId) ?? r.userId,
    createdAt: r.createdAt,
  }));
}
