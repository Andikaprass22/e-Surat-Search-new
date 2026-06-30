"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { History, FileText, Clock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RiwayatItem } from "@/types";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RiwayatSection({ data }: { data: RiwayatItem[] }) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 text-center py-10">
        <History className="h-10 w-10 text-muted-foreground" />
        <h2 className="text-base font-semibold">Belum Ada Riwayat</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Riwayat pencarian akan muncul setelah Anda melakukan pencarian dokumen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Total {data.length} pencarian.
      </p>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        {data.map((item) => (
          <RiwayatCard key={item.id} item={item} />
        ))}
      </motion.div>
    </div>
  );
}

function RiwayatCard({ item }: { item: RiwayatItem }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  function handleClick() {
    setLoading(true);
    router.push(`/riwayat/${item.id}`);
  }

  return (
    <motion.div variants={fadeUp}>
      <Card
        className="group cursor-pointer transition-colors hover:border-primary/30"
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {item.query}
                </h3>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <Badge variant="secondary">
              {item.resultCount} hasil
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
