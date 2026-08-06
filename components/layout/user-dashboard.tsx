"use client";

import * as React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { History, BarChart3, Search, ArrowRight, FileSearch } from "lucide-react";
import type { AuthUser } from "@/lib/auth-helpers";
import type { RiwayatItem } from "@/types";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const shortcuts = [
  {
    title: "Riwayat Pencarian",
    url: "/riwayat",
    icon: History,
    desc: "Lihat kembali pencarian yang sudah dilakukan",
  },
  {
    title: "Laporan Aktivitas",
    url: "/laporan",
    icon: BarChart3,
    desc: "Ringkasan pencarian dan kata kunci tersering",
  },
];

function formatTanggal(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function UserDashboard({
  user,
  riwayat,
}: {
  user: AuthUser;
  riwayat: RiwayatItem[];
}) {
  const firstName = user.name.split(" ")[0];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      className="pb-12"
    >
      {/* Hero Search */}
      <motion.div variants={fadeUp} className="mb-14">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary mb-2">
            Selamat datang, {firstName}
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
            Cari arsip surat
          </h1>
          <p className="text-muted-foreground max-w-lg leading-relaxed">
            Masukkan kata kunci untuk mencari surat dan dokumen yang tersimpan di
            dalam sistem. Hasil diurutkan berdasarkan tingkat relevansi.
          </p>
        </div>

        <Link
          href="/pencarian"
          className="group block max-w-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
        >
          <div className="flex items-center gap-3 w-full rounded-2xl border border-border bg-background px-5 py-4 transition-all hover:border-primary/50 hover:shadow-md">
            <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            <span className="text-muted-foreground text-base flex-1 truncate">
              Ketik kata kunci dokumen, nomor surat, atau perihal...
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Cari
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Quick links */}
        <motion.div variants={fadeUp} className="md:col-span-4 space-y-5">
          <h2 className="text-sm font-semibold text-foreground">Akses Cepat</h2>
          <div className="flex flex-col gap-3">
            {shortcuts.map((s) => (
              <Link
                key={s.url}
                href={s.url}
                className="group flex items-start gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary shrink-0">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* History */}
        <motion.div variants={fadeUp} className="md:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Aktivitas Terakhir
            </h2>
            {riwayat.length > 0 && (
              <Link
                href="/riwayat"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Lihat semua
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {riwayat.length > 0 ? (
            <div className="divide-y divide-border/60 rounded-xl border border-border/60 bg-card">
              {riwayat.slice(0, 5).map((r) => (
                <Link
                  key={r.id}
                  href={`/riwayat/${r.id}`}
                  className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/40"
                >
                  <div className="rounded-lg bg-muted p-2 text-muted-foreground shrink-0 group-hover:text-primary transition-colors">
                    <FileSearch className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {r.query}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.resultCount} hasil · {formatTanggal(r.createdAt)}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
              <FileSearch className="h-8 w-8 text-muted-foreground/40" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Belum ada riwayat pencarian
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Setiap pencarian yang Anda lakukan akan muncul di sini.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
