import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { requireSession } from "@/lib/auth-helpers";
import { getTemplateList } from "@/lib/data/template";
import { TemplateSection } from "@/components/template/template-section";

function TemplateFallback() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Memuat template...</span>
    </div>
  );
}

export default async function TemplatePage() {
  const user = await requireSession();
  const templates = await getTemplateList(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Template Pencarian</h1>
        <p className="text-muted-foreground">Kelola dan gunakan template untuk mempercepat pencarian Anda.</p>
      </div>
      <Suspense fallback={<TemplateFallback />}>
        <TemplateSection initialData={templates} />
      </Suspense>
    </div>
  );
}
