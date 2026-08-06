import { SearchBar } from "@/components/pencarian/search-bar";

export default async function PencarianPage(props: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const initialQuery = searchParams?.q ?? "";

  return (
    <div className="max-w-3xl mx-auto w-full pt-8 md:pt-12">
      <header className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-2">
          Pencarian Arsip Surat
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Cari surat dan dokumen berdasarkan kata kunci. Hasil diurutkan
          menurut tingkat relevansi dengan metode TF-IDF.
        </p>
      </header>
      <div className="w-full">
        <SearchBar initialQuery={initialQuery} />
      </div>
    </div>
  );
}
