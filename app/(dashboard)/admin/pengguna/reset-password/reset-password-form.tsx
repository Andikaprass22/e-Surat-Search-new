"use client";

import * as React from "react";
import { useTransition } from "react";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adminSetUserPasswordAction } from "@/app/(dashboard)/admin/pengguna/set-password-action";

export function ResetPasswordForm({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  if (!userId) {
    return (
      <p className="text-sm text-muted-foreground">
        Parameter <code className="font-mono">userId</code> tidak ditemukan di
        URL. Buka halaman ini melalui link &ldquo;Reset Password&rdquo; dari
        halaman detail pengguna.
      </p>
    );
  }

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
      const result = await adminSetUserPasswordAction(userId, password);
      if (result.ok) {
        setSuccess(true);
      } else {
        setError(result.error);
      }
    });
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 text-center py-6">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        <p className="text-sm">
          Password baru untuk <strong>{name}</strong> telah diterapkan. Sesi
          aktif pengguna akan dihentikan.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <p className="text-sm text-muted-foreground">
        Atur ulang password untuk <strong>{name}</strong>. Setelah disimpan,
        sesi aktif akan dihentikan dan pengguna harus login ulang dengan
        password baru.
      </p>

      <div className="space-y-2">
        <Label htmlFor="new-password">Password Baru</Label>
        <Input
          id="new-password"
          type="password"
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
        <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
        <Input
          id="confirm-password"
          type="password"
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

      <div className="flex items-center gap-2 pt-2">
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
      </div>
    </form>
  );
}
