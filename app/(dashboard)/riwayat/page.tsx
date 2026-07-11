import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { requireSession } from "@/lib/auth-helpers";
import { getRiwayatList } from "@/lib/data/riwayat";
import { RiwayatSection } from "@/components/riwayat/riwayat-section";

function RiwayatFallback() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-12">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Memuat riwayat pencarian...</span>
    </div>
  );
}

export default async function RiwayatPage() {
  const user = await requireSession();
  const riwayat = await getRiwayatList(user.id);

  return (
    <div className="max-w-5xl mx-auto w-full">
      <header className="mb-10">
        <h1 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-2">Aktivitas Anda</h1>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">Riwayat Pencarian</h2>
      </header>
      <Suspense fallback={<RiwayatFallback />}>
        <RiwayatSection data={riwayat} isAdmin={user.role === "admin"} />
      </Suspense>
    </div>
  );
}
