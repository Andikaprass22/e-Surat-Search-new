"use client";

import * as React from "react";
import { useActionState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  createKategoriAction,
  updateKategoriAction,
  type ActionResult,
} from "@/app/(dashboard)/admin/kategori/actions";
import type { KategoriListItem } from "@/types";

type Mode =
  | { kind: "create" }
  | { kind: "edit"; kategori: KategoriListItem };

export function KategoriFormDialog({
  mode,
  open,
  onOpenChange,
  onSuccess,
}: {
  mode: Mode | null;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onSuccess: () => void;
}) {
  const isEdit = mode?.kind === "edit";
  const title = isEdit ? "Edit Kategori" : "Tambah Kategori";
  const description = isEdit
    ? "Perbarui informasi kategori dokumen."
    : "Buat kategori baru untuk mengelompokkan dokumen.";

  const action =
    isEdit && mode?.kind === "edit"
      ? updateKategoriAction.bind(null, mode.kategori.id)
      : createKategoriAction;

  const [state, formAction, pending] = useActionState<
    ActionResult | undefined,
    FormData
  >(action, undefined);

  React.useEffect(() => {
    if (state?.ok) {
      onSuccess();
      onOpenChange(false);
    }
  }, [state, onSuccess, onOpenChange]);

  const editKategori = mode?.kind === "edit" ? mode.kategori : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <form action={formAction} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kategori</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={editKategori?.name ?? ""}
                placeholder="Contoh: Surat Keputusan"
                disabled={pending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editKategori?.description ?? ""}
                placeholder="Deskripsi opsional untuk kategori ini"
                rows={3}
                disabled={pending}
              />
            </div>

            {state?.ok === false && state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={pending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                {pending
                  ? "Menyimpan..."
                  : isEdit
                    ? "Simpan perubahan"
                    : "Tambah kategori"}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
