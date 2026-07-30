"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

function formatDate(day: string): string {
  const d = new Date(day + "T00:00:00");
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TrendHarianList({
  trend,
}: {
  trend: { tanggal: string; count: number }[];
}) {
  if (trend.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada data tren pencarian.
      </p>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-2"
    >
      {trend.map((t) => (
        <motion.div
          key={t.tanggal}
          variants={fadeUp}
          className="flex items-center justify-between rounded-lg border px-3 py-2"
        >
          <span className="text-sm font-medium">{formatDate(t.tanggal)}</span>
          <Badge variant="secondary">{t.count} pencarian</Badge>
        </motion.div>
      ))}
    </motion.div>
  );
}
