"use server";

import { updateTag } from "next/cache";
import { revalidatePath } from "next/cache";
import { mkdir, writeFile, unlink } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { CACHE_TAGS } from "@/lib/constants";
import {
  triggerTfidfIndexing,
  recalculateGlobalIdf,
} from "@/lib/tfidf/engine";
import { extractTextFromFile } from "@/lib/file-parser";

const UPLOAD_DIR = join(process.cwd(), "uploads");

async function saveUploadedFile(file: File, docId: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const fileName = `${docId}.${ext}`;
  const filePath = join(UPLOAD_DIR, fileName);
  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);
  return fileName;
}

async function deleteUploadedFile(fileName: string | null) {
  if (!fileName) return;
  try {
    await unlink(join(UPLOAD_DIR, fileName));
  } catch {
    // file mungkin sudah tidak ada
  }
}

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

async function logError(scope: string, err: unknown) {
  console.error(`[admin/dokumen/actions] ${scope}:`, err);
}

export async function fetchDokumenDetailAction(
  id: string
): Promise<ActionResult & { dokumen?: { id: string; title: string; documentNumber: string; content: string; documentDate: string; categoryId: string; kategoriName: string } }> {
  console.log(`[fetchDokumenDetailAction] Mengambil detail dokumen ID: ${id}...`);

  try {
    const doc = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        documentNumber: true,
        content: true,
        documentDate: true,
        categoryId: true,
        category: { select: { name: true } },
      },
    });

    if (!doc) return { ok: false, error: "Dokumen tidak ditemukan." };

    return {
      ok: true,
      dokumen: {
        id: doc.id,
        title: doc.title,
        documentNumber: doc.documentNumber,
        content: doc.content,
        documentDate: doc.documentDate.toISOString().split("T")[0]!,
        categoryId: doc.categoryId,
        kategoriName: doc.category.name,
      },
    };
  } catch (err) {
    await logError("fetchDokumenDetailAction", err);
    const msg = err instanceof Error ? err.message : "Gagal mengambil data dokumen.";
    return { ok: false, error: msg };
  }
}

