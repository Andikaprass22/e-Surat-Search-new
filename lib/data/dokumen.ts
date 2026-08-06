import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/constants";
import type { DokumenListItem, DokumenDetail, JenisSurat } from "@/types";

type DokumenRow = {
  id: string;
  title: string;
  documentNumber: string;
  documentDate: Date;
  categoryId: string;
  category: { name: string };
  createdAt: Date;
  updatedAt: Date;
  jenis: string | null;
  pengirim: string | null;
  penerima: string | null;
  perihal: string | null;
  disposisi: string | null;
  lokasiArsip: string | null;
  statusArsip: string | null;
  tanggalTerima: Date | null;
};

function toListItem(d: DokumenRow): DokumenListItem {
  return {
    id: d.id,
    judul: d.title,
    nomorSurat: d.documentNumber,
    tanggal: d.documentDate,
    kategoriId: d.categoryId,
    kategoriName: d.category.name,
    arsip: {
      jenis: (d.jenis as JenisSurat) ?? null,
      pengirim: d.pengirim,
      penerima: d.penerima,
      perihal: d.perihal,
      disposisi: d.disposisi,
      lokasiArsip: d.lokasiArsip,
      statusArsip: (d.statusArsip as
        | "AKTIF"
        | "RETENSI"
        | "DIMUSNAHKAN") ?? null,
      tanggalTerima: d.tanggalTerima
        ? d.tanggalTerima.toISOString().split("T")[0]!
        : null,
    },
  };
}

const DOKUMEN_SELECT = {
  id: true,
  title: true,
  documentNumber: true,
  documentDate: true,
  categoryId: true,
  category: { select: { name: true } },
  createdAt: true,
  updatedAt: true,
  jenis: true,
  pengirim: true,
  penerima: true,
  perihal: true,
  disposisi: true,
  lokasiArsip: true,
  statusArsip: true,
  tanggalTerima: true,
} as const;

export async function getDokumenList(): Promise<DokumenListItem[]> {
  "use cache";
  cacheTag(CACHE_TAGS.DOKUMEN_LIST);
  console.log("[getDokumenList] Mengambil daftar dokumen...");

  const rows = await prisma.document.findMany({
    select: DOKUMEN_SELECT,
    orderBy: { createdAt: "desc" },
  });

  return rows.map(toListItem);
}

export async function getDokumenListByJenis(
  jenis: JenisSurat
): Promise<DokumenListItem[]> {
  "use cache";
  cacheTag(CACHE_TAGS.DOKUMEN_LIST);
  console.log(`[getDokumenListByJenis] Mengambil daftar dokumen jenis: ${jenis}`);

  const rows = await prisma.document.findMany({
    where: { jenis },
    select: DOKUMEN_SELECT,
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
      ...DOKUMEN_SELECT,
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
