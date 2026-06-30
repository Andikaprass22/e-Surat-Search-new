"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DokumenTable,
  type DokumenRowAction,
} from "@/components/dokumen/dokumen-table";
import { DokumenFormDialog } from "@/components/dokumen/dokumen-form-dialog";
import { DeleteDokumenDialog } from "@/components/dokumen/delete-dokumen-dialog";
import type { DokumenListItem, KategoriListItem } from "@/types";

type FormMode =
  | { kind: "create" }
  | { kind: "edit"; dokumen: DokumenListItem }
  | null;

export function DokumenSection({
  initialData,
  kategoriOptions,
}: {
  initialData: DokumenListItem[];
  kategoriOptions: KategoriListItem[];
}) {
  const [formMode, setFormMode] = React.useState<FormMode>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteDokumen, setDeleteDokumen] =
    React.useState<DokumenListItem | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const handleAction = React.useCallback((a: DokumenRowAction) => {
    if (a.type === "edit") {
      setFormMode({ kind: "edit", dokumen: a.dokumen });
      setFormOpen(true);
      return;
    }
    setDeleteDokumen(a.dokumen);
    setDeleteOpen(true);
  }, []);

  const handleAdd = React.useCallback(() => {
    setFormMode({ kind: "create" });
    setFormOpen(true);
  }, []);

  const reload = React.useCallback(() => {
    if (typeof window !== "undefined") window.location.reload();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Tambah Dokumen
          </Button>
        </motion.div>
      </div>

      <DokumenTable
        data={initialData}
        kategoriOptions={kategoriOptions}
        onAction={handleAction}
      />

      <DokumenFormDialog
        mode={formMode}
        kategoriOptions={kategoriOptions}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={reload}
      />

      <DeleteDokumenDialog
        dokumen={deleteDokumen}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirmed={reload}
      />
    </div>
  );
}
