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
  { key: "totalDokumen", label: "Total Arsip", icon: Archive, tone: "bg-[#173F5F] text-white" },
  { key: "totalSuratMasuk", label: "Surat Masuk", icon: MailOpen, tone: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  { key: "totalSuratKeluar", label: "Surat Keluar", icon: Send, tone: "bg-sky-50 text-sky-700 border border-sky-200" },
  { key: "totalKategori", label: "Kategori", icon: FolderTree, tone: "bg-amber-50 text-amber-700 border border-amber-200" },
  { key: "totalPengguna", label: "Akun Terdaftar", icon: Users, tone: "bg-slate-50 text-slate-700 border border-slate-200" },
  { key: "penggunaAktif", label: "Akun Aktif", icon: UserCheck, tone: "bg-teal-50 text-teal-700 border border-teal-200" },
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
      className="pb-8 space-y-8"
    >
      <motion.div variants={fadeUp}>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Ringkasan Arsip</h2>
          <span className="text-xs text-muted-foreground">Data terkini</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {statCards.map((s) => (
            <div
              key={s.key}
              className="flex flex-col gap-3 rounded-[10px] border border-border bg-white p-4"
            >
              <div className={`inline-flex w-fit rounded-[8px] p-2 ${s.tone}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-semibold tracking-tight tabular-nums text-[#172B3A]">
                  {stats[s.key].toLocaleString("id-ID")}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <h2 className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">Panel Kerja</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {adminShortcuts.map((s) => (
            <Link
              key={s.url}
              href={s.url}
              className="group flex flex-col gap-3 rounded-[10px] border border-border bg-white p-5 transition-colors hover:border-[#173F5F]/20"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-[8px] bg-[#173F5F] p-2.5 text-white">
                  <s.icon className="h-4 w-4" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-[#173F5F] transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#172B3A]">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <h2 className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">Fitur Umum</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {userShortcuts.map((s) => (
            <Link
              key={s.url}
              href={s.url}
              className="group flex items-center gap-4 rounded-[10px] border border-border bg-white p-4 transition-colors hover:border-[#173F5F]/20"
            >
              <div className="rounded-[8px] bg-muted p-2.5 text-muted-foreground group-hover:text-[#173F5F] transition-colors">
                <s.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#172B3A]">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
