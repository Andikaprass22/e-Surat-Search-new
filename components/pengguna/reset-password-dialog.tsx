"use client";

import * as React from "react";
import { useTransition } from "react";
import { motion } from "framer-motion";
import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";
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
import { adminSetUserPasswordAction } from "@/app/(dashboard)/admin/pengguna/set-password-action";

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  user: { id: string; name: string } | null;
  onSuccess?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<boolean>(false);
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setError(null);
      setSuccess(false);
      setPassword("");
      setConfirm("");
    }
  }, [open]);

  if (!user) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    startTransition(async () => {
      const result = await adminSetUserPasswordAction(user!.id, password);
      if (result.ok) {
        setSuccess(true);
        onSuccess?.();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <DialogHeader>
            <DialogTitle>Reset Password {user.name}</DialogTitle>
            <DialogDescription>
              Masukkan password baru. Pengguna harus menggunakan password ini
              saat login berikutnya — sesi aktif akan dihentikan.
            </DialogDescription>
          </DialogHeader>

          {success ? (
            <div className="flex flex-col items-center gap-3 text-center py-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              <p className="text-sm">
                Password baru untuk <strong>{user.name}</strong> telah
                diterapkan.
              </p>
              <Button onClick={() => onOpenChange(false)}>Selesai</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">Password Baru</Label>
                <PasswordInput
                  id="new-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  disabled={pending}
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">
                  Konfirmasi Password Baru
                </Label>
                <PasswordInput
                  id="confirm-password"
                  minLength={8}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Ketik ulang password"
                  disabled={pending}
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
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
                <Button
                  type="submit"
                  disabled={pending}
                  className="flex items-center gap-2"
                >
                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      Atur Ulang Password
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
