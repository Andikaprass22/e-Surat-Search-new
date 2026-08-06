import { MailOpen, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRekapArsip } from "@/lib/data/laporan";

export async function RekapArsipSection() {
  const rekap = await getRekapArsip();

  return (
    <Card>
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="text-base">Rekap Arsip Surat</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-lg border bg-emerald-500/5 px-4 py-3">
            <MailOpen className="h-5 w-5 text-emerald-600" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Total Surat Masuk
              </span>
              <span className="text-2xl font-light">
                {rekap.totalSuratMasuk.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-sky-500/5 px-4 py-3">
            <Send className="h-5 w-5 text-sky-600" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Total Surat Keluar
              </span>
              <span className="text-2xl font-light">
                {rekap.totalSuratKeluar.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {rekap.perBulan.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada surat berklasifikasi masuk/keluar.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">
                    Periode
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-right">
                    Surat Masuk
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-right">
                    Surat Keluar
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rekap.perBulan.map((item) => {
                  const [tahun, bulan] = item.bulan.split("-");
                  const label = `${bulan}/${tahun}`;
                  return (
                    <TableRow key={item.bulan} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{label}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{item.suratMasuk}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{item.suratKeluar}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
