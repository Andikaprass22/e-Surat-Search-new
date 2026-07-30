"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PenggunaTable,
  type PenggunaRowAction,
} from "@/components/pengguna/pengguna-table";
import { PenggunaFormDialog } from "@/components/pengguna/pengguna-form-dialog";
import { BanConfirmDialog } from "@/components/pengguna/ban-confirm-dialog";
import { ResetPasswordDialog } from "@/components/pengguna/reset-password-dialog";
import { RemovePasswordDialog } from "@/components/pengguna/remove-password-dialog";
import type { UserListItem } from "@/types";

type FormMode =
  | { kind: "create" }
  | { kind: "edit"; user: UserListItem }
  | null;

type ConfirmMode = "ban" | "unban" | "delete" | null;

type PasswordMode = "reset-password" | "remove-password" | null;

export function PenggunaSection({
  initialData,
}: {
  initialData: UserListItem[];
}) {
  const [formMode, setFormMode] = React.useState<FormMode>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [confirmMode, setConfirmMode] = React.useState<ConfirmMode>(null);
  const [confirmUser, setConfirmUser] = React.useState<UserListItem | null>(
    null
  );
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [passwordMode, setPasswordMode] = React.useState<PasswordMode>(null);
  const [passwordUser, setPasswordUser] = React.useState<UserListItem | null>(
    null
  );
  const [passwordOpen, setPasswordOpen] = React.useState(false);

  const handleAction = React.useCallback((a: PenggunaRowAction) => {
    if (a.type === "edit") {
      setFormMode({ kind: "edit", user: a.user });
      setFormOpen(true);
      return;
    }
    if (a.type === "reset-password" || a.type === "remove-password") {
      setPasswordUser(a.user);
      setPasswordMode(a.type);
      setPasswordOpen(true);
      return;
    }
    setConfirmUser(a.user);
    setConfirmMode(a.type);
    setConfirmOpen(true);
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
            Tambah Pengguna
          </Button>
        </motion.div>
      </div>

      <PenggunaTable data={initialData} onAction={handleAction} />

      <PenggunaFormDialog
        mode={formMode}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => {
          if (typeof window !== "undefined") window.location.reload();
        }}
      />

      <BanConfirmDialog
        mode={confirmMode}
        user={confirmUser}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirmed={() => {
          if (typeof window !== "undefined") window.location.reload();
        }}
      />

      <ResetPasswordDialog
        open={passwordOpen && passwordMode === "reset-password"}
        onOpenChange={(next) => {
          setPasswordOpen(next);
          if (!next) setPasswordMode(null);
        }}
        user={passwordMode === "reset-password" ? passwordUser : null}
      />

      <RemovePasswordDialog
        open={passwordOpen && passwordMode === "remove-password"}
        onOpenChange={(next) => {
          setPasswordOpen(next);
          if (!next) setPasswordMode(null);
        }}
        user={passwordMode === "remove-password" ? passwordUser : null}
      />
    </div>
  );
}
