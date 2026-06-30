"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  FolderTree,
  FileText,
  ShieldCheck,
  History,
  Sparkles,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DashboardStats } from "@/lib/data/dashboard";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

const statCards: {
  key: keyof DashboardStats;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    key: "totalPengguna",
    label: "Pengguna",
    icon: Users,
    color: "text-blue-600 bg-blue-500/10",
  },
  {
    key: "totalKategori",
    label: "Kategori",
    icon: FolderTree,
    color: "text-amber-600 bg-amber-500/10",
  },
  {
    key: "totalDokumen",
    label: "Dokumen",
    icon: FileText,
    color: "text-emerald-600 bg-emerald-500/10",
  },
  {
    key: "penggunaAktif",
    label: "Pengguna Aktif",
    icon: ShieldCheck,
    color: "text-violet-600 bg-violet-500/10",
  },
];

type Shortcut = {
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const adminShortcuts: Shortcut[] = [
  {
    title: "Kelola Pengguna",
    description: "Buat, edit, blokir, dan hapus akun pengguna",
    url: "/admin/pengguna",
    icon: Users,
  },
  {
    title: "Kelola Kategori",
    description: "Tambah, edit, dan hapus kategori dokumen",
    url: "/admin/kategori",
    icon: FolderTree,
  },
  {
    title: "Semua Dokumen",
    description: "Kelola dokumen dan indeks TF-IDF",
    url: "/admin/dokumen",
    icon: FileText,
  },
];

const userShortcuts: Shortcut[] = [
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

function StatCard({
  stat,
  data,
}: {
  stat: (typeof statCards)[number];
  data: DashboardStats;
}) {
  const Icon = stat.icon;
  return (
    <motion.div variants={fadeUp}>
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className={`rounded-lg p-2.5 ${stat.color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">
              {data[stat.key]}
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ShortcutCard({ shortcut }: { shortcut: Shortcut }) {
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
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{shortcut.title}</h3>
                  {shortcut.badge && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {shortcut.badge}
                    </Badge>
                  )}
                </div>
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

export function AdminDashboard({ stats }: { stats: DashboardStats }) {
  return (
    <div className="space-y-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statCards.map((s) => (
          <StatCard key={s.key} stat={s} data={stats} />
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
        >
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
            Administrator
          </h2>
          <div className="grid gap-3">
            {adminShortcuts.map((s) => (
              <ShortcutCard key={s.url} shortcut={s} />
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
        >
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
            Fitur Pengguna
          </h2>
          <div className="grid gap-3">
            {userShortcuts.map((s) => (
              <ShortcutCard key={s.url} shortcut={s} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
