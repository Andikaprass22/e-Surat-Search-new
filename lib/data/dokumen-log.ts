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

  return rows.map((r) => ({
    id: r.id,
    aksi: r.aksi,
    keterangan: r.keterangan,
    pelaku: r.userId,
    createdAt: r.createdAt,
  }));
}
