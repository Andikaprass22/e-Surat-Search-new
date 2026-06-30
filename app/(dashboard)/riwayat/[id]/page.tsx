import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, History, Clock, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { requireSession } from "@/lib/auth-helpers";
import { getRiwayatDetail } from "@/lib/data/riwayat";
import { SearchResultCard } from "@/components/pencarian/search-result-card";

export default async function RiwayatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireSession();
  const detail = await getRiwayatDetail(id, user.id);

  if (!detail) notFound();

  const tanggal = new Date(detail.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="border-2">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle>Detail Riwayat</CardTitle>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/riwayat">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Kata kunci:</span>
            <span className="font-semibold">&ldquo;{detail.query}&rdquo;</span>
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Waktu:</span>
            <span className="font-medium">{tanggal}</span>
          </span>
          <Badge variant="secondary">{detail.resultCount} hasil</Badge>
        </div>

        <Separator />

        {detail.results.length > 0 ? (
          <div className="space-y-3">
            {detail.results.map((result) => (
              <SearchResultCard key={result.dokumenId} result={result} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Pencarian ini tidak menghasilkan dokumen.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
