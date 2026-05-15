"use client";

import * as React from "react";

const STORAGE_KEY = "portfolio-sidebar-collapsed";

type PortfolioSidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
};

const PortfolioSidebarContext = React.createContext<PortfolioSidebarContextValue | null>(
  null,
);

export function PortfolioSidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = React.useState(false);

  React.useEffect(() => {
    try {
      setCollapsedState(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // ignore private mode / blocked storage
    }
  }, []);

  const setCollapsed = React.useCallback((next: boolean) => {
    setCollapsedState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      // ignore
    }
  }, []);

  const toggleCollapsed = React.useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const value = React.useMemo(
    () => ({ collapsed, setCollapsed, toggleCollapsed }),
    [collapsed, setCollapsed, toggleCollapsed],
  );

  return (
    <PortfolioSidebarContext.Provider value={value}>
      {children}
    </PortfolioSidebarContext.Provider>
  );
}

export function usePortfolioSidebar() {
  const context = React.useContext(PortfolioSidebarContext);
  if (!context) {
    throw new Error("usePortfolioSidebar must be used within PortfolioSidebarProvider");
  }
  return context;
}
