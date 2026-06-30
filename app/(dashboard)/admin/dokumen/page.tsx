import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader2 } from "lucide-react";
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
    <Card className="border-2">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>Semua Dokumen</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Suspense fallback={<DokumenFallback />}>
          <DokumenLoader />
        </Suspense>
      </CardContent>
    </Card>
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
