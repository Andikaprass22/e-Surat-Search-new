"use client";

import * as React from "react";
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DokumenListItem } from "@/types";

export type DokumenRowAction =
  | { type: "edit"; dokumen: DokumenListItem }
  | { type: "delete"; dokumen: DokumenListItem };

type KategoriOption = { id: string; name: string };

export function DokumenTable({
  data,
  kategoriOptions,
  onAction,
}: {
  data: DokumenListItem[];
  kategoriOptions: KategoriOption[];
  onAction: (action: DokumenRowAction) => void;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);

  const columns = React.useMemo<ColumnDef<DokumenListItem>[]>(
    () => [
      {
        accessorKey: "judul",
        header: "Judul",
        cell: ({ row }) => (
          <Link
            href={`/admin/dokumen/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.judul}
          </Link>
        ),
      },
      {
        accessorKey: "nomorSurat",
        header: "Nomor Surat",
        cell: ({ row }) => (
          <span className="text-muted-foreground font-mono text-sm">
            {row.original.nomorSurat}
          </span>
        ),
      },
      {
        accessorKey: "tanggal",
        header: "Tanggal",
        cell: ({ row }) => {
          const d = row.original.tanggal;
          const dateStr = d instanceof Date ? d : new Date(d);
          return (
            <span className="text-sm text-muted-foreground">
              {dateStr.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          );
        },
      },
      {
        accessorKey: "kategoriName",
        header: "Kategori",
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.kategoriName ?? "—"}</Badge>
        ),
        filterFn: (row, _columnId, filterValue) => {
          if (!filterValue || filterValue === "all") return true;
          return row.original.kategoriId === filterValue;
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const d = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Buka menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/admin/dokumen/${d.id}`}>Lihat detail</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onAction({ type: "edit", dokumen: d })}
                >
                  Ubah dokumen
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() =>
                    onAction({ type: "delete", dokumen: d })
                  }
                >
                  Hapus dokumen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onAction]
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table API is incompatible with React Compiler by design
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
  });

  const currentKategoriFilter =
    (table.getColumn("kategoriName")?.getFilterValue() as string) ?? "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Cari judul dokumen..."
          value={
            (table.getColumn("judul")?.getFilterValue() as string) ?? ""
          }
          onChange={(e) =>
            table.getColumn("judul")?.setFilterValue(e.target.value)
          }
          className="w-full sm:max-w-sm"
        />
        <Select
          value={currentKategoriFilter}
          onValueChange={(val) => {
            table
              .getColumn("kategoriName")
              ?.setFilterValue(val === "all" ? undefined : val);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Semua kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua kategori</SelectItem>
            {kategoriOptions.map((k) => (
              <SelectItem key={k.id} value={k.id}>
                {k.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Tidak ada dokumen ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Total {data.length} dokumen.
      </p>
    </div>
  );
}
