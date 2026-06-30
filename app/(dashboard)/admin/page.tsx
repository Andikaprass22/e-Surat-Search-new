import { Suspense } from "react";
import { LayoutDashboard, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/data/dashboard";
import { AdminDashboard } from "@/components/layout/admin-dashboard";

function DashboardFallback() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Memuat dashboard...</span>
    </div>
  );
}

export default async function AdminDashboardPage() {
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
          <DashboardLoader />
        </Suspense>
      </CardContent>
    </Card>
  );
}

async function DashboardLoader() {
  const stats = await getDashboardStats();
  return <AdminDashboard stats={stats} />;
}
