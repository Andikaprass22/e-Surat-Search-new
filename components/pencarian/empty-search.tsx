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
        className="flex flex-col items-center gap-3 text-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-14"
      >
        <SearchX className="h-8 w-8 text-muted-foreground/50" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Tidak ada dokumen yang cocok
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-md leading-relaxed">
            Coba gunakan kata kunci yang lebih umum, atau periksa kembali
            ejaan nomor surat dan perihal yang Anda cari.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center gap-3 text-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-14"
    >
      <FileSearch className="h-8 w-8 text-muted-foreground/50" />
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          Mulai pencarian
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-md leading-relaxed">
          Ketik kata kunci di kolom di atas. Hasil akan muncul secara
          otomatis saat Anda mengetik.
        </p>
      </div>
    </motion.div>
  );
}
