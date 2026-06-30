"use client";

import * as React from "react";
import { Ban, CheckCircle, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  banUserAction,
  unbanUserAction,
  deleteUserAction,
} from "@/app/(dashboard)/admin/pengguna/actions";
import type { UserListItem } from "@/types";

type Mode = "ban" | "unban" | "delete";

const CONTENT: Record<
  Mode,
  {
    icon: React.ReactNode;
    title: (name: string) => string;
    description: (name: string) => string;
    confirmLabel: string;
    confirmVariant: "danger" | "default";
  }
> = {
  ban: {
    icon: <Ban className="h-5 w-5 text-primary" />,
    title: (n) => `Blokir ${n}?`,
    description: (n) =>
      `${n} tidak akan bisa masuk lagi. Sesi aktif akan dihentikan dan seluruh akses ke aplikasi ditolak sampai blokir dibuka.`,
    confirmLabel: "Blokir",
    confirmVariant: "danger",
  },
  unban: {
    icon: <CheckCircle className="h-5 w-5 text-primary" />,
    title: (n) => `Buka blokir ${n}?`,
    description: (n) =>
      `${n} akan dapat masuk kembali seperti biasa. Tindakan ini tidak mengembalikan sesi yang sudah dihentikan.`,
    confirmLabel: "Buka blokir",
    confirmVariant: "default",
  },
  delete: {
    icon: <Trash2 className="h-5 w-5 text-primary" />,
    title: (n) => `Hapus ${n}?`,
    description: (n) =>
      `Akun ${n} akan dihapus permanen beserta histori pencarian dan data terkait. Tindakan ini tidak dapat dibatalkan.`,
    confirmLabel: "Hapus",
    confirmVariant: "danger",
  },
};

export function BanConfirmDialog({
  mode,
  user,
  open,
  onOpenChange,
  onConfirmed,
}: {
  mode: Mode | null;
  user: UserListItem | null;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onConfirmed: () => void;
}) {
  if (!mode || !user) return null;

  const c = CONTENT[mode];
  const currentUser = user;

  async function handleConfirm() {
    let result;
    if (mode === "ban") result = await banUserAction(currentUser.id);
    else if (mode === "unban") result = await unbanUserAction(currentUser.id);
    else result = await deleteUserAction(currentUser.id);

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
      title={c.title(user.name)}
      description={c.description(user.name)}
      icon={c.icon}
      confirmLabel={c.confirmLabel}
      confirmVariant={c.confirmVariant}
      loadingLabel="Memproses..."
      onConfirm={handleConfirm}
    />
  );
}
