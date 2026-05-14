"use client";

import Link from "next/link";
import { LayoutGrid, LogOut, FolderKanban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggleButton } from "@/components/layout/theme-toggle-button";
import { brandConfig } from "@/config";
import { RouteNames } from "@/constants";
import { cn } from "@/lib/utils";

const nav = [
  { href: RouteNames.App, label: "Projects", icon: FolderKanban },
] as const;

export function AppSidebar({ currentPath }: { currentPath: string }) {
  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = RouteNames.Login;
  };

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border/80 bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 border-b border-border/80 px-4">
        <LayoutGrid className="h-5 w-5 text-muted-foreground" aria-hidden />
        <span className="font-display text-base font-semibold tracking-tight text-foreground">
          {brandConfig.NAME}
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === RouteNames.App
              ? currentPath === RouteNames.App ||
                currentPath.startsWith(`${RouteNames.App}/`)
              : currentPath === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <Separator />
      <div className="space-y-2 p-2">
        <div className="flex justify-center py-1">
          <ThemeToggleButton />
        </div>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={RouteNames.Home}>Marketing home</Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          type="button"
          onClick={() => void logout()}
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
