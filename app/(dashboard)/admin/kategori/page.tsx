import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderTree, Loader2 } from "lucide-react";
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
    <Card className="border-2">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <FolderTree className="h-5 w-5 text-primary" />
          <CardTitle>Kelola Kategori</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Suspense fallback={<KategoriFallback />}>
          <KategoriLoader />
        </Suspense>
      </CardContent>
    </Card>
  );
}

async function KategoriLoader() {
  const categories = await getKategoriList();
  return <KategoriSection initialData={categories} />;
}
