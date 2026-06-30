import { Suspense } from "react";
import { BarChart3, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth-helpers";
import { getLaporanRingkasan } from "@/lib/data/laporan";
import { LaporanStatsCard } from "@/components/laporan/laporan-stats-card";
import { KeywordTrendList } from "@/components/laporan/keyword-trend-list";
import { TrendHarianList } from "@/components/laporan/trend-harian-list";

function LaporanFallback() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Memuat laporan...</span>
    </div>
  );
}

export default async function LaporanPage() {
  const user = await requireSession();
  const laporan = await getLaporanRingkasan(user.id);

  return (
    <Card className="border-2">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle>Laporan dan Statistik</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Suspense fallback={<LaporanFallback />}>
          <div className="space-y-8">
            <LaporanStatsCard
              value={laporan.totalPencarian}
              label="Total Pencarian"
              iconName="Search"
              color="text-blue-600 bg-blue-500/10"
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
                  Kata Kunci Tersering
                </h2>
                <KeywordTrendList keywords={laporan.topKeywords} />
              </div>

              <div>
                <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
                  Tren 7 Hari Terakhir
                </h2>
                <TrendHarianList trend={laporan.trendHarian} />
              </div>
            </div>

            {laporan.totalPencarian === 0 && (
              <div className="flex flex-col items-center gap-3 text-center py-6">
                <BarChart3 className="h-10 w-10 text-muted-foreground" />
                <h2 className="text-base font-semibold">Belum Ada Data</h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Laporan akan tersedia setelah Anda melakukan pencarian dokumen.
                </p>
              </div>
            )}
          </div>
        </Suspense>
      </CardContent>
    </Card>
  );
}
