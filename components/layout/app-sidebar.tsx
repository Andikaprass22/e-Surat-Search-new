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
        <SidebarMenuButton
          asChild
          isActive={active}
          tooltip={item.title}
          className="h-9 font-medium data-[active=true]:bg-white/10 data-[active=true]:text-white hover:bg-white/10 hover:text-white transition-colors duration-150"
        >
          <Link href={item.url} className="flex items-center gap-2.5">
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate text-[13px]">{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4 flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Logo"
          width={42}
          height={42}
          className="object-contain shrink-0"
          style={{ background: "transparent" }}
          priority
        />
        <div className="flex flex-col min-w-0">
          <span className="truncate text-[15px] font-semibold tracking-tight text-white uppercase">e-Surat</span>
          <span className="truncate text-[10px] font-medium text-white/60 uppercase tracking-widest">Sistem Arsip</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/50 text-[11px] tracking-widest">Umum</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">{publicItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-white/50 text-[11px] tracking-widest">Pengguna</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">{userItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin ? (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="text-white/50 text-[11px] tracking-widest">Administrator</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">{adminOnlyItems.map(renderItem)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel className="text-white/50 text-[11px] tracking-widest">Arsip Surat</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">{arsipItems.map(renderItem)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : null}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 border border-white/20 font-medium text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="truncate text-sm font-medium text-white">{user.name}</span>
            <span className="truncate text-xs text-white/60">{user.email}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
