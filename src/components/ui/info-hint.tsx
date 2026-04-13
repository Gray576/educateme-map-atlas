"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoHintProps {
  label: string;
  description: string;
  className?: string;
  side?: "left" | "right";
}

export function InfoHint({
  label,
  description,
  className,
  side = "left",
}: InfoHintProps) {
  return (
    <span className={cn("group relative inline-flex items-center", className)}>
      <span
        tabIndex={0}
        aria-label={`${label}: ${description}`}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-border/80 bg-background/90 text-muted-foreground transition hover:border-primary/40 hover:text-foreground focus-visible:border-primary/40 focus-visible:text-foreground focus-visible:outline-none"
      >
        <Info className="h-3 w-3" />
      </span>
      <span
        className={cn(
          "pointer-events-none absolute top-[calc(100%+0.45rem)] z-30 hidden w-64 rounded-2xl border border-border/80 bg-popover px-3 py-2 text-xs normal-case leading-5 text-popover-foreground shadow-xl group-hover:block group-focus-within:block",
          side === "right" ? "right-0" : "left-0"
        )}
      >
        {description}
      </span>
    </span>
  );
}
