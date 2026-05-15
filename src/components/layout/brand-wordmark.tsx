import { brandConfig } from "@/config";
import { cn } from "@/lib/utils";

type BrandWordmarkProps = {
  className?: string;
  logoClassName?: string;
  textClassName?: string;
};

/** Favicon mark (`/icon0.svg`) plus configured product name. */
export function BrandWordmark({
  className,
  logoClassName,
  textClassName,
}: BrandWordmarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img
        src="/icon0.svg"
        alt=""
        width={32}
        height={32}
        className={cn("size-8 shrink-0 object-contain", logoClassName)}
        aria-hidden
      />
      <span className={cn("font-display font-semibold text-foreground", textClassName)}>
        {brandConfig.NAME}
      </span>
    </span>
  );
}
