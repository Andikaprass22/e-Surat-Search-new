import { SearchBar } from "@/components/pencarian/search-bar";

export default async function PencarianPage(props: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const initialQuery = searchParams?.q ?? "";

  return (
    <div className="max-w-4xl mx-auto w-full pt-10 md:pt-16">
      <header className="mb-12">
        <h1 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-3">
          Eksplorasi Arsip
        </h1>
        <h2 className="text-3xl md:text-5xl font-light tracking-tight text-foreground">
          Pencarian Dokumen
        </h2>
      </header>
      <div className="w-full">
        <SearchBar initialQuery={initialQuery} />
      </div>
    </div>
  );
}
