import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/constants";
import type { UserListItem, UserRole } from "@/types";

type UserRow = {
  id: string;
  name: string;
  username: string | null;
  email: string | null;
  role: string | null;
  banned: boolean | null;
  createdAt: Date;
  accounts: { providerId: string }[];
};

function toListItem(u: UserRow): UserListItem {
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    role: (u.role ?? "user") as UserRole,
    banned: Boolean(u.banned),
    hasPassword: u.accounts.some((a) => a.providerId === "credential"),
    createdAt: u.createdAt,
  };
}

export async function getUserList(): Promise<UserListItem[]> {
  "use cache";
  cacheTag(CACHE_TAGS.PENGGUNA_LIST);
  console.log("[getUserList] Mengambil daftar pengguna...");

  const rows = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      banned: true,
      createdAt: true,
      accounts: { select: { providerId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(toListItem);
}

export async function getUserById(id: string): Promise<UserListItem | null> {
  "use cache";
  cacheTag(CACHE_TAGS.PENGGUNA(id));
  console.log(`[getUserById] Mengambil data pengguna ID: ${id}`);

  const row = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      banned: true,
      createdAt: true,
      accounts: { select: { providerId: true } },
    },
  });

  return row ? toListItem(row) : null;
}
