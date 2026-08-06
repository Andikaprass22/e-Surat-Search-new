"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSearch,
  History,
  BarChart3,
  Archive,
  MailOpen,
  Send,
  FolderTree,
  Users,
  ShieldCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import type { AuthUser } from "@/lib/auth-helpers";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

const userItems: NavItem[] = [
  { title: "Pencarian", url: "/pencarian", icon: FileSearch },
  { title: "Riwayat", url: "/riwayat", icon: History },
  { title: "Laporan", url: "/laporan", icon: BarChart3 },
];

const adminOnlyItems: NavItem[] = [
  { title: "Kelola Pengguna", url: "/admin/pengguna", icon: Users },
  { title: "Kelola Kategori", url: "/admin/kategori", icon: FolderTree },
  { title: "Kelola Arsip Surat", url: "/admin/dokumen", icon: Archive },
];

const arsipItems: NavItem[] = [
  { title: "Surat Masuk", url: "/admin/dokumen?jenis=masuk", icon: MailOpen },
  { title: "Surat Keluar", url: "/admin/dokumen?jenis=keluar", icon: Send },
];

const publicItems: NavItem[] = [
  { title: "Beranda", url: "/dashboard", icon: LayoutDashboard },
];

function isActive(pathname: string, url: string) {
  if (url === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === url || pathname.startsWith(`${url}/`);
}

export function AppSidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const isAdmin = user.role === "admin";

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(pathname, item.url);
    return (
      <SidebarMenuItem key={item.url}>
        <SidebarMenuButton asChild isActive={active} tooltip={item.title} className="h-9">
          <Link href={item.url} className="group flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
            <span className="truncate">{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4 flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Logo"
          width={42}
          height={42}
          className="object-contain shrink-0"
          priority
        />
        <div className="flex flex-col min-w-0">
          <span className="truncate text-[15px] font-semibold tracking-tight text-foreground uppercase">e-Surat</span>
          <span className="truncate text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Sistem Arsip</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Umum</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">{publicItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Pengguna</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">{userItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin ? (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Administrator</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">{adminOnlyItems.map(renderItem)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Arsip Surat</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">{arsipItems.map(renderItem)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : null}
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted border font-medium text-muted-foreground">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="truncate text-sm font-medium text-foreground">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
