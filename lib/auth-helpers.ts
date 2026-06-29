import { headers } from "next/headers";
import { redirect, forbidden } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  banned: boolean;
};

async function getBannedFromDb(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { banned: true },
  });
  return Boolean(user?.banned);
}

export async function requireSession(): Promise<AuthUser> {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });
  if (!session) {
    redirect("/login");
  }
  const isBanned = await getBannedFromDb(session.user.id);
  if (isBanned) {
    await auth.api.signOut({ headers: hdrs });
    redirect("/login?banned=1");
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role ?? "user",
    banned: isBanned,
  };
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireSession();
  if (user.role !== "admin") {
    forbidden();
  }
  return user;
}

export async function requireUser(): Promise<AuthUser> {
  const user = await requireSession();
  if (user.role !== "user") {
    forbidden();
  }
  return user;
}
