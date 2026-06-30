"use server";

import { updateTag } from "next/cache";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { CACHE_TAGS } from "@/lib/constants";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function logError(scope: string, err: unknown) {
  console.error(`[admin/kategori/actions] ${scope}:`, err);
}

export async function createKategoriAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  console.log("[createKategoriAction] Memulai proses pembuatan kategori...");
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!name) return { ok: false, error: "Nama kategori wajib diisi." };
  if (name.length < 2)
    return { ok: false, error: "Nama kategori minimal 2 karakter." };

  try {
    await prisma.category.create({
      data: { name, description },
    });

    updateTag(CACHE_TAGS.KATEGORI_LIST);
    revalidatePath("/admin/kategori");
    return { ok: true };
  } catch (err) {
    await logError("createKategoriAction", err);
    if (
      err instanceof Error &&
      err.message.includes("Unique constraint")
    ) {
      return { ok: false, error: "Nama kategori sudah digunakan." };
    }
    const msg = err instanceof Error ? err.message : "Gagal membuat kategori.";
    return { ok: false, error: msg };
  }
}

export async function updateKategoriAction(
  kategoriId: string,
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  console.log(`[updateKategoriAction] Memperbarui kategori ID: ${kategoriId}...`);
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!name) return { ok: false, error: "Nama kategori wajib diisi." };
  if (name.length < 2)
    return { ok: false, error: "Nama kategori minimal 2 karakter." };

  try {
    await prisma.category.update({
      where: { id: kategoriId },
      data: { name, description },
    });

    updateTag(CACHE_TAGS.KATEGORI_LIST);
    updateTag(CACHE_TAGS.KATEGORI(kategoriId));
    revalidatePath("/admin/kategori");
    return { ok: true };
  } catch (err) {
    await logError("updateKategoriAction", err);
    if (
      err instanceof Error &&
      err.message.includes("Unique constraint")
    ) {
      return { ok: false, error: "Nama kategori sudah digunakan." };
    }
    const msg = err instanceof Error ? err.message : "Gagal memperbarui kategori.";
    return { ok: false, error: msg };
  }
}

export async function deleteKategoriAction(
  kategoriId: string
): Promise<ActionResult> {
  console.log(`[deleteKategoriAction] Menghapus kategori ID: ${kategoriId}...`);
  await requireAdmin();

  try {
    const docCount = await prisma.document.count({
      where: { categoryId: kategoriId },
    });

    if (docCount > 0) {
      return {
        ok: false,
        error: `Kategori masih memiliki ${docCount} dokumen. Hapus atau pindahkan dokumen terlebih dahulu.`,
      };
    }

    await prisma.category.delete({
      where: { id: kategoriId },
    });

    updateTag(CACHE_TAGS.KATEGORI_LIST);
    updateTag(CACHE_TAGS.KATEGORI(kategoriId));
    revalidatePath("/admin/kategori");
    return { ok: true };
  } catch (err) {
    await logError("deleteKategoriAction", err);
    const msg = err instanceof Error ? err.message : "Gagal menghapus kategori.";
    return { ok: false, error: msg };
  }
}
