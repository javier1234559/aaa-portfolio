"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { BrandWordmark } from "@/components/layout/brand-wordmark";
import { Button } from "@/components/ui/button";
import { RouteNames } from "@/constants";

export function Header() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(t);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 mx-auto">
        <Link
          href={RouteNames.Home}
          className="flex items-center text-foreground transition-opacity hover:opacity-90"
        >
          <BrandWordmark textClassName="text-lg font-semibold" />
        </Link>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={RouteNames.App}>Dashboard</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )
            ) : (
              <span className="h-5 w-5" aria-hidden />
            )}
          </Button>
          <Button variant="default" asChild>
            <Link href={RouteNames.Login}>Login</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
