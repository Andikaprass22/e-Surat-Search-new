import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getDokumenList, getDokumenListByJenis } from "@/lib/data/dokumen";
import { getKategoriList } from "@/lib/data/kategori";
import { DokumenSection } from "@/components/dokumen/dokumen-section";
import { JENIS_SURAT, type JenisSurat } from "@/types";

function DokumenFallback() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Memuat daftar dokumen...</span>
    </div>
  );
}

export default async function SemuaDokumenPage({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string }>;
}) {
  const { jenis } = await searchParams;
  const jenisFilter: JenisSurat | null =
    jenis === "masuk"
      ? JENIS_SURAT.MASUK
      : jenis === "keluar"
        ? JENIS_SURAT.KELUAR
        : null;

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto w-full">
      <div className="flex flex-col gap-1.5">
        <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">Administrator · Arsip</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#172B3A]">
          {jenisFilter === JENIS_SURAT.MASUK
            ? "Arsip Surat Masuk"
            : jenisFilter === JENIS_SURAT.KELUAR
              ? "Arsip Surat Keluar"
              : "Kelola Arsip Surat"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Dikelola oleh Administrator — tambah, ubah, atau hapus arsip surat. Perubahan akan terindeks otomatis untuk pencarian TF-IDF.
        </p>
      </div>
      <Suspense fallback={<DokumenFallback />}>
        <DokumenLoader jenisFilter={jenisFilter} />
      </Suspense>
    </div>
  );
}

async function DokumenLoader({ jenisFilter }: { jenisFilter: JenisSurat | null }) {
  const [dokumen, kategori] = await Promise.all([
    jenisFilter ? getDokumenListByJenis(jenisFilter) : getDokumenList(),
    getKategoriList(),
  ]);
  return (
    <DokumenSection initialData={dokumen} kategoriOptions={kategori} />
  );
}
