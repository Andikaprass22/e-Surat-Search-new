import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getDokumenList } from "@/lib/data/dokumen";
import { getKategoriList } from "@/lib/data/kategori";
import { DokumenSection } from "@/components/dokumen/dokumen-section";

function DokumenFallback() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Memuat daftar dokumen...</span>
    </div>
  );
}

export default async function SemuaDokumenPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Semua Dokumen</h1>
        <p className="text-muted-foreground">Kelola dan sinkronisasi indeks pencarian dokumen.</p>
      </div>
      <Suspense fallback={<DokumenFallback />}>
        <DokumenLoader />
      </Suspense>
    </div>
  );
}

async function DokumenLoader() {
  const [dokumen, kategori] = await Promise.all([
    getDokumenList(),
    getKategoriList(),
  ]);
  return (
    <DokumenSection initialData={dokumen} kategoriOptions={kategori} />
  );
}
