"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Ban, CheckCircle, Trash2 } from "lucide-react";
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
    icon: React.ComponentType<{ className?: string }>;
    title: (name: string) => string;
    description: (name: string) => string;
    actionLabel: string;
    destructive: boolean;
  }
> = {
  ban: {
    icon: Ban,
    title: (n) => `Blokir ${n}?`,
    description: (n) =>
      `${n} tidak akan bisa masuk lagi. Sesi aktif akan dihentikan dan seluruh akses ke aplikasi ditolak sampai blokir dibuka.`,
    actionLabel: "Blokir",
    destructive: true,
  },
  unban: {
    icon: CheckCircle,
    title: (n) => `Buka blokir ${n}?`,
    description: (n) =>
      `${n} akan dapat masuk kembali seperti biasa. Tindakan ini tidak mengembalikan sesi yang sudah dihentikan.`,
    actionLabel: "Buka blokir",
    destructive: false,
  },
  delete: {
    icon: Trash2,
    title: (n) => `Hapus ${n}?`,
    description: (n) =>
      `Akun ${n} akan dihapus permanen beserta histori pencarian dan data terkait. Tindakan ini tidak dapat dibatalkan.`,
    actionLabel: "Hapus",
    destructive: true,
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
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setPending(false);
      setError(null);
    }
  }, [open]);

  if (!mode || !user) return null;

  const c = CONTENT[mode];

  async function handleConfirm() {
    if (!user) return;
    setPending(true);
    setError(null);
    let result;
    if (mode === "ban") result = await banUserAction(user.id);
    else if (mode === "unban") result = await unbanUserAction(user.id);
    else result = await deleteUserAction(user.id);

    if (result.ok) {
      onConfirmed();
      onOpenChange(false);
    } else {
      setError(result.error);
      setPending(false);
    }
  }

  const Icon = c.icon;

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
              <Icon className="h-5 w-5 text-primary" />
            </AlertDialogMedia>
            <AlertDialogTitle>{c.title(user.name)}</AlertDialogTitle>
            <AlertDialogDescription>
              {c.description(user.name)}
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
              className={
                c.destructive
                  ? "bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
                  : undefined
              }
            >
              {pending ? "Memproses..." : c.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
