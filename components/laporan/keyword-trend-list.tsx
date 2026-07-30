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

export function KeywordTrendList({
  keywords,
}: {
  keywords: { query: string; count: number }[];
}) {
  if (keywords.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada data kata kunci.
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
      {keywords.map((kw) => (
        <motion.div
          key={kw.query}
          variants={fadeUp}
          className="flex items-center justify-between rounded-lg border px-3 py-2"
        >
          <span className="text-sm font-medium truncate">{kw.query}</span>
          <Badge variant="secondary">{kw.count}×</Badge>
        </motion.div>
      ))}
    </motion.div>
  );
}
