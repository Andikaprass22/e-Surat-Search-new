"use client";

import * as React from "react";
import { useRef, useState, useEffect, useCallback } from "react";
import { Loader2, Search, X } from "lucide-react";
import { SearchResults } from "@/components/pencarian/search-results";
import { EmptySearch } from "@/components/pencarian/empty-search";
import type { SearchResultItem } from "@/types";
import type { SearchApiResponse } from "@/app/api/pencarian/route";

export function SearchBar({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/pencarian?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      const data: SearchApiResponse = await res.json();

      if (controller.signal.aborted) return;

      if (!data.ok) {
        setError(data.error);
        setResults([]);
      } else {
        setResults(data.results);
        setError(null);
      }
      setHasSearched(true);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("[SearchBar] Fetch error:", err);
      setError("Gagal melakukan pencarian.");
      setResults([]);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      setLoading(false);
      return;
    }

    doSearch(trimmed);
  }, [query, doSearch]);

  function handleClear() {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setError(null);
    if (abortRef.current) abortRef.current.abort();
    inputRef.current?.focus();
  }

  return (
    <div className="space-y-8">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748B] pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ketik kata kunci, nomor surat, atau perihal..."
          className="w-full rounded-[10px] border border-border bg-white py-3.5 pl-12 pr-12 text-[15px] outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-[#173F5F]/30 focus:ring-2 focus:ring-[#173F5F]/10"
          autoFocus
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {query.length > 0 && !loading && (
            <button
              onClick={handleClear}
              aria-label="Bersihkan pencarian"
              className="p-1.5 text-muted-foreground/50 hover:text-foreground rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {hasSearched && results.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-sm text-muted-foreground mb-5">
            Menampilkan{" "}
            <span className="font-medium text-foreground">
              {results.length} dokumen
            </span>{" "}
            untuk &ldquo;{query}&rdquo;
          </p>
          <SearchResults results={results} />
        </div>
      )}

      {hasSearched && results.length === 0 && !error && (
        <EmptySearch hasSearched />
      )}

      {!hasSearched && <EmptySearch />}
    </div>
  );
}
