import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getUserList } from "@/lib/data/pengguna";
import { PenggunaSection } from "@/components/pengguna/pengguna-section";

function PenggunaFallback() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Memuat daftar pengguna...</span>
    </div>
  );
}

export default async function PenggunaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Kelola Pengguna</h1>
        <p className="text-muted-foreground">Kelola hak akses, status, dan data akun pengguna.</p>
      </div>
      <Suspense fallback={<PenggunaFallback />}>
        <PenggunaLoader />
      </Suspense>
    </div>
  );
}

async function PenggunaLoader() {
  const users = await getUserList();
  return <PenggunaSection initialData={users} />;
}
