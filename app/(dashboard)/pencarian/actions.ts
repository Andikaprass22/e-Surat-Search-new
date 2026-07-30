"use server";

import { requireSession } from "@/lib/auth-helpers";
import { getTfidfIndex, computeSearchResults } from "@/lib/tfidf/engine";
import type { SearchResultItem } from "@/types";

export type SearchActionState =
  | { ok: true; historyId: string; results: SearchResultItem[] }
  | { ok: false; error: string };

export async function searchDokumenAction(
  _prev: SearchActionState | undefined,
  formData: FormData
): Promise<SearchActionState> {
  const query = String(formData.get("query") ?? "").trim();

  if (!query) return { ok: false, error: "Kata kunci pencarian wajib diisi." };
  if (query.length > 500) return { ok: false, error: "Kata kunci maksimal 500 karakter." };

  console.log(`[searchDokumenAction] Pencarian: "${query}"`);

  let user;
  try {
    user = await requireSession();
  } catch {
    return { ok: false, error: "Sesi tidak valid. Silakan login ulang." };
  }

  try {
    const index = await getTfidfIndex();
    const { historyId, results } = await computeSearchResults(query, index, user.id);

    if (results.length === 0) {
      return { ok: true, historyId: "", results: [] };
    }

    return { ok: true, historyId, results };
  } catch (err) {
    console.error("[searchDokumenAction] Error:", err);
    const msg = err instanceof Error ? err.message : "Gagal melakukan pencarian.";
    return { ok: false, error: msg };
  }
}
