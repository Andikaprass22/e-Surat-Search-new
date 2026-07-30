"use client";

import * as React from "react";
import { useRef, useState, useEffect, useCallback } from "react";
import { Loader2, X } from "lucide-react";
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
    <div className="space-y-8 sm:space-y-12">
      <div className="relative group">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ketik kata kunci..."
          className="w-full bg-transparent border-0 border-b-2 border-border/40 pb-3 sm:pb-4 text-2xl sm:text-3xl md:text-5xl font-light outline-none transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:ring-0 px-0"
          autoFocus
        />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 -mt-1 sm:-mt-2 flex items-center gap-2">
          {loading && <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />}
          {query.length > 0 && !loading && (
            <button
              onClick={handleClear}
              className="p-1.5 sm:p-2 text-muted-foreground/40 hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
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
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-6">
            Menampilkan {results.length} Hasil Untuk &ldquo;{query}&rdquo;
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
