"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  FolderTree,
  FileText,
  History,
  Sparkles,
  BarChart3,
} from "lucide-react";
import type { DashboardStats } from "@/lib/data/dashboard";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const statCards: {
  key: keyof DashboardStats;
  label: string;
}[] = [
  { key: "totalDokumen", label: "Total Dokumen" },
  { key: "totalKategori", label: "Kategori" },
  { key: "totalPengguna", label: "Akun Terdaftar" },
  { key: "penggunaAktif", label: "Sesi Aktif" },
];

const adminShortcuts = [
  { title: "Pengguna", url: "/admin/pengguna", icon: Users },
  { title: "Kategori", url: "/admin/kategori", icon: FolderTree },
  { title: "Dokumen", url: "/admin/dokumen", icon: FileText },
];

const userShortcuts = [
  { title: "Riwayat", url: "/riwayat", icon: History },
  { title: "Template", url: "/template", icon: Sparkles },
  { title: "Laporan", url: "/laporan", icon: BarChart3 },
];

export function AdminDashboard({ stats }: { stats: DashboardStats }) {
  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="pb-12">
      
      {/* Metrics - Distilled to pure typography */}
      <motion.div variants={fadeUp} className="mb-16">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">Metrik Utama</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 py-6 border-y border-border/40">
          {statCards.map((s) => (
            <div key={s.key} className="flex flex-col gap-1 sm:gap-2">
              <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground">
                {stats[s.key].toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
        {/* Admin Navigation */}
        <motion.div variants={fadeUp} className="space-y-6">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Administrator</h3>
          <div className="flex flex-col gap-1 border-t border-border/40 pt-4">
            {adminShortcuts.map((s) => (
              <Link key={s.url} href={s.url} className="group flex items-center justify-between py-3 transition-colors">
                <div className="flex items-center gap-4">
                  <s.icon className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-foreground" />
                  <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                    {s.title}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground/40 transition-colors group-hover:text-foreground uppercase tracking-wider">Kelola</span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* User Navigation */}
        <motion.div variants={fadeUp} className="space-y-6">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Akses Umum</h3>
          <div className="flex flex-col gap-1 border-t border-border/40 pt-4">
            {userShortcuts.map((s) => (
              <Link key={s.url} href={s.url} className="group flex items-center justify-between py-3 transition-colors">
                <div className="flex items-center gap-4">
                  <s.icon className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-foreground" />
                  <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                    {s.title}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground/40 transition-colors group-hover:text-foreground uppercase tracking-wider">Akses</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
}
