import { Suspense } from "react";
import { History, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth-helpers";
import { getRiwayatList } from "@/lib/data/riwayat";
import { RiwayatSection } from "@/components/riwayat/riwayat-section";

function RiwayatFallback() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Memuat riwayat pencarian...</span>
    </div>
  );
}

export default async function RiwayatPage() {
  const user = await requireSession();
  const riwayat = await getRiwayatList(user.id);

  return (
    <Card className="border-2">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <CardTitle>Riwayat Pencarian</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Suspense fallback={<RiwayatFallback />}>
          <RiwayatSection data={riwayat} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
