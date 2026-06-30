"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteKategoriAction } from "@/app/(dashboard)/admin/kategori/actions";
import type { KategoriListItem } from "@/types";

export function DeleteKategoriDialog({
  kategori,
  open,
  onOpenChange,
  onConfirmed,
}: {
  kategori: KategoriListItem | null;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onConfirmed: () => void;
}) {
  async function handleConfirm() {
    if (!kategori) return;
    const result = await deleteKategoriAction(kategori.id);
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
      title={`Hapus kategori \u201c${kategori?.name ?? ""}\u201d?`}
      description="Kategori ini akan dihapus permanen. Kategori yang masih memiliki dokumen tidak dapat dihapus."
      icon={<Trash2 className="h-5 w-5 text-primary" />}
      confirmLabel="Hapus"
      loadingLabel="Menghapus..."
      onConfirm={handleConfirm}
    />
  );
}
