import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText, FolderTree, Hash, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getDokumenById } from "@/lib/data/dokumen";

export default async function DokumenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dokumen = await getDokumenById(id);

  if (!dokumen) notFound();

  const tanggal = new Date(dokumen.tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const dibuat = new Date(dokumen.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const diubah = new Date(dokumen.updatedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="border-2">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <CardTitle>Detail Dokumen</CardTitle>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/dokumen">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{dokumen.judul}</h1>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Nomor Surat:</span>
            <span className="font-mono font-medium">{dokumen.nomorSurat}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Tanggal:</span>
            <span className="font-medium">{tanggal}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FolderTree className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Kategori:</span>
            <Badge variant="secondary">{dokumen.kategoriName ?? "—"}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Dibuat:</span>
            <span className="font-medium">{dibuat}</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Terakhir diperbarui: {diubah}
        </div>

        <Separator />

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Konten Dokumen
          </h2>
          <div className="rounded-lg bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
            {dokumen.konten}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
