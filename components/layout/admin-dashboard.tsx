"use client";

import * as React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Archive,
  MailOpen,
  Send,
  FolderTree,
  Users,
  UserCheck,
  History,
  BarChart3,
  ArrowRight,
  FileText,
} from "lucide-react";
import type { DashboardStats } from "@/lib/data/dashboard";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const statCards: {
  key: keyof DashboardStats;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}[] = [
  { key: "totalDokumen", label: "Total Arsip Surat", icon: Archive, tone: "bg-primary/10 text-primary" },
  { key: "totalSuratMasuk", label: "Surat Masuk", icon: MailOpen, tone: "bg-emerald-500/10 text-emerald-600" },
  { key: "totalSuratKeluar", label: "Surat Keluar", icon: Send, tone: "bg-sky-500/10 text-sky-600" },
  { key: "totalKategori", label: "Kategori", icon: FolderTree, tone: "bg-amber-500/10 text-amber-600" },
  { key: "totalPengguna", label: "Akun Terdaftar", icon: Users, tone: "bg-violet-500/10 text-violet-600" },
  { key: "penggunaAktif", label: "Akun Aktif", icon: UserCheck, tone: "bg-teal-500/10 text-teal-600" },
];

const adminShortcuts = [
  {
    title: "Arsip Surat",
    url: "/admin/dokumen",
    icon: FileText,
    desc: "Tambah, ubah, dan hapus arsip surat masuk & keluar",
  },
  {
    title: "Kategori",
    url: "/admin/kategori",
    icon: FolderTree,
    desc: "Kelola klasifikasi kategori dokumen",
  },
  {
    title: "Pengguna",
    url: "/admin/pengguna",
    icon: Users,
    desc: "Buat dan kelola akun pengguna sistem",
  },
];

const userShortcuts = [
  {
    title: "Riwayat",
    url: "/riwayat",
    icon: History,
    desc: "Tinjau aktivitas pencarian seluruh pengguna",
  },
  {
    title: "Laporan",
    url: "/laporan",
    icon: BarChart3,
    desc: "Rekap arsip dan statistik pencarian",
  },
];

export function AdminDashboard({ stats }: { stats: DashboardStats }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      className="pb-12 space-y-14"
    >
      {/* Metrics */}
      <motion.div variants={fadeUp}>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Ringkasan Arsip
          </h2>
          <span className="text-xs text-muted-foreground">
            Data arsip terkini
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((s) => (
            <div
              key={s.key}
              className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4"
            >
              <div className={`inline-flex w-fit rounded-lg p-2 ${s.tone}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-semibold tracking-tight tabular-nums">
                  {stats[s.key].toLocaleString("id-ID")}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Admin actions */}
      <motion.div variants={fadeUp}>
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Panel Kerja
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {adminShortcuts.map((s) => (
            <Link
              key={s.url}
              href={s.url}
              className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* User features */}
      <motion.div variants={fadeUp}>
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Fitur Umum
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {userShortcuts.map((s) => (
            <Link
              key={s.url}
              href={s.url}
              className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div className="rounded-lg bg-muted p-2.5 text-muted-foreground group-hover:text-primary transition-colors">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
