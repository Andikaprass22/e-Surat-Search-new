"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <motion.div
      className="flex min-h-screen items-center justify-center bg-background px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex max-w-md flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted"
        >
          <FileQuestion className="h-8 w-8 text-muted-foreground" />
        </motion.div>

        <motion.h1
          className="text-3xl font-semibold tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Halaman Tidak Ditemukan
        </motion.h1>

        <motion.p
          className="mt-3 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Halaman yang Anda cari tidak ada, telah dipindahkan, atau Anda tidak
          memiliki akses ke halaman tersebut.
        </motion.p>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Kembali ke Beranda
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
