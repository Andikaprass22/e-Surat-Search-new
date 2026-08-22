"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
      <div className="hidden md:flex flex-1 bg-[#173F5F] p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <Image
              src="/logo.png"
              alt="Logo e-Surat"
              width={36}
              height={36}
              className="object-contain shrink-0"
              style={{ background: "transparent" }}
              priority
            />
            <span className="font-semibold text-lg tracking-wide">e-SURAT</span>
          </div>
          <p className="text-[11px] font-medium tracking-widest text-white/60 uppercase mb-4">Sistem Informasi Kearsipan</p>
          <h1 className="text-4xl font-semibold tracking-tight leading-tight max-w-md">
            Pengelolaan arsip surat yang tertib dan mudah ditelusuri.
          </h1>
          <p className="text-sm text-white/70 mt-4 max-w-md leading-relaxed">
            Pencarian presisi dengan TF-IDF, klasifikasi surat masuk & keluar, dan jejak audit terpusat.
          </p>
        </div>
        <div className="relative z-10 text-xs text-white/50">
          &copy; {new Date().getFullYear()} Sistem Kearsipan · Akses terbatas
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 md:p-12 bg-[#F6F8FB]">
        <motion.div
          className="w-full max-w-sm space-y-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#172B3A]">Masuk ke Sistem</h2>
            <p className="text-sm text-[#64748B] mt-1.5">
              Gunakan nama pengguna dan kata sandi yang terdaftar.
            </p>
          </div>

          <form action={formAction} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Nama Pengguna</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="admin"
                  autoComplete="username"
                  required
                  className="rounded-[8px] border-border bg-white h-10 focus-visible:ring-primary/20"
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
                  className="rounded-[8px] border-border bg-white h-10 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            {state.error ? (
              <div role="alert" className="rounded-[8px] border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                {state.error}
              </div>
            ) : null}

            <Button type="submit" className="w-full h-11 rounded-[8px] text-sm font-medium" disabled={pending}>
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
