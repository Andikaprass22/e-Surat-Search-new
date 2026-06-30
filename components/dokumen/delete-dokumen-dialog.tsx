"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteDokumenAction } from "@/app/(dashboard)/admin/dokumen/actions";
import type { DokumenListItem } from "@/types";

export function DeleteDokumenDialog({
  dokumen,
  open,
  onOpenChange,
  onConfirmed,
}: {
  dokumen: DokumenListItem | null;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onConfirmed: () => void;
}) {
  async function handleConfirm() {
    if (!dokumen) return;
    const result = await deleteDokumenAction(dokumen.id);
    if (result.ok) {
      onConfirmed();
      onOpenChange(false);
    } else {
      throw new Error(result.error);
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Hapus dokumen \u201c${dokumen?.judul ?? ""}\u201d?`}
      description="Dokumen ini akan dihapus permanen beserta data indeks TF-IDF-nya. Indeks global akan dihitung ulang secara otomatis."
      icon={<Trash2 className="h-5 w-5 text-primary" />}
      confirmLabel="Hapus"
      loadingLabel="Menghapus..."
      onConfirm={handleConfirm}
    />
  );
}
