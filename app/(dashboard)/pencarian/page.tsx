import { Search } from "lucide-react";
import { SearchBar } from "@/components/pencarian/search-bar";

export default function PencarianPage() {
  return (
    <div className="flex flex-col items-center pt-12 md:pt-20 px-4">
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="rounded-full bg-primary/10 p-4 text-primary">
          <Search className="h-8 w-8 md:h-10 md:w-10" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          Pencarian Dokumen
        </h1>
        <p className="text-sm text-muted-foreground">
          Cari dokumen, surat, dan arsip dengan kata kunci
        </p>
      </div>
      <div className="w-full max-w-2xl">
        <SearchBar />
      </div>
    </div>
  );
}
