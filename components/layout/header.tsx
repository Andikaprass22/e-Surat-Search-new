import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { HeaderLogoutButton } from "@/components/layout/header-logout-button";
import type { AuthUser } from "@/lib/auth-helpers";

export function Header({ user }: { user: AuthUser }) {
  const isAdmin = user.role === "admin";
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <span className="text-sm text-muted-foreground">
          Selamat datang,{" "}
          <span className="font-medium text-foreground">{user.name}</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={isAdmin ? "default" : "secondary"}>
          {isAdmin ? "Admin" : "User"}
        </Badge>
        <span className="hidden text-xs text-muted-foreground md:inline">
          {user.email}
        </span>
        <HeaderLogoutButton />
      </div>
    </header>
  );
}
