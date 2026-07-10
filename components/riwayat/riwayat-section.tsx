"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { History, Loader2, Search } from "lucide-react";
import type { RiwayatItem } from "@/types";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RiwayatSection({ data }: { data: RiwayatItem[] }) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 text-center py-20 px-4 border-t border-border/40">
        <History className="h-8 w-8 text-muted-foreground/30 mb-2" />
        <h2 className="text-base font-medium">Belum Ada Riwayat</h2>
        <p className="text-sm text-muted-foreground font-light max-w-sm">
          Riwayat pencarian akan muncul setelah Anda mulai mengeksplorasi arsip dokumen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
          Semua Rekaman
        </p>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
          {data.length} Pencarian
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col"
      >
        {data.map((item) => (
          <RiwayatItemRow key={item.id} item={item} />
        ))}
      </motion.div>
    </div>
  );
}

function RiwayatItemRow({ item }: { item: RiwayatItem }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  function handleClick() {
    setLoading(true);
    router.push(`/riwayat/${item.id}`);
  }

  return (
    <motion.div variants={fadeUp}>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 border-b border-border/40 py-5 transition-colors hover:bg-muted/30 px-3 -mx-3 rounded-sm text-left"
      >
        <div className="flex items-center gap-5 min-w-0">
          <div className="text-muted-foreground/30 transition-colors group-hover:text-primary">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-base truncate text-foreground/80 transition-colors group-hover:text-foreground">
              {item.query}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground shrink-0 pl-10 sm:pl-0">
          <span>{item.resultCount} hasil</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{formatDate(item.createdAt)}</span>
        </div>
      </button>
    </motion.div>
  );
}
