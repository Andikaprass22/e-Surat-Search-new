"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { HeaderLogoutButton } from "@/components/layout/header-logout-button";
import type { AuthUser } from "@/lib/auth-helpers";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header({ user }: { user: AuthUser }) {
  const isAdmin = user.role === "admin";
  
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-md px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground transition-colors" />
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 outline-none rounded-full transition-all focus-visible:ring-2 focus-visible:ring-ring">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/50 shadow-lg">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <div className="px-2 py-1.5">
              <Badge variant={isAdmin ? "default" : "secondary"} className="w-full justify-center rounded-md text-[10px] uppercase tracking-wider font-semibold">
                {isAdmin ? "Administrator" : "User Standard"}
              </Badge>
            </div>
            <DropdownMenuSeparator className="bg-border/50" />
            <div className="p-1">
              <HeaderLogoutButton />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
