import { Suspense } from "react";
import { LayoutDashboard, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth-helpers";
import { getRiwayatList } from "@/lib/data/riwayat";
import { UserDashboard } from "@/components/layout/user-dashboard";

function DashboardFallback() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Memuat beranda...</span>
    </div>
  );
}

export default async function DashboardIndexPage() {
  const user = await requireSession();

  if (user.role === "admin") {
    const { AdminDashboard } = await import("@/components/layout/admin-dashboard");
    const { getDashboardStats } = await import("@/lib/data/dashboard");
    const stats = await getDashboardStats();

    return (
      <Card className="border-2">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <CardTitle>Beranda</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <AdminDashboard stats={stats} />
        </CardContent>
      </Card>
    );
  }

  const riwayat = await getRiwayatList(user.id);

  return (
    <Card className="border-2">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <CardTitle>Beranda</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Suspense fallback={<DashboardFallback />}>
          <UserDashboard user={user} riwayat={riwayat} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
