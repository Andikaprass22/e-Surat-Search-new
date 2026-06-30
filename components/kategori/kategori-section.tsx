"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  KategoriTable,
  type KategoriRowAction,
} from "@/components/kategori/kategori-table";
import { KategoriFormDialog } from "@/components/kategori/kategori-form-dialog";
import { DeleteKategoriDialog } from "@/components/kategori/delete-kategori-dialog";
import type { KategoriListItem } from "@/types";

type FormMode =
  | { kind: "create" }
  | { kind: "edit"; kategori: KategoriListItem }
  | null;

export function KategoriSection({
  initialData,
}: {
  initialData: KategoriListItem[];
}) {
  const [formMode, setFormMode] = React.useState<FormMode>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteKategori, setDeleteKategori] =
    React.useState<KategoriListItem | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const handleAction = React.useCallback((a: KategoriRowAction) => {
    if (a.type === "edit") {
      setFormMode({ kind: "edit", kategori: a.kategori });
      setFormOpen(true);
      return;
    }
    setDeleteKategori(a.kategori);
    setDeleteOpen(true);
  }, []);

  const handleAdd = React.useCallback(() => {
    setFormMode({ kind: "create" });
    setFormOpen(true);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Tambah Kategori
          </Button>
        </motion.div>
      </div>

      <KategoriTable data={initialData} onAction={handleAction} />

      <KategoriFormDialog
        mode={formMode}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => {
          if (typeof window !== "undefined") window.location.reload();
        }}
      />

      <DeleteKategoriDialog
        kategori={deleteKategori}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirmed={() => {
          if (typeof window !== "undefined") window.location.reload();
        }}
      />
    </div>
  );
}
