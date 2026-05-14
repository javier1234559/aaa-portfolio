"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronUp, Globe, LayoutDashboard, LogOut, Settings } from "lucide-react";

import { ThemeToggleButton } from "@/components/layout/theme-toggle-button";
import { brandConfig } from "@/config";
import { RouteNames } from "@/constants";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "dashboard", href: RouteNames.App, icon: LayoutDashboard, label: "Dashboard" },
  { id: "publish", href: RouteNames.AppPublish, icon: Globe, label: "Publish" },
] as const;

export function PortfolioSidebar() {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const activeView =
    pathname === RouteNames.AppPublish || pathname.startsWith(`${RouteNames.AppPublish}/`)
      ? "publish"
      : "dashboard";

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = RouteNames.Login;
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm">
      <div className="flex items-center gap-3 border-b border-sidebar-border/80 p-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm">
          A
        </div>
        <span className="font-display text-base font-semibold tracking-tight">AAA PORTFOLIO</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Intelligence
        </div>
        {menuItems.map((item) => {
          const isActive = item.id === activeView;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              <item.icon size={18} strokeWidth={isActive ? 2.25 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative border-t border-sidebar-border p-3">
        {showUserMenu ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lg duration-200">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Settings size={14} />
              Account Settings
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Bell size={14} />
              Notifications
            </button>
            <ThemeToggleButton
              layout="menu"
              onClick={() => setShowUserMenu(false)}
            />
            <div className="my-1 h-px bg-border" />
            <button
              type="button"
              onClick={() => void logout()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <LogOut size={14} />
              Log Out
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex w-full items-center gap-3 rounded-xl border border-border/80 bg-muted/40 p-3 transition-colors hover:bg-muted/70"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
            AU
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs font-semibold leading-tight text-foreground">Admin User</p>
            <p className="text-[10px] uppercase tracking-tight text-muted-foreground">Executive</p>
          </div>
          <ChevronUp
            size={14}
            className={cn(
              "text-muted-foreground transition-transform duration-300",
              showUserMenu ? "rotate-180" : "",
            )}
          />
        </button>
      </div>

      <div className="px-6 pb-5 pt-0">
        <p className="font-mono text-[10px] text-muted-foreground/80">v{brandConfig.VERSION}-PROD</p>
      </div>
    </aside>
  );
}
