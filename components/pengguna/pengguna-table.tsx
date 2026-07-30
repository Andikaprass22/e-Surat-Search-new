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
import { KeyRound, MoreHorizontal, Trash2 } from "lucide-react";
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
import { ROLES } from "@/lib/constants";
import type { UserListItem } from "@/types";

export type PenggunaRowAction = {
  type: "edit" | "ban" | "unban" | "delete" | "reset-password" | "remove-password";
  user: UserListItem;
};

export function PenggunaTable({
  data,
  onAction,
}: {
  data: UserListItem[];
  onAction: (action: PenggunaRowAction) => void;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);

  const columns = React.useMemo<ColumnDef<UserListItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nama",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "username",
        header: "Nama Pengguna",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.username ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.email ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "role",
        header: "Peran",
        cell: ({ row }) => {
          const role = row.original.role;
          return (
            <Badge variant={role === ROLES.ADMIN ? "default" : "secondary"}>
              {role === ROLES.ADMIN ? "Admin" : "User"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "banned",
        header: "Status",
        cell: ({ row }) => {
          const banned = row.original.banned;
          return (
            <Badge
              variant={banned ? "destructive" : "outline"}
              className={
                banned
                  ? undefined
                  : "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
              }
            >
              {banned ? "Diblokir" : "Aktif"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "hasPassword",
        header: "Sandi",
        cell: ({ row }) => {
          const hasPassword = row.original.hasPassword;
          return (
            <Badge
              variant={hasPassword ? "outline" : "secondary"}
              className={
                hasPassword
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-700 border-amber-500/30"
              }
            >
              {hasPassword ? "Terpasang" : "Belum ada"}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const u = row.original;
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
                <DropdownMenuItem
                  onSelect={() => onAction({ type: "edit", user: u })}
                >
                  Ubah data
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onAction({ type: "reset-password", user: u })}
                >
                  <KeyRound className="h-4 w-4 mr-2" />
                  Buat sandi baru
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => onAction({ type: "remove-password", user: u })}
                  disabled={!u.hasPassword}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus sandi
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {u.banned ? (
                  <DropdownMenuItem
                    onSelect={() => onAction({ type: "unban", user: u })}
                  >
                    Buka blokir
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onSelect={() => onAction({ type: "ban", user: u })}
                  >
                    Blokir pengguna
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => onAction({ type: "delete", user: u })}
                >
                  Hapus pengguna
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

  return (
    <div className="space-y-4">
      <Input
        placeholder="Cari nama, username, atau email..."
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
        className="w-full sm:max-w-sm"
      />
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
                  Tidak ada pengguna ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        Total {data.length} pengguna.
      </p>
    </div>
  );
}
