"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeToggleButtonProps = Omit<React.ComponentProps<typeof Button>, "children"> & {
  /** `menu` = full-width row for sidebar popover; `icon` = compact control */
  layout?: "icon" | "menu";
};

export function ThemeToggleButton({
  className,
  layout = "icon",
  onClick,
  ...props
}: ThemeToggleButtonProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(t);
  }, []);

  const toggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const label =
    mounted && resolvedTheme === "dark" ? "Light mode" : "Dark mode";

  if (layout === "menu") {
    return (
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          className,
        )}
        onClick={(e) => {
          toggle();
          onClick?.(e);
        }}
        aria-label={mounted && resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      >
        {mounted ? (
          resolvedTheme === "dark" ? (
            <Sun className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <Moon className="h-4 w-4 shrink-0" aria-hidden />
          )
        ) : (
          <span className="h-4 w-4 shrink-0" aria-hidden />
        )}
        <span className="font-medium">{label}</span>
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("shrink-0 text-muted-foreground hover:text-foreground", className)}
      onClick={(e) => {
        toggle();
        onClick?.(e);
      }}
      aria-label={mounted && resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      {...props}
    >
      {mounted ? (
        resolvedTheme === "dark" ? (
          <Sun className="h-5 w-5" aria-hidden />
        ) : (
          <Moon className="h-5 w-5" aria-hidden />
        )
      ) : (
        <span className="h-5 w-5" aria-hidden />
      )}
    </Button>
  );
}
