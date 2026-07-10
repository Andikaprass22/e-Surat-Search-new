"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  History,
  Sparkles,
  BarChart3,
  Search,
} from "lucide-react";
import type { AuthUser } from "@/lib/auth-helpers";
import type { RiwayatItem } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const shortcuts = [
  {
    title: "Riwayat",
    url: "/riwayat",
    icon: History,
  },
  {
    title: "Template",
    url: "/template",
    icon: Sparkles,
  },
  {
    title: "Laporan",
    url: "/laporan",
    icon: BarChart3,
  },
];

export function UserDashboard({
  user,
  riwayat,
}: {
  user: AuthUser;
  riwayat: RiwayatItem[];
}) {
  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="pb-12">
      
      {/* Hero Search Section - Distilled */}
      <motion.div variants={fadeUp} className="mb-16">
        <h2 className="text-4xl font-medium tracking-tight mb-4">Pencarian Dokumen</h2>
        <p className="text-lg text-muted-foreground font-light max-w-xl leading-relaxed mb-8">
          Temukan surat, dokumen, dan riwayat BMN dengan cepat menggunakan algoritma pencarian presisi.
        </p>
        
        <Link href="/pencarian" className="group block max-w-2xl">
          <div className="flex items-center gap-3 w-full rounded-full border border-border bg-background px-6 py-4 transition-all hover:border-primary/50 hover:shadow-sm">
            <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-muted-foreground text-base font-light">Ketik kata kunci dokumen...</span>
          </div>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Quick Links */}
        <motion.div variants={fadeUp} className="md:col-span-4 space-y-6">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Pintasan</h3>
          <div className="flex flex-col gap-1">
            {shortcuts.map((s) => (
              <Link key={s.url} href={s.url} className="group flex items-center gap-4 px-3 py-3 rounded-lg -ml-3 transition-colors hover:bg-muted/50">
                <div className="text-muted-foreground transition-colors group-hover:text-foreground">
                  <s.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                  {s.title}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* History */}
        <motion.div variants={fadeUp} className="md:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Aktivitas Terakhir</h3>
            {riwayat.length > 0 && (
              <Link href="/riwayat" className="text-xs font-medium text-primary hover:underline">
                Lihat Semua
              </Link>
            )}
          </div>
          
          {riwayat.length > 0 ? (
            <div className="flex flex-col border-t border-border/40">
              {riwayat.slice(0, 5).map((r) => (
                <Link
                  key={r.id}
                  href={`/riwayat/${r.id}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6 border-b border-border/40 py-4 transition-colors hover:bg-muted/30 px-2 -mx-2 rounded-sm"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <History className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    <p className="text-sm font-medium truncate text-foreground/80 group-hover:text-foreground transition-colors">{r.query}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                    <span>{r.resultCount} hasil</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>
                      {r.createdAt.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border-t border-border/40 pt-8 pb-4">
              <p className="text-sm text-muted-foreground font-light">Belum ada riwayat pencarian.</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
