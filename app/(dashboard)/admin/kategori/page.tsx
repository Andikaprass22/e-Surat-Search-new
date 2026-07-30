import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getKategoriList } from "@/lib/data/kategori";
import { KategoriSection } from "@/components/kategori/kategori-section";

function KategoriFallback() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Memuat daftar kategori...</span>
    </div>
  );
}

export default async function KelolaKategoriPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Kelola Kategori</h1>
        <p className="text-muted-foreground">Buat dan atur kategori untuk mengelompokkan dokumen.</p>
      </div>
      <Suspense fallback={<KategoriFallback />}>
        <KategoriLoader />
      </Suspense>
    </div>
  );
}

async function KategoriLoader() {
  const categories = await getKategoriList();
  return <KategoriSection initialData={categories} />;
}
