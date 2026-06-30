"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginAction } from "@/app/(public)/login/actions";

type LoginState = {
  error?: string;
};

const initialState: LoginState = {};

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: LoginState, formData: FormData) => {
      const result = await loginAction(formData);
      if (result.success) {
        router.push("/dashboard");
        router.refresh();
        return {};
      }
      return { error: result.error };
    },
    initialState,
  );

  return (
    <motion.div
      className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="w-full max-w-md border-2 shadow-sm">
        <CardHeader className="pb-4 bg-muted/30 border-b">
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Masuk ke Akun Anda</CardTitle>
          </div>
          <CardDescription>
            Sistem pencarian dan pengelolaan dokumen internal e-Surat Search.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nama Pengguna</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="admin"
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="********"
                autoComplete="current-password"
                required
              />
            </div>

            {state.error ? (
              <div
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {state.error}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Belum memiliki akun? Hubungi administrator untuk pendaftaran.
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
