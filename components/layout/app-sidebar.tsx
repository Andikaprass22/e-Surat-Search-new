"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileSearch,
  History,
  Sparkles,
  BarChart3,
  FileText,
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
  { title: "Pencarian", url: "/dashboard/pencarian", icon: FileSearch },
  { title: "Riwayat", url: "/dashboard/riwayat", icon: History },
  { title: "Template", url: "/dashboard/template", icon: Sparkles },
  { title: "Laporan", url: "/dashboard/laporan", icon: BarChart3 },
];

const adminOnlyItems: NavItem[] = [
  { title: "Kelola Pengguna", url: "/dashboard/admin/pengguna", icon: Users },
  { title: "Kelola Kategori", url: "/dashboard/admin/kategori", icon: FolderTree },
  { title: "Semua Dokumen", url: "/dashboard/admin/dokumen", icon: FileText },
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
        <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
          <Link href={item.url} className="relative">
            <motion.span
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="flex w-full items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </motion.span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">e-Surat Search</span>
            <span className="text-xs text-muted-foreground">Pencarian BMN</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Umum</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{publicItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Pengguna</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{userItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel>Administrator</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{adminOnlyItems.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarFooter className="border-t p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col truncate">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
          <Badge variant={isAdmin ? "default" : "secondary"}>
            {isAdmin ? "Admin" : "User"}
          </Badge>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
