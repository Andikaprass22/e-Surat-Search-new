"use server";

import { updateTag } from "next/cache";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { CACHE_TAGS } from "@/lib/constants";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function deleteAllRiwayatAction(): Promise<ActionResult> {
  console.log("[deleteAllRiwayatAction] Menghapus semua riwayat pencarian...");
  await requireAdmin();

  try {
    await prisma.searchHistory.deleteMany();
    updateTag(CACHE_TAGS.RIWAYAT_ALL);
    revalidatePath("/riwayat");
    revalidatePath("/admin/laporan");
    return { ok: true };
  } catch (err) {
    console.error("[deleteAllRiwayatAction] Error:", err);
    const msg = err instanceof Error ? err.message : "Gagal menghapus riwayat.";
    return { ok: false, error: msg };
  }
}
