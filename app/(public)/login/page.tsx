"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Brand/Hero Side */}
      <div className="hidden md:flex flex-1 bg-zinc-950 p-12 flex-col justify-between text-zinc-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-8 w-8 bg-zinc-50 rounded-sm flex items-center justify-center">
              <div className="w-4 h-4 bg-zinc-950 rounded-[2px]" />
            </div>
            <span className="font-semibold text-lg tracking-wide">E-SURAT</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight leading-tight max-w-md">
            Sistem manajemen dan pencarian arsip presisi.
          </h1>
        </div>
        <div className="relative z-10 text-sm text-zinc-400 font-light">
          &copy; {new Date().getFullYear()} Kementerian / Lembaga. All rights reserved.
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 bg-background">
        <motion.div
          className="w-full max-w-sm space-y-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-2">Selamat Datang</h2>
            <p className="text-muted-foreground text-sm font-light">
              Silakan masuk ke akun Anda untuk melanjutkan.
            </p>
          </div>

          <form action={formAction} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Nama Pengguna</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="admin"
                  autoComplete="username"
                  required
                  className="rounded-[10px] border-border/60 px-3 py-2 h-auto focus-visible:ring-0 shadow-none bg-transparent text-base transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Kata Sandi</Label>
                <PasswordInput
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="rounded-[10px] border-border/60 py-2 h-auto focus-visible:ring-0 shadow-none bg-transparent text-base transition-colors"
                />
              </div>
            </div>

            {state.error ? (
              <div
                role="alert"
                className="text-sm text-destructive font-medium"
              >
                {state.error}
              </div>
            ) : null}

            <Button type="submit" className="w-full h-12 rounded-sm text-xs font-semibold uppercase tracking-widest" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
