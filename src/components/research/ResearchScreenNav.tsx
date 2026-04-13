"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ResearchScreenNav({
  active,
  buildHref,
}: {
  active: "founder" | "compare" | "map";
  buildHref: (path: string) => string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href={buildHref("/")}>
        <Button variant={active === "founder" ? "default" : "outline"} size="lg" className="rounded-2xl px-6">
          Founder
        </Button>
      </Link>
      <Link href={buildHref("/compare")}>
        <Button variant={active === "compare" ? "default" : "outline"} size="lg" className="rounded-2xl px-6">
          Compare
        </Button>
      </Link>
      <Link href={buildHref("/map")}>
        <Button variant={active === "map" ? "default" : "outline"} size="lg" className="rounded-2xl px-6">
          Map
        </Button>
      </Link>
    </div>
  );
}
