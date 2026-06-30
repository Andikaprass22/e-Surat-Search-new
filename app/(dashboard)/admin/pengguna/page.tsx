import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Loader2 } from "lucide-react";
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
    <Card className="border-2">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>Kelola Pengguna</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Suspense fallback={<PenggunaFallback />}>
          <PenggunaLoader />
        </Suspense>
      </CardContent>
    </Card>
  );
}

async function PenggunaLoader() {
  const users = await getUserList();
  return <PenggunaSection initialData={users} />;
}