export async function createDokumenAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  console.log("[createDokumenAction] Memulai proses pembuatan dokumen...");
  const admin = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const documentNumber = String(formData.get("documentNumber") ?? "").trim();
  const contentManual = String(formData.get("content") ?? "").trim();
  const documentDate = String(formData.get("documentDate") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const uploadedFile = formData.get("file") as File | null;

  if (!title) return { ok: false, error: "Judul dokumen wajib diisi." };
  if (!documentNumber) return { ok: false, error: "Nomor surat wajib diisi." };
  if (!documentDate) return { ok: false, error: "Tanggal dokumen wajib diisi." };
  if (!categoryId) return { ok: false, error: "Kategori wajib dipilih." };

  let content = contentManual;
  let savedFileName: string | null = null;

  if (uploadedFile && uploadedFile.size > 0) {
    const MAX_SIZE = 10 * 1024 * 1024;
    if (uploadedFile.size > MAX_SIZE) {
      return { ok: false, error: "Ukuran file maksimal 10 MB." };
    }
    const parsed = await extractTextFromFile(uploadedFile);
    if (!parsed.ok) return { ok: false, error: parsed.error };
    content = parsed.text;
  }

  if (!content) return { ok: false, error: "Konten dokumen wajib diisi. Ketik manual atau unggah file." };

  const dateValue = new Date(documentDate);
  if (isNaN(dateValue.getTime())) {
    return { ok: false, error: "Format tanggal tidak valid." };
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { ok: false, error: "Kategori tidak ditemukan." };

  try {
    const doc = await prisma.document.create({
      data: {
        title,
        documentNumber,
        content,
        filePath: null,
        documentDate: dateValue,
        categoryId,
        createdById: admin.id,
      },
    });

    if (uploadedFile && uploadedFile.size > 0) {
      savedFileName = await saveUploadedFile(uploadedFile, doc.id);
      await prisma.document.update({
        where: { id: doc.id },
        data: { filePath: savedFileName },
      });
    }

    console.log(`[createDokumenAction] Dokumen dibuat ID: ${doc.id}, indexing di-background...`);

    triggerTfidfIndexing(doc.id).catch((err) =>
      console.error(`[createDokumenAction] Background indexing gagal:`, err)
    );

    updateTag(CACHE_TAGS.DOKUMEN_LIST);
    updateTag(CACHE_TAGS.TFIDF_INDEX);
    revalidatePath("/admin/dokumen");
    return { ok: true, id: doc.id };
  } catch (err) {
    await logError("createDokumenAction", err);
    if (
      err instanceof Error &&
      err.message.includes("Unique constraint")
    ) {
      return { ok: false, error: "Nomor surat sudah digunakan." };
    }
    const msg = err instanceof Error ? err.message : "Gagal membuat dokumen.";
    return { ok: false, error: msg };
  }
}

export async function updateDokumenAction(
  dokumenId: string,
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  console.log(`[updateDokumenAction] Memperbarui dokumen ID: ${dokumenId}...`);
  const admin = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const documentNumber = String(formData.get("documentNumber") ?? "").trim();
  const contentManual = String(formData.get("content") ?? "").trim();
  const documentDate = String(formData.get("documentDate") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const uploadedFile = formData.get("file") as File | null;

  if (!title) return { ok: false, error: "Judul dokumen wajib diisi." };
  if (!documentNumber) return { ok: false, error: "Nomor surat wajib diisi." };
  if (!documentDate) return { ok: false, error: "Tanggal dokumen wajib diisi." };
  if (!categoryId) return { ok: false, error: "Kategori wajib dipilih." };

  let content = contentManual;

  if (uploadedFile && uploadedFile.size > 0) {
    const MAX_SIZE = 10 * 1024 * 1024;
    if (uploadedFile.size > MAX_SIZE) {
      return { ok: false, error: "Ukuran file maksimal 10 MB." };
    }
    const parsed = await extractTextFromFile(uploadedFile);
    if (!parsed.ok) return { ok: false, error: parsed.error };
    content = parsed.text;
  }

  if (!content) return { ok: false, error: "Konten dokumen wajib diisi. Ketik manual atau unggah file." };

  const dateValue = new Date(documentDate);
  if (isNaN(dateValue.getTime())) {
    return { ok: false, error: "Format tanggal tidak valid." };
  }

  try {
    const existing = await prisma.document.findUnique({
      where: { id: dokumenId },
      select: { filePath: true },
    });

    let newFileName = existing?.filePath ?? null;

    if (uploadedFile && uploadedFile.size > 0) {
      await deleteUploadedFile(newFileName);
      newFileName = await saveUploadedFile(uploadedFile, dokumenId);
    }

    await prisma.document.update({
      where: { id: dokumenId },
      data: {
        title,
        documentNumber,
        content,
        filePath: newFileName,
        documentDate: dateValue,
        categoryId,
        updatedById: admin.id,
      },
    });

    console.log(`[updateDokumenAction] Dokumen diperbarui ID: ${dokumenId}, re-indexing di-background...`);

    triggerTfidfIndexing(dokumenId).catch((err) =>
      console.error(`[updateDokumenAction] Background indexing gagal:`, err)
    );

    updateTag(CACHE_TAGS.DOKUMEN_LIST);
    updateTag(CACHE_TAGS.DOKUMEN(dokumenId));
    updateTag(CACHE_TAGS.TFIDF_INDEX);
    revalidatePath("/admin/dokumen");
    return { ok: true };
  } catch (err) {
    await logError("updateDokumenAction", err);
    if (
      err instanceof Error &&
      err.message.includes("Unique constraint")
    ) {
      return { ok: false, error: "Nomor surat sudah digunakan." };
    }
    const msg = err instanceof Error ? err.message : "Gagal memperbarui dokumen.";
    return { ok: false, error: msg };
  }
}

export async function getNextDocumentNumber(
  categoryId: string
): Promise<ActionResult & { documentNumber?: string }> {
  console.log(`[getNextDocumentNumber] Menghitung nomor surat untuk kategori ID: ${categoryId}...`);

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { name: true },
    });
    if (!category) return { ok: false, error: "Kategori tidak ditemukan." };

    const count = await prisma.document.count({
      where: { categoryId },
    });

    const seq = (count + 1).toString().padStart(3, "0");
    const year = new Date().getFullYear();
    const code = category.name.replace(/\s+/g, "");
    const documentNumber = `${seq}/${code}/${year}`;

    console.log(`[getNextDocumentNumber] Nomor surat: ${documentNumber}`);
    return { ok: true, documentNumber };
  } catch (err) {
    await logError("getNextDocumentNumber", err);
    const msg = err instanceof Error ? err.message : "Gagal menghitung nomor surat.";
    return { ok: false, error: msg };
  }
}

export async function deleteDokumenAction(
  dokumenId: string
): Promise<ActionResult> {
  console.log(`[deleteDokumenAction] Menghapus dokumen ID: ${dokumenId}...`);
  await requireAdmin();

  try {
    const doc = await prisma.document.findUnique({
      where: { id: dokumenId },
      select: { filePath: true },
    });

    await prisma.documentTerm.deleteMany({
      where: { documentId: dokumenId },
    });

    await prisma.document.delete({
      where: { id: dokumenId },
    });

    await deleteUploadedFile(doc?.filePath ?? null);

    console.log(`[deleteDokumenAction] Dokumen dihapus ID: ${dokumenId}, recalculate IDF di-background...`);

    recalculateGlobalIdf().catch((err) =>
      console.error(`[deleteDokumenAction] Background IDF recalc gagal:`, err)
    );

    updateTag(CACHE_TAGS.DOKUMEN_LIST);
    updateTag(CACHE_TAGS.DOKUMEN(dokumenId));
    updateTag(CACHE_TAGS.TFIDF_INDEX);
    revalidatePath("/admin/dokumen");
    return { ok: true };
  } catch (err) {
    await logError("deleteDokumenAction", err);
    const msg = err instanceof Error ? err.message : "Gagal menghapus dokumen.";
    return { ok: false, error: msg };
  }
}
