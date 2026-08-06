import { Suspense } from "react";
import { Loader2 } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Beranda Admin</h1>
        <p className="text-muted-foreground">
          Ringkasan arsip surat, panel kerja, dan akses fitur sistem.
        </p>
      </div>
      <Suspense fallback={<DashboardFallback />}>
        <DashboardLoader />
      </Suspense>
    </div>
  );
}

async function DashboardLoader() {
  const stats = await getDashboardStats();
  return <AdminDashboard stats={stats} />;
}
