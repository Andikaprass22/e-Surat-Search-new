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
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
    >
      <Card
        className="group cursor-pointer transition-colors hover:border-primary/30"
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm truncate">
                  {result.dokumen.judul}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3 shrink-0" />
                    {result.dokumen.nomorSurat}
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    <Calendar className="h-3 w-3 shrink-0" />
                    {formatDate(result.dokumen.tanggal)}
                  </span>
                  <span className="flex items-center gap-1">
                    <FolderTree className="h-3 w-3 shrink-0" />
                    {result.dokumen.kategori.nama}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-1 sm:gap-2 shrink-0">
              <Badge variant="outline" className={`${color} text-[10px] sm:text-xs`}>
                {pct}%
              </Badge>
              {result.hasFilePath && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <a href={`/api/dokumen/${result.dokumenId}/download`} title="Unduh file">
                    <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary/70"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
