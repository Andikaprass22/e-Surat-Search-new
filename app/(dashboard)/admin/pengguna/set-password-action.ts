"use server";

import { updateTag, revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { CACHE_TAGS } from "@/lib/constants";

export type SetPasswordResult =
  | { ok: true }
  | { ok: false; error: string };

async function logError(scope: string, err: unknown) {
  console.error(`[admin/pengguna/set-password] ${scope}:`, err);
}

async function ensureCredentialAccount(userId: string): Promise<void> {
  const existing = await prisma.account.findFirst({
    where: { userId, providerId: "credential" },
  });
  if (!existing) {
    await prisma.account.create({
      data: {
        id: randomUUID(),
        userId,
        accountId: userId,
        providerId: "credential",
        password: "",
      },
    });
  }
}

export async function adminSetUserPasswordAction(
  userId: string,
  newPassword: string
): Promise<SetPasswordResult> {
  await requireAdmin();

  if (!userId) return { ok: false, error: "Pengguna tidak valid." };
  if (newPassword.length < 8)
    return { ok: false, error: "Password minimal 8 karakter." };

  try {
    await ensureCredentialAccount(userId);

    const hashed = await hashPassword(newPassword);
    await prisma.account.updateMany({
      where: { userId, providerId: "credential" },
      data: { password: hashed },
    });

    await prisma.session
      .deleteMany({ where: { userId } })
      .catch((err) => logError("sessionCleanup", err));

    updateTag(CACHE_TAGS.PENGGUNA_LIST);
    updateTag(CACHE_TAGS.PENGGUNA(userId));
    revalidatePath("/admin/pengguna");
    return { ok: true };
  } catch (err) {
    await logError("adminSetUserPasswordAction", err);
    const msg = err instanceof Error ? err.message : "Gagal mengatur ulang password.";
    return { ok: false, error: msg };
  }
}

export async function adminRemoveUserPasswordAction(
  userId: string
): Promise<SetPasswordResult> {
  await requireAdmin();

  if (!userId) return { ok: false, error: "Pengguna tidak valid." };

  try {
    const deleted = await prisma.account.deleteMany({
      where: { userId, providerId: "credential" },
    });

    if (deleted.count === 0) {
      return { ok: false, error: "Pengguna ini tidak memiliki sandi." };
    }

    await prisma.session
      .deleteMany({ where: { userId } })
      .catch((err) => logError("sessionCleanup", err));

    updateTag(CACHE_TAGS.PENGGUNA_LIST);
    updateTag(CACHE_TAGS.PENGGUNA(userId));
    revalidatePath("/admin/pengguna");
    return { ok: true };
  } catch (err) {
    await logError("adminRemoveUserPasswordAction", err);
    const msg = err instanceof Error ? err.message : "Gagal menghapus sandi.";
    return { ok: false, error: msg };
  }
}
