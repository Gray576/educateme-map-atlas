"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoHintProps {
  label: string;
  description: string;
  className?: string;
  side?: "left" | "right";
  widthClassName?: string;
}

export function InfoHint({
  label,
  description,
  className,
  side = "left",
  widthClassName = "w-64",
}: InfoHintProps) {
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const tooltipWidth = 288;
    const gap = 10;
    const viewportPadding = 12;

    let left =
      side === "right"
        ? rect.right - tooltipWidth
        : rect.left;

    left = Math.max(viewportPadding, Math.min(left, window.innerWidth - tooltipWidth - viewportPadding));

    setPosition({
      top: rect.bottom + gap,
      left,
    });
  }, [side]);

  useEffect(() => {
    if (!open) return;

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  return (
    <span className={cn("group relative inline-flex items-center", className)}>
      <span
        ref={triggerRef}
        tabIndex={0}
        aria-label={`${label}: ${description}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-border/80 bg-background/90 text-muted-foreground transition hover:border-primary/40 hover:text-foreground focus-visible:border-primary/40 focus-visible:text-foreground focus-visible:outline-none"
      >
        <Info className="h-3 w-3" />
      </span>
      {open ? (
        <span
          className={cn(
            "pointer-events-none fixed z-[80] max-w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl border border-border/80 bg-popover px-3 py-2 text-xs normal-case leading-5 text-popover-foreground shadow-xl",
            widthClassName
          )}
          style={{ top: position.top, left: position.left }}
        >
          {description}
        </span>
      ) : null}
    </span>
  );
}
