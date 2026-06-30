"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileSearch,
  History,
  Sparkles,
  BarChart3,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/lib/auth-helpers";
import type { RiwayatItem } from "@/types";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

const shortcuts = [
  {
    title: "Pencarian",
    description: "Cari dokumen dengan TF-IDF",
    url: "/pencarian",
    icon: FileSearch,
  },
  {
    title: "Riwayat",
    description: "Lihat riwayat pencarian",
    url: "/riwayat",
    icon: History,
  },
  {
    title: "Template",
    description: "Simpan pola pencarian untuk digunakan kembali",
    url: "/template",
    icon: Sparkles,
  },
  {
    title: "Laporan",
    description: "Statistik dan laporan pencarian",
    url: "/laporan",
    icon: BarChart3,
  },
];

function ShortcutCard({
  shortcut,
}: {
  shortcut: (typeof shortcuts)[number];
}) {
  const Icon = shortcut.icon;
  return (
    <motion.div variants={fadeUp}>
      <Card className="group transition-colors hover:border-primary/30">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm">{shortcut.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {shortcut.description}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              asChild
            >
              <Link href={shortcut.url}>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function UserDashboard({
  user,
  riwayat,
}: {
  user: AuthUser;
  riwayat: RiwayatItem[];
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-semibold">
          Selamat datang, {user.name}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gunakan fitur di bawah untuk mencari dan mengelola dokumen.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-3 sm:grid-cols-2"
      >
        {shortcuts.map((s) => (
          <ShortcutCard key={s.url} shortcut={s} />
        ))}
      </motion.div>

      {riwayat.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
            Riwayat Terbaru
          </h2>
          <div className="space-y-2">
            {riwayat.slice(0, 3).map((r) => (
              <Link
                key={r.id}
                href={`/riwayat/${r.id}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{r.query}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.resultCount} hasil &middot;{" "}
                    {r.createdAt.toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {riwayat.length === 0 && (
        <div className="flex flex-col items-center gap-3 text-center py-6">
          <History className="h-10 w-10 text-muted-foreground" />
          <h2 className="text-base font-semibold">Belum Ada Riwayat</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Mulai cari dokumen untuk melihat riwayat pencarian di sini.
          </p>
        </div>
      )}
    </div>
  );
}
