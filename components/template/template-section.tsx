"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TemplateTable,
} from "@/components/template/template-table";
import { TemplateFormDialog } from "@/components/template/template-form-dialog";
import { DeleteTemplateDialog } from "@/components/template/delete-template-dialog";
import type { TemplateItem } from "@/types";

export function TemplateSection({
  initialData,
}: {
  initialData: TemplateItem[];
}) {
  const router = useRouter();
  const [formMode, setFormMode] = React.useState<
    { kind: "create" } | { kind: "edit"; template: TemplateItem } | null
  >(null);
  const [deleteTemplate, setDeleteTemplate] =
    React.useState<TemplateItem | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Simpan pola pencarian untuk digunakan kembali.
        </p>
        <Button size="sm" onClick={() => setFormMode({ kind: "create" })}>
          <Plus className="h-4 w-4" />
          Tambah Template
        </Button>
      </div>

      <TemplateTable
        data={initialData}
        onAction={(action) => {
          if (action.type === "edit") {
            setFormMode({ kind: "edit", template: action.template });
          } else if (action.type === "delete") {
            setDeleteTemplate(action.template);
          } else {
            router.push(`/pencarian?q=${encodeURIComponent(action.template.query)}`);
          }
        }}
      />

      <TemplateFormDialog
        mode={formMode}
        open={formMode !== null}
        onOpenChange={(open) => {
          if (!open) setFormMode(null);
        }}
        onSuccess={() => {
          router.refresh();
        }}
      />

      <DeleteTemplateDialog
        template={deleteTemplate}
        open={deleteTemplate !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTemplate(null);
        }}
        onSuccess={() => {
          setDeleteTemplate(null);
          router.refresh();
        }}
      />
    </div>
  );
}
