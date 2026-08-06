import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  FileText,
  FolderTree,
  Hash,
  Clock,
  MailOpen,
  Send,
  Archive,
  MapPin,
  Users2,
  Route,
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getDokumenById } from "@/lib/data/dokumen";
import { getDocumentLogs } from "@/lib/data/dokumen-log";

function formatTanggal(value: Date | string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const AKSI_LABEL: Record<string, string> = {
  CREATE: "Ditambahkan",
  UPDATE: "Diperbarui",
  DELETE: "Dihapus",
};

export default async function DokumenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [dokumen, logs] = await Promise.all([
    getDokumenById(id),
    getDocumentLogs(id),
  ]);

  if (!dokumen) notFound();

  const tanggal = formatTanggal(dokumen.tanggal);
  const tanggalTerima = formatTanggal(dokumen.arsip?.tanggalTerima);

  const dibuat = new Date(dokumen.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const diubah = new Date(dokumen.updatedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const jenis = dokumen.arsip?.jenis;
  const statusArsip = dokumen.arsip?.statusArsip;

  return (
    <Card className="border-2">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <CardTitle>Detail Arsip Surat</CardTitle>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/dokumen">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">{dokumen.judul}</h1>
          {jenis === "SURAT_MASUK" ? (
            <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600">Surat Masuk</Badge>
          ) : jenis === "SURAT_KELUAR" ? (
            <Badge variant="default" className="bg-sky-600 hover:bg-sky-600">Surat Keluar</Badge>
          ) : (
            <Badge variant="outline">Belum diklasifikasikan</Badge>
          )}
          {statusArsip && (
            <Badge variant="secondary">Arsip: {statusArsip}</Badge>
          )}
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Nomor Surat:</span>
            <span className="font-mono font-medium">{dokumen.nomorSurat}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Tanggal:</span>
            <span className="font-medium">{tanggal}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FolderTree className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Kategori:</span>
            <Badge variant="secondary">{dokumen.kategoriName ?? "—"}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Dibuat:</span>
            <span className="font-medium">{dibuat}</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Terakhir diperbarui: {diubah}
        </div>

        <Separator />

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Informasi Kearsipan
          </h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-2 text-sm">
              {jenis === "SURAT_MASUK" ? (
                <MailOpen className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Send className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-muted-foreground">Jenis Surat:</span>
              <span className="font-medium">
                {jenis === "SURAT_MASUK"
                  ? "Surat Masuk"
                  : jenis === "SURAT_KELUAR"
                    ? "Surat Keluar"
                    : "Belum diklasifikasikan"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Pengirim:</span>
              <span className="font-medium">{dokumen.arsip?.pengirim ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Penerima:</span>
              <span className="font-medium">{dokumen.arsip?.penerima ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Perihal:</span>
              <span className="font-medium">{dokumen.arsip?.perihal ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Route className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Disposisi:</span>
              <span className="font-medium">{dokumen.arsip?.disposisi ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Lokasi Arsip:</span>
              <span className="font-medium">{dokumen.arsip?.lokasiArsip ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Archive className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Status Arsip:</span>
              <span className="font-medium">{statusArsip ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tanggal Terima:</span>
              <span className="font-medium">{tanggalTerima}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Konten Dokumen
          </h2>
          <div className="rounded-lg bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
            {dokumen.konten}
          </div>
        </div>

        <Separator />

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <History className="h-4 w-4" />
            Riwayat Aktivitas
          </h2>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-lg border bg-muted/30 px-3 py-2 text-sm"
                >
                  <Badge variant="outline" className="shrink-0 mt-0.5">
                    {AKSI_LABEL[log.aksi] ?? log.aksi}
                  </Badge>
                  <div className="min-w-0">
                    <p className="truncate">{log.keterangan ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      oleh {log.pelaku ?? "—"} ·{" "}
                      {log.createdAt.toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
