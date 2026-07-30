"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { History, Loader2, Search, Trash2 } from "lucide-react";
import type { RiwayatItem } from "@/types";
import { deleteAllRiwayatAction } from "@/app/(dashboard)/riwayat/actions";
import { useActionState } from "react";

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

export function RiwayatSection({ data, isAdmin }: { data: RiwayatItem[]; isAdmin?: boolean }) {
  const [state, formAction, pending] = useActionState(deleteAllRiwayatAction, undefined);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      {data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-center py-20 px-4 border-t border-border/40">
          <History className="h-8 w-8 text-muted-foreground/30 mb-2" />
          <h2 className="text-base font-medium">Belum Ada Riwayat</h2>
          <p className="text-sm text-muted-foreground font-light max-w-sm">
            Riwayat pencarian akan muncul setelah Anda mulai mengeksplorasi arsip dokumen.
          </p>
        </div>
      ) : (
        <>
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
        </>
      )}

      {isAdmin && (
        <div className="border-t border-border/40 pt-6 flex items-center justify-end">
          {confirmOpen ? (
            <form action={formAction} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 transition-colors px-3 py-1.5 rounded-md border border-red-200 hover:border-red-300 bg-white hover:bg-red-50 disabled:opacity-50"
              >
                {pending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                {pending ? "Menghapus..." : "Ya, Hapus Semua"}
              </button>
            </form>
          ) : (
            <button
              onClick={() => setConfirmOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus Semua Riwayat
            </button>
          )}
          {state && !state.ok && (
            <p className="text-xs text-red-500">{state.error}</p>
          )}
        </div>
      )}
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
        className="w-full group flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6 border-b border-border/40 py-4 sm:py-5 transition-colors hover:bg-muted/30 px-2 sm:px-3 -mx-2 sm:-mx-3 rounded-sm text-left"
      >
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <div className="text-muted-foreground/30 transition-colors group-hover:text-primary shrink-0">
            {loading ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-primary" />
            ) : (
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-sm sm:text-base truncate text-foreground/80 transition-colors group-hover:text-foreground">
              {item.query}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium text-muted-foreground shrink-0 pl-10 sm:pl-0">
          <span>{item.resultCount} hasil</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{formatDate(item.createdAt)}</span>
        </div>
      </button>
    </motion.div>
  );
}
