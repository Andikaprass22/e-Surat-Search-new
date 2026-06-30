"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setPending(false);
      setError(null);
    }
  }, [open]);

  async function handleConfirm() {
    if (!kategori) return;
    setPending(true);
    setError(null);

    const result = await deleteKategoriAction(kategori.id);

    if (result.ok) {
      onConfirmed();
      onOpenChange(false);
    } else {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent size="sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2 className="h-5 w-5 text-primary" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              Hapus kategori &ldquo;{kategori?.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Kategori ini akan dihapus permanen. Kategori yang masih memiliki
              dokumen tidak dapat dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error && (
            <p className="text-sm text-destructive px-4" role="alert">
              {error}
            </p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleConfirm();
              }}
              disabled={pending}
              className="bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
            >
              {pending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
