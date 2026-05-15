"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronUp,
  Globe,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";

import { BrandWordmark } from "@/components/layout/brand-wordmark";
import { usePortfolioSidebar } from "@/components/layout/portfolio-sidebar-context";
import { ThemeToggleButton } from "@/components/layout/theme-toggle-button";
import { Button } from "@/components/ui/button";
import { brandConfig } from "@/config";
import { RouteNames } from "@/constants";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "dashboard", href: RouteNames.App, icon: LayoutDashboard, label: "Dashboard" },
  { id: "publish", href: RouteNames.AppPublish, icon: Globe, label: "Publish" },
] as const;

export function PortfolioSidebar() {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed } = usePortfolioSidebar();
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
    <aside
      aria-expanded={!collapsed}
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm transition-[width] duration-200 ease-in-out",
        collapsed ? "w-18" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-sidebar-border/80",
          collapsed ? "flex-col gap-2 px-2 py-4" : "justify-between gap-2 p-4 pr-3",
        )}
      >
        <BrandWordmark
          className={cn("gap-3", collapsed && "justify-center")}
          logoClassName="size-9"
          textClassName={cn(
            "text-base font-semibold tracking-tight transition-opacity duration-200",
            collapsed && "sr-only w-0 overflow-hidden opacity-0",
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 rounded-xl text-muted-foreground"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {!collapsed ? (
          <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Intelligence
          </div>
        ) : null}
        {menuItems.map((item) => {
          const isActive = item.id === activeView;
          return (
            <Link
              key={item.id}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex w-full items-center rounded-xl text-sm font-medium transition-colors",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              <item.icon size={18} strokeWidth={isActive ? 2.25 : 2} />
              <span
                className={cn(
                  "transition-opacity duration-200",
                  collapsed && "sr-only w-0 overflow-hidden opacity-0",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="relative border-t border-sidebar-border p-2">
        {showUserMenu ? (
          <div
            className={cn(
              "animate-in fade-in absolute z-50 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lg duration-200",
              collapsed
                ? "bottom-0 left-full mb-0 ml-2 w-52 slide-in-from-left-2"
                : "bottom-full left-3 right-3 mb-2 slide-in-from-bottom-2",
            )}
          >
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
            <ThemeToggleButton layout="menu" onClick={() => setShowUserMenu(false)} />
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
          title={collapsed ? "Admin User" : undefined}
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={cn(
            "flex w-full items-center rounded-xl border border-border/80 bg-muted/40 transition-colors hover:bg-muted/70",
            collapsed ? "justify-center p-2" : "gap-3 p-3",
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
            AU
          </div>
          <div
            className={cn(
              "flex-1 text-left transition-opacity duration-200",
              collapsed && "sr-only w-0 overflow-hidden opacity-0",
            )}
          >
            <p className="text-xs font-semibold leading-tight text-foreground">Brad Wilcox</p>
            <p className="text-[10px] uppercase tracking-tight text-muted-foreground">Executive</p>
          </div>
          <ChevronUp
            size={14}
            className={cn(
              "shrink-0 text-muted-foreground transition-transform duration-300",
              showUserMenu ? "rotate-180" : "",
              collapsed && "sr-only w-0 overflow-hidden opacity-0",
            )}
          />
        </button>
      </div>

      <div className={cn("px-6 pb-5 pt-0", collapsed && "px-2 text-center")}>
        <p
          className={cn(
            "font-mono text-[10px] text-muted-foreground/80",
            collapsed && "sr-only",
          )}
        >
          v{brandConfig.VERSION}-PROD
        </p>
      </div>
    </aside>
  );
}
