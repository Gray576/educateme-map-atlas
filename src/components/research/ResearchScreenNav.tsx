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
    <div className="flex items-center gap-0.5 rounded-md bg-secondary p-0.5">
      <Link href={buildHref("/")}>
        <span
          className={cn(
            "inline-flex rounded px-2.5 py-1 text-xs font-medium transition-all",
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
            "inline-flex rounded px-2.5 py-1 text-xs font-medium transition-all",
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
            "inline-flex rounded px-2.5 py-1 text-xs font-medium transition-all",
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
