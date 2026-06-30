import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-helpers";
import { getTfidfIndex, searchDocuments } from "@/lib/tfidf/engine";
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

  try {
    await requireSession();
  } catch {
    return NextResponse.json<SearchApiResponse>(
      { ok: false, error: "Sesi tidak valid. Silakan login ulang." },
      { status: 401 }
    );
  }

  try {
    console.log(`[api/pencarian] Pencarian live: "${query}"`);
    const index = await getTfidfIndex();
    const results = await searchDocuments(query, index);

    return NextResponse.json<SearchApiResponse>({ ok: true, results });
  } catch (err) {
    console.error("[api/pencarian] Error:", err);
    const msg = err instanceof Error ? err.message : "Gagal melakukan pencarian.";
    return NextResponse.json<SearchApiResponse>({ ok: false, error: msg }, { status: 500 });
  }
}
