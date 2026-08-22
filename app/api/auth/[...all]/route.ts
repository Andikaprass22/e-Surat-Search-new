import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

const handler = toNextJsHandler(auth);

async function checkBruteForceLock(req: NextRequest): Promise<NextResponse | null> {
  const url = req.nextUrl.pathname;
  const isSignInAttempt = url.includes("/sign-in/") || url.includes("/sign-in");
  if (!isSignInAttempt || req.method !== "POST") return null;
  try {
    const cloned = req.clone();
    const body = (await cloned.json().catch(() => null)) as Record<string, unknown> | null;
    const identifier = String(
      (body?.username as string) ?? (body?.email as string) ?? ""
    )
      .trim()
      .toLowerCase();
    if (!identifier) return null;
    const attempt = await prisma.loginAttempt.findUnique({
      where: { identifier },
    });
    if (attempt?.lockedUntil && attempt.lockedUntil > new Date()) {
      const mins = Math.max(
        1,
        Math.ceil((attempt.lockedUntil.getTime() - Date.now()) / 60000)
      );
      return NextResponse.json(
        {
          error: `Akun terkunci sementara. Coba lagi dalam ${mins} menit.`,
        },
        { status: 423 }
      );
    }
  } catch {
    return null;
  }
  return null;
}

export async function GET(req: NextRequest) {
  return handler.GET(req);
}

export async function POST(req: NextRequest) {
  const locked = await checkBruteForceLock(req);
  if (locked) return locked;
  return handler.POST(req);
}
