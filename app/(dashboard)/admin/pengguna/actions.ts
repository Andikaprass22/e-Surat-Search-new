"use server";

import { headers } from "next/headers";
import { updateTag } from "next/cache";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { CACHE_TAGS, ROLES } from "@/lib/constants";
import type { UserRole } from "@/types";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

function normalizeUsername(s: string): string {
  return s.trim().toLowerCase();
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isValidUsername(s: string): boolean {
  return /^[a-z0-9_]{3,32}$/.test(s);
}

async function logError(scope: string, err: unknown) {
  console.error(`[admin/pengguna/actions] ${scope}:`, err);
}

export async function createUserAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  console.log("[createUserAction] Memulai proses pembuatan pengguna...");
  await requireAdmin();
  const hdrs = await headers();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const usernameRaw = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const roleRaw = String(formData.get("role") ?? ROLES.USER);

  if (!name) return { ok: false, error: "Nama wajib diisi." };
  if (!isEmail(email)) return { ok: false, error: "Email tidak valid." };
  if (!isValidUsername(usernameRaw))
    return { ok: false, error: "Username harus 3-32 karakter (huruf kecil, angka, underscore)." };
  if (password.length < 8)
    return { ok: false, error: "Password minimal 8 karakter." };
  if (roleRaw !== ROLES.ADMIN && roleRaw !== ROLES.USER)
    return { ok: false, error: "Role tidak valid." };

  const username = normalizeUsername(usernameRaw);

  try {
    const created = await auth.api.createUser({
      headers: hdrs,
      body: {
        email,
        password,
        name,
        role: roleRaw as UserRole,
        data: {
          username,
          displayUsername: username,
        },
      },
    });

    const existingCredential = await prisma.account.findFirst({
      where: { userId: created.user.id, providerId: "credential" },
    });

    if (!existingCredential) {
      const { hashPassword } = await import("better-auth/crypto");
      const hashed = await hashPassword(password);
      await prisma.account.create({
        data: {
          id: randomUUID(),
          userId: created.user.id,
          accountId: created.user.id,
          providerId: "credential",
          password: hashed,
        },
      });
    }

    updateTag(CACHE_TAGS.PENGGUNA_LIST);
    revalidatePath("/admin/pengguna");
    return { ok: true };
  } catch (err) {
    await logError("createUserAction", err);
    const msg = err instanceof Error ? err.message : "Gagal membuat pengguna.";
    return { ok: false, error: msg };
  }
}

export async function updateUserAction(
  userId: string,
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  console.log(`[updateUserAction] Memperbarui pengguna ID: ${userId}...`);
  await requireAdmin();
  const hdrs = await headers();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const usernameRaw = String(formData.get("username") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? ROLES.USER);

  if (!name) return { ok: false, error: "Nama wajib diisi." };
  if (!isEmail(email)) return { ok: false, error: "Email tidak valid." };
  if (!isValidUsername(usernameRaw))
    return { ok: false, error: "Username harus 3-32 karakter (huruf kecil, angka, underscore)." };
  if (roleRaw !== ROLES.ADMIN && roleRaw !== ROLES.USER)
    return { ok: false, error: "Role tidak valid." };

  const username = normalizeUsername(usernameRaw);

  try {
    await auth.api.adminUpdateUser({
      headers: hdrs,
      body: {
        userId,
        data: {
          name,
          email,
          role: roleRaw,
          username,
          displayUsername: username,
        },
      },
    });

    updateTag(CACHE_TAGS.PENGGUNA_LIST);
    updateTag(CACHE_TAGS.PENGGUNA(userId));
    revalidatePath("/admin/pengguna");
    return { ok: true };
  } catch (err) {
    await logError("updateUserAction", err);
    const msg = err instanceof Error ? err.message : "Gagal memperbarui pengguna.";
    return { ok: false, error: msg };
  }
}

export async function banUserAction(userId: string): Promise<ActionResult> {
  console.log(`[banUserAction] Memblokir pengguna ID: ${userId}...`);
  const admin = await requireAdmin();
  if (admin.id === userId) {
    return { ok: false, error: "Tidak dapat memblokir akun sendiri." };
  }
  const hdrs = await headers();

  try {
    await auth.api.banUser({
      headers: hdrs,
      body: {
        userId,
        banReason: "Diblokir oleh administrator",
      },
    });

    await logoutBannedUserSessions(userId);

    updateTag(CACHE_TAGS.PENGGUNA_LIST);
    updateTag(CACHE_TAGS.PENGGUNA(userId));
    revalidatePath("/admin/pengguna");
    return { ok: true };
  } catch (err) {
    await logError("banUserAction", err);
    const msg = err instanceof Error ? err.message : "Gagal memblokir pengguna.";
    return { ok: false, error: msg };
  }
}

export async function unbanUserAction(userId: string): Promise<ActionResult> {
  console.log(`[unbanUserAction] Membuka blokir pengguna ID: ${userId}...`);
  await requireAdmin();
  const hdrs = await headers();

  try {
    await auth.api.unbanUser({
      headers: hdrs,
      body: { userId },
    });

    updateTag(CACHE_TAGS.PENGGUNA_LIST);
    updateTag(CACHE_TAGS.PENGGUNA(userId));
    revalidatePath("/admin/pengguna");
    return { ok: true };
  } catch (err) {
    await logError("unbanUserAction", err);
    const msg = err instanceof Error ? err.message : "Gagal membuka blokir.";
    return { ok: false, error: msg };
  }
}

export async function deleteUserAction(userId: string): Promise<ActionResult> {
  console.log(`[deleteUserAction] Menghapus pengguna ID: ${userId}...`);
  const admin = await requireAdmin();
  if (admin.id === userId) {
    return { ok: false, error: "Tidak dapat menghapus akun sendiri." };
  }
  const adminCount = await prisma.user.count({ where: { role: "admin" } });
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (target?.role === "admin" && adminCount <= 1) {
    return { ok: false, error: "Tidak dapat menghapus admin terakhir." };
  }
  const hdrs = await headers();

  try {
    await auth.api.removeUser({
      headers: hdrs,
      body: { userId },
    });

    updateTag(CACHE_TAGS.PENGGUNA_LIST);
    updateTag(CACHE_TAGS.PENGGUNA(userId));
    revalidatePath("/admin/pengguna");
    return { ok: true };
  } catch (err) {
    await logError("deleteUserAction", err);
    const msg = err instanceof Error ? err.message : "Gagal menghapus pengguna.";
    return { ok: false, error: msg };
  }
}

async function logoutBannedUserSessions(userId: string): Promise<void> {
  try {
    await prisma.session.deleteMany({ where: { userId } });
  } catch (err) {
    await logError("logoutBannedUserSessions", err);
  }
}
