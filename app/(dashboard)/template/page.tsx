import { Sparkles, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TemplatePage() {
  return (
    <Card className="border-2">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Template Pencarian</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-3 text-center py-10">
          <Clock className="h-10 w-10 text-muted-foreground" />
          <h2 className="text-base font-semibold">Segera Hadir</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Koleksi template pencarian akan tersedia setelah fase Template
            selesai diimplementasikan.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
