import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/constants";
import type { KategoriListItem } from "@/types";

type KategoriRow = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  _count: { documents: number };
};

function toListItem(k: KategoriRow): KategoriListItem {
  return {
    id: k.id,
    name: k.name,
    description: k.description,
    documentCount: k._count.documents,
    createdAt: k.createdAt,
  };
}

export async function getKategoriList(): Promise<KategoriListItem[]> {
  "use cache";
  cacheTag(CACHE_TAGS.KATEGORI_LIST);
  console.log("[getKategoriList] Mengambil daftar kategori...");

  const rows = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      _count: { select: { documents: true } },
    },
    orderBy: { name: "asc" },
  });

  return rows.map(toListItem);
}

export async function getKategoriById(
  id: string
): Promise<KategoriListItem | null> {
  "use cache";
  cacheTag(CACHE_TAGS.KATEGORI(id));
  console.log(`[getKategoriById] Mengambil data kategori ID: ${id}`);

  const row = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      _count: { select: { documents: true } },
    },
  });

  return row ? toListItem(row) : null;
}
