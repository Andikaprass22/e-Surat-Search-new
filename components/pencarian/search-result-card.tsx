"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, Calendar, FolderTree, Loader2, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SearchResultItem } from "@/types";

function formatScore(score: number): number {
  return Math.round(score * 100);
}

function scoreColor(score: number): string {
  if (score >= 0.7) return "bg-emerald-500/10 text-emerald-700 border-emerald-500/30";
  if (score >= 0.4) return "bg-amber-500/10 text-amber-700 border-amber-500/30";
  return "bg-muted text-muted-foreground";
}

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function SearchResultCard({ result }: { result: SearchResultItem }) {
  const pct = formatScore(result.relevanceScore);
  const color = scoreColor(result.relevanceScore);
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  function handleClick() {
    setLoading(true);
    router.push(`/pencarian/${result.dokumenId}`);
  }

  return (
    <Card
      className="group cursor-pointer transition-colors hover:border-primary/40"
      onClick={handleClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary shrink-0">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {result.dokumen.judul}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-mono">{result.dokumen.nomorSurat}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  {formatDate(result.dokumen.tanggal)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FolderTree className="h-3.5 w-3.5 shrink-0" />
                  {result.dokumen.kategori.nama}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className={`${color} text-xs font-medium`}>
              Relevansi {pct}%
            </Badge>
            {result.hasFilePath && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <a href={`/api/dokumen/${result.dokumenId}/download`} title="Unduh file">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="h-1.5 w-full max-w-64 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary/70"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">
            skor {pct}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
