"use server";

import { updateTag } from "next/cache";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helpers";
import { CACHE_TAGS } from "@/lib/constants";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function logError(scope: string, err: unknown) {
  console.error(`[template/actions] ${scope}:`, err);
}

export async function createTemplateAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  console.log("[createTemplateAction] Memulai proses...");
  const user = await requireSession();

  const label = String(formData.get("label") ?? "").trim();
  const query = String(formData.get("query") ?? "").trim();

  if (!label) return { ok: false, error: "Label template wajib diisi." };
  if (!query) return { ok: false, error: "Kata kunci pencarian wajib diisi." };
  if (label.length < 2)
    return { ok: false, error: "Label template minimal 2 karakter." };

  try {
    const template = await prisma.searchTemplate.create({
      data: { userId: user.id, label, query },
    });

    updateTag(CACHE_TAGS.TEMPLATE_LIST(user.id));
    updateTag(CACHE_TAGS.TEMPLATE(template.id));
    revalidatePath("/template");
    return { ok: true };
  } catch (err) {
    await logError("createTemplateAction", err);
    const msg =
      err instanceof Error ? err.message : "Gagal membuat template.";
    return { ok: false, error: msg };
  }
}

export async function updateTemplateAction(
  templateId: string,
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  console.log(`[updateTemplateAction] Memperbarui template ID: ${templateId}...`);
  const user = await requireSession();

  const label = String(formData.get("label") ?? "").trim();
  const query = String(formData.get("query") ?? "").trim();

  if (!label) return { ok: false, error: "Label template wajib diisi." };
  if (!query) return { ok: false, error: "Kata kunci pencarian wajib diisi." };
  if (label.length < 2)
    return { ok: false, error: "Label template minimal 2 karakter." };

  try {
    const existing = await prisma.searchTemplate.findFirst({
      where: { id: templateId, userId: user.id },
    });

    if (!existing) return { ok: false, error: "Template tidak ditemukan." };

    await prisma.searchTemplate.update({
      where: { id: templateId },
      data: { label, query },
    });

    updateTag(CACHE_TAGS.TEMPLATE_LIST(user.id));
    updateTag(CACHE_TAGS.TEMPLATE(templateId));
    revalidatePath("/template");
    return { ok: true };
  } catch (err) {
    await logError("updateTemplateAction", err);
    const msg =
      err instanceof Error ? err.message : "Gagal memperbarui template.";
    return { ok: false, error: msg };
  }
}

export async function deleteTemplateAction(
  templateId: string
): Promise<ActionResult> {
  console.log(`[deleteTemplateAction] Menghapus template ID: ${templateId}...`);
  const user = await requireSession();

  try {
    const existing = await prisma.searchTemplate.findFirst({
      where: { id: templateId, userId: user.id },
    });

    if (!existing) return { ok: false, error: "Template tidak ditemukan." };

    await prisma.searchTemplate.delete({
      where: { id: templateId },
    });

    updateTag(CACHE_TAGS.TEMPLATE_LIST(user.id));
    revalidatePath("/template");
    return { ok: true };
  } catch (err) {
    await logError("deleteTemplateAction", err);
    const msg =
      err instanceof Error ? err.message : "Gagal menghapus template.";
    return { ok: false, error: msg };
  }
}
