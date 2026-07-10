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
    const { AdminDashboard } = await import("@/components/layout/admin-dashboard");
    const { getDashboardStats } = await import("@/lib/data/dashboard");
    const stats = await getDashboardStats();

    return (
      <div className="max-w-5xl mx-auto w-full">
        <header className="mb-10">
          <p className="text-sm font-medium text-muted-foreground mb-2">Ringkasan Sistem</p>
          <h1 className="text-3xl font-semibold tracking-tight">Beranda Admin</h1>
        </header>
        <AdminDashboard stats={stats} />
      </div>
    );
  }

  const riwayat = await getRiwayatList(user.id);

  return (
    <div className="max-w-5xl mx-auto w-full">
      <header className="mb-10">
        <p className="text-sm font-medium text-muted-foreground mb-2">Sistem Manajemen BMN</p>
        <h1 className="text-3xl font-semibold tracking-tight">Selamat datang, {user.name.split(" ")[0]}.</h1>
      </header>
      <Suspense fallback={<DashboardFallback />}>
        <UserDashboard user={user} riwayat={riwayat} />
      </Suspense>
    </div>
  );
}
