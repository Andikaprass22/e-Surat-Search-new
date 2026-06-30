import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/constants";
import type { DokumenListItem, DokumenDetail } from "@/types";

type DokumenRow = {
  id: string;
  title: string;
  documentNumber: string;
  documentDate: Date;
  categoryId: string;
  category: { name: string };
  createdAt: Date;
  updatedAt: Date;
};

function toListItem(d: DokumenRow): DokumenListItem {
  return {
    id: d.id,
    judul: d.title,
    nomorSurat: d.documentNumber,
    tanggal: d.documentDate,
    kategoriId: d.categoryId,
    kategoriName: d.category.name,
  };
}

export async function getDokumenList(): Promise<DokumenListItem[]> {
  "use cache";
  cacheTag(CACHE_TAGS.DOKUMEN_LIST);
  console.log("[getDokumenList] Mengambil daftar dokumen...");

  const rows = await prisma.document.findMany({
    select: {
      id: true,
      title: true,
      documentNumber: true,
      documentDate: true,
      categoryId: true,
      category: { select: { name: true } },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(toListItem);
}

export async function getDokumenById(
  id: string
): Promise<DokumenDetail | null> {
  "use cache";
  cacheTag(CACHE_TAGS.DOKUMEN(id));
  console.log(`[getDokumenById] Mengambil data dokumen ID: ${id}`);

  const row = await prisma.document.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      documentNumber: true,
      documentDate: true,
      categoryId: true,
      category: { select: { name: true } },
      createdAt: true,
      updatedAt: true,
      content: true,
      filePath: true,
    },
  });

  if (!row) return null;

  return {
    ...toListItem(row),
    konten: row.content,
    filePath: row.filePath,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
