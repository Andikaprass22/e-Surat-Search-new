import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireSession } from "@/lib/auth-helpers";
import { getTfidfIndex } from "@/lib/tfidf/engine";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/constants";
import type { SearchResultItem } from "@/types";

export type SearchApiResponse =
  | { ok: true; results: SearchResultItem[] }
  | { ok: false; error: string };

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json<SearchApiResponse>(
      { ok: false, error: "Parameter 'q' wajib diisi." },
      { status: 400 }
    );
  }

  if (query.length > 500) {
    return NextResponse.json<SearchApiResponse>(
      { ok: false, error: "Kata kunci maksimal 500 karakter." },
      { status: 400 }
    );
  }

  let user;
  try {
    user = await requireSession();
  } catch {
    return NextResponse.json<SearchApiResponse>(
      { ok: false, error: "Sesi tidak valid. Silakan login ulang." },
      { status: 401 }
    );
  }

  try {
    console.log(`[api/pencarian] Pencarian live: "${query}" oleh ${user.id}`);
    const index = await getTfidfIndex();
    const { searchDocuments: doSearch } = await import("@/lib/tfidf/engine");
    const results = await doSearch(query, index);
    if (results.length > 0) {
      const history = await prisma.searchHistory.create({
        data: { userId: user.id, query, resultCount: results.length },
      });
      const rankedForHistory = results.map((r, i) => ({
        searchHistoryId: history.id,
        documentId: r.dokumenId,
        relevanceScore: r.relevanceScore,
        rank: i + 1,
      }));
      await prisma.searchResult.createMany({ data: rankedForHistory });
      revalidateTag(CACHE_TAGS.RIWAYAT(user.id), "max");
      revalidateTag(CACHE_TAGS.RIWAYAT_ALL, "max");
      revalidateTag(CACHE_TAGS.LAPORAN(user.id), "max");
    }
    return NextResponse.json<SearchApiResponse>({ ok: true, results });
  } catch (err) {
    console.error("[api/pencarian] Error:", err);
    const msg = err instanceof Error ? err.message : "Gagal melakukan pencarian.";
    return NextResponse.json<SearchApiResponse>({ ok: false, error: msg }, { status: 500 });
  }
}
