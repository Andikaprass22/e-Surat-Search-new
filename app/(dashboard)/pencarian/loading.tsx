import { Skeleton } from "@/components/ui/skeleton";

export default function PencarianLoading() {
  return (
    <div className="flex flex-col items-center pt-12 md:pt-20">
      <div className="flex flex-col items-center gap-2 mb-8">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="w-full space-y-6">
        <Skeleton className="h-14 w-full rounded-full" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <Skeleton className="mt-0.5 h-8 w-8 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-56" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
