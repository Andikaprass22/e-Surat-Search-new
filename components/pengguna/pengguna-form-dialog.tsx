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
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createUserAction,
  updateUserAction,
  type ActionResult,
} from "@/app/(dashboard)/admin/pengguna/actions";
import { ROLES } from "@/lib/constants";
import type { UserListItem } from "@/types";

type Mode = { kind: "create" } | { kind: "edit"; user: UserListItem };

export function PenggunaFormDialog({
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
  const title = isEdit ? "Edit Pengguna" : "Tambah Pengguna";
  const description = isEdit
    ? "Perbarui data pengguna. Sesi terkait akan terpengaruh jika role atau status berubah."
    : "Buat akun baru. Pastikan username dan email belum pernah terdaftar.";

  const action = isEdit && mode?.kind === "edit"
    ? updateUserAction.bind(null, mode.user.id)
    : createUserAction;

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

  const editUser = mode?.kind === "edit" ? mode.user : null;

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
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={editUser?.name ?? ""}
                placeholder="Nama lengkap"
                disabled={pending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                required
                defaultValue={editUser?.username ?? ""}
                placeholder="username_baru"
                disabled={pending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={editUser?.email ?? ""}
                placeholder="nama@example.com"
                disabled={pending}
              />
            </div>

            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi</Label>
                <PasswordInput
                  id="password"
                  name="password"
                  required
                  minLength={8}
                  placeholder="Minimal 8 karakter"
                  disabled={pending}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                name="role"
                defaultValue={editUser?.role ?? ROLES.USER}
                disabled={pending}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROLES.USER}>User</SelectItem>
                  <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
                </SelectContent>
              </Select>
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
                    : "Tambah pengguna"}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
