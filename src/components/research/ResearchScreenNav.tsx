"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

export function ResearchScreenNav({
  active,
  buildHref,
}: {
  active: "founder" | "compare" | "map";
  buildHref: (path: string) => string;
}) {
  return (
    <div className="inline-grid grid-cols-3 rounded-full border border-border/80 bg-muted px-1 py-1 shadow-sm">
      <Link href={buildHref("/")}>
        <span
          className={cn(
            "inline-flex min-w-[104px] items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all",
            active === "founder"
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Founder
        </span>
      </Link>
      <Link href={buildHref("/compare")}>
        <span
          className={cn(
            "inline-flex min-w-[104px] items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all",
            active === "compare"
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Compare
        </span>
      </Link>
      <Link href={buildHref("/map")}>
        <span
          className={cn(
            "inline-flex min-w-[104px] items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all",
            active === "map"
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Map
        </span>
      </Link>
    </div>
  );
}
