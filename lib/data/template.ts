import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/constants";
import type { TemplateItem } from "@/types";

function toListItem(t: {
  id: string;
  label: string;
  query: string;
  createdAt: Date;
}): TemplateItem {
  return {
    id: t.id,
    label: t.label,
    query: t.query,
    createdAt: t.createdAt,
  };
}

export async function getTemplateList(
  userId: string
): Promise<TemplateItem[]> {
  "use cache";
  cacheTag(CACHE_TAGS.TEMPLATE_LIST(userId));
  console.log(`[getTemplateList] Mengambil daftar template user: ${userId}`);

  const rows = await prisma.searchTemplate.findMany({
    where: { userId },
    select: {
      id: true,
      label: true,
      query: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(toListItem);
}

export async function getTemplateById(
  id: string,
  userId: string
): Promise<TemplateItem | null> {
  "use cache";
  cacheTag(CACHE_TAGS.TEMPLATE(id));
  console.log(`[getTemplateById] Mengambil data template ID: ${id}`);

  const row = await prisma.searchTemplate.findFirst({
    where: { id, userId },
    select: {
      id: true,
      label: true,
      query: true,
      createdAt: true,
    },
  });

  return row ? toListItem(row) : null;
}
