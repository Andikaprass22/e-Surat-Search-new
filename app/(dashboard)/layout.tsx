import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider } from "@/components/ui/sidebar";
import { requireSession } from "@/lib/auth-helpers";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}

async function DashboardShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireSession();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar user={user} />
        <div className="flex flex-1 flex-col">
          <Header user={user} />
          <main className="flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden w-64 border-r bg-card p-4 md:block">
        <Skeleton className="h-6 w-32" />
        <div className="mt-8 space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b px-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex-1 px-6 py-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-4 h-64 w-full" />
        </div>
      </div>
    </div>
  );
}
