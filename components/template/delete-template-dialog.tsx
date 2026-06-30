"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteTemplateAction } from "@/app/(dashboard)/template/actions";
import type { TemplateItem } from "@/types";

export function DeleteTemplateDialog({
  template,
  open,
  onOpenChange,
  onSuccess,
}: {
  template: TemplateItem | null;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onSuccess: () => void;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Hapus Template"
      description={
        template
          ? `Apakah Anda yakin ingin menghapus template "${template.label}"? Tindakan ini tidak dapat dibatalkan.`
          : ""
      }
      icon={<Trash2 className="h-5 w-5 text-destructive" />}
      confirmLabel="Hapus"
      confirmVariant="danger"
      loadingLabel="Menghapus..."
      onConfirm={async () => {
        const result = await deleteTemplateAction(template?.id ?? "");
        if (!result.ok) throw new Error(result.error);
        onSuccess();
      }}
    />
  );
}
