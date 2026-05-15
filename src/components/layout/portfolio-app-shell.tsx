"use client";

import { PortfolioSidebar } from "@/components/layout/portfolio-sidebar";
import { PortfolioSidebarProvider, usePortfolioSidebar } from "@/components/layout/portfolio-sidebar-context";
import { cn } from "@/lib/utils";

function PortfolioMain({ children }: { children: React.ReactNode }) {
  const { collapsed } = usePortfolioSidebar();

  return (
    <main
      className={cn(
        "min-h-screen min-w-0 flex-1 p-12 transition-[margin] duration-200 ease-in-out",
        collapsed ? "ml-18" : "ml-64",
      )}
    >
      {children}
    </main>
  );
}

export function PortfolioAppShell({ children }: { children: React.ReactNode }) {
  return (
    <PortfolioSidebarProvider>
      <div className="flex min-h-screen">
        <PortfolioSidebar />
        <PortfolioMain>{children}</PortfolioMain>
      </div>
    </PortfolioSidebarProvider>
  );
}
