"use client";

import { motion, type Variants } from "framer-motion";
import { SearchResultCard } from "@/components/pencarian/search-result-card";
import type { SearchResultItem } from "@/types";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export function SearchResults({ results }: { results: SearchResultItem[] }) {
  return (
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
  );
}
