"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";
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
import { adminRemoveUserPasswordAction } from "@/app/(dashboard)/admin/pengguna/set-password-action";

export function RemovePasswordDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  user: { id: string; name: string } | null;
}) {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setPending(false);
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  if (!user) return null;

  async function handleConfirm() {
    if (!user) return;
    setPending(true);
    setError(null);
    const result = await adminRemoveUserPasswordAction(user.id);
    if (result.ok) {
      setSuccess(true);
      setPending(false);
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
        if (!next) setSuccess(false);
        onOpenChange(next);
      }}
    >
      <AlertDialogContent size="sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {success ? (
            <>
              <AlertDialogHeader>
                <AlertDialogMedia>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </AlertDialogMedia>
                <AlertDialogTitle>Sandi Berhasil Dihapus</AlertDialogTitle>
                <AlertDialogDescription>
                  Sandi untuk <strong>{user.name}</strong> telah dihapus. Pengguna
                  tidak dapat masuk menggunakan sandi hingga admin membuat sandi baru.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => onOpenChange(false)}>
                  Selesai
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogMedia>
                  <KeyRound className="h-5 w-5 text-destructive" />
                </AlertDialogMedia>
                <AlertDialogTitle>Hapus Sandi {user.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Sandi pengguna akan dihapus permanen. Pengguna tidak akan bisa masuk
                  menggunakan sandi hingga admin membuat sandi baru. Sesi aktif juga akan
                  dihentikan.
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
                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Menghapus...
                    </>
                  ) : (
                    "Hapus Sandi"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
