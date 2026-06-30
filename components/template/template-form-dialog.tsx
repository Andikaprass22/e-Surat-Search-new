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
import {
  createTemplateAction,
  updateTemplateAction,
  type ActionResult,
} from "@/app/(dashboard)/template/actions";
import type { TemplateItem } from "@/types";

type Mode =
  | { kind: "create" }
  | { kind: "edit"; template: TemplateItem };

export function TemplateFormDialog({
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
  const title = isEdit ? "Ubah Template" : "Tambah Template";
  const description = isEdit
    ? "Perbarui label atau kata kunci template."
    : "Simpan pola pencarian sebagai template untuk digunakan kembali.";

  const action =
    isEdit && mode?.kind === "edit"
      ? updateTemplateAction.bind(null, mode.template.id)
      : createTemplateAction;

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

  const editTemplate = mode?.kind === "edit" ? mode.template : null;

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
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                name="label"
                required
                defaultValue={editTemplate?.label ?? ""}
                placeholder="Contoh: Cari SK Tahun Ini"
                disabled={pending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="query">Kata Kunci</Label>
              <Input
                id="query"
                name="query"
                required
                defaultValue={editTemplate?.query ?? ""}
                placeholder="Contoh: surat keputusan 2024"
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
                    : "Tambah template"}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
