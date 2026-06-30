"use client";

import { motion } from "framer-motion";
import { SearchResultCard } from "@/components/pencarian/search-result-card";
import type { SearchResultItem } from "@/types";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export function SearchResults({ results }: { results: SearchResultItem[] }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Ditemukan {results.length} dokumen yang relevan.
      </p>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-3"
      >
        {results.map((r) => (
          <motion.div key={r.dokumenId} variants={fadeUp}>
            <SearchResultCard result={r} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
