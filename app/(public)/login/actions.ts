"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MIN = 5;

function minutesBetween(now: Date, future: Date) {
  return Math.max(1, Math.ceil((future.getTime() - now.getTime()) / 60000));
}

export type LoginActionResult =
  | { success: true }
  | { success: false; error: string };

export async function loginAction(formData: FormData): Promise<LoginActionResult> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { success: false, error: "Nama pengguna dan kata sandi wajib diisi." };
  }

  const existing = await prisma.loginAttempt.findUnique({
    where: { identifier: username },
  });

  const now = new Date();
  if (existing?.lockedUntil && existing.lockedUntil > now) {
    const minutes = minutesBetween(now, existing.lockedUntil);
    return {
      success: false,
      error: `Akun Anda terkunci sementara. Coba lagi dalam ${minutes} menit.`,
    };
  }

  try {
    const hdrs = await headers();
    await auth.api.signInUsername({
      body: { username, password },
      headers: hdrs,
    });
  } catch {
    const failedCount = (existing?.failedCount ?? 0) + 1;
    const shouldLock = failedCount >= MAX_FAILED_ATTEMPTS;
    await prisma.loginAttempt.upsert({
      where: { identifier: username },
      update: {
        failedCount,
        lockedUntil: shouldLock
          ? new Date(now.getTime() + LOCK_DURATION_MIN * 60_000)
          : null,
        lastAttemptAt: now,
      },
      create: {
        identifier: username,
        failedCount,
        lockedUntil: shouldLock
          ? new Date(now.getTime() + LOCK_DURATION_MIN * 60_000)
          : null,
        lastAttemptAt: now,
      },
    });

    if (shouldLock) {
      return {
        success: false,
        error: `Terlalu banyak percobaan gagal. Akun terkunci selama ${LOCK_DURATION_MIN} menit.`,
      };
    }

    return {
      success: false,
      error: `Nama pengguna atau kata sandi salah. Percobaan ke-${failedCount} dari ${MAX_FAILED_ATTEMPTS}.`,
    };
  }

  if (existing) {
    await prisma.loginAttempt.delete({ where: { identifier: username } });
  }

  return { success: true };
}
