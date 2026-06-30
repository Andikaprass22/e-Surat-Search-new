"use client";

import * as React from "react";
import { useRef, useState, useEffect, useCallback } from "react";
import { Search, Loader2, X } from "lucide-react";
import { SearchResults } from "@/components/pencarian/search-results";
import { EmptySearch } from "@/components/pencarian/empty-search";
import type { SearchResultItem } from "@/types";
import type { SearchApiResponse } from "@/app/api/pencarian/route";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

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
    <div className="space-y-6">
      <div
        className={`flex items-center gap-3 rounded-full border bg-background px-5 transition-all duration-200 ${
          focused
            ? "shadow-lg border-primary/30 scale-[1.01]"
            : "shadow-sm border-border hover:shadow-md"
        }`}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
        )}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Ketik kata kunci pencarian..."
          className="flex-1 bg-transparent py-3.5 text-base outline-none placeholder:text-muted-foreground/60"
          autoFocus
        />
        {query.length > 0 && !loading && (
          <button
            onClick={handleClear}
            className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive text-center" role="alert">
          {error}
        </p>
      )}

      {hasSearched && results.length > 0 && (
        <div className="pt-2">
          <p className="text-sm text-muted-foreground mb-3">
            Menampilkan {results.length} dokumen untuk &ldquo;{query}&rdquo;
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
