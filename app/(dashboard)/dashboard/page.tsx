import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { requireSession } from "@/lib/auth-helpers";
import { getRiwayatList } from "@/lib/data/riwayat";
import { UserDashboard } from "@/components/layout/user-dashboard";

function DashboardFallback() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-12">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Memuat beranda...</span>
    </div>
  );
}

export default async function DashboardIndexPage() {
  const user = await requireSession();

  if (user.role === "admin") {
    const { AdminDashboard } = await import(
      "@/components/layout/admin-dashboard"
    );
    const { getDashboardStats } = await import("@/lib/data/dashboard");
    const stats = await getDashboardStats();

    return (
      <div className="max-w-6xl mx-auto w-full">
        <div className="mb-10">
          <p className="text-sm font-medium text-primary mb-1">Beranda Admin</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Sistem Informasi Kearsipan Surat
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Pantau arsip surat, kelola data, dan tinjau aktivitas sistem.
          </p>
        </div>
        <AdminDashboard stats={stats} />
      </div>
    );
  }

  const riwayat = await getRiwayatList(user.id);

  return (
    <div className="max-w-6xl mx-auto w-full">
      <Suspense fallback={<DashboardFallback />}>
        <UserDashboard user={user} riwayat={riwayat} />
      </Suspense>
    </div>
  );
}
