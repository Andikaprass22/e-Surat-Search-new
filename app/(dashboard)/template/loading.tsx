import { Skeleton } from "@/components/ui/skeleton";

export default function TemplateLoading() {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-8 w-72" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
