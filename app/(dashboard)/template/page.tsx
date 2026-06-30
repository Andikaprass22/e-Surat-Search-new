import { Suspense } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="border-2">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Template Pencarian</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Suspense fallback={<TemplateFallback />}>
          <TemplateSection initialData={templates} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
