"use client";

import { motion } from "framer-motion";
import { FileSearch, SearchX } from "lucide-react";

export function EmptySearch({ hasSearched }: { hasSearched?: boolean }) {
  if (hasSearched) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col items-center gap-3 text-center py-10"
      >
        <SearchX className="h-10 w-10 text-muted-foreground" />
        <h2 className="text-base font-semibold">Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Tidak ada dokumen yang cocok dengan kata kunci tersebut. Coba gunakan kata kunci berbeda atau lebih umum.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center gap-3 text-center py-10"
    >
      <FileSearch className="h-10 w-10 text-muted-foreground" />
      <h2 className="text-base font-semibold">Cari Dokumen</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        Masukkan kata kunci di kolom pencarian untuk menemukan dokumen berdasarkan relevansi TF-IDF.
      </p>
    </motion.div>
  );
}
