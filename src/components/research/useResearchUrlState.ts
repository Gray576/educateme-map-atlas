"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { getDefaultFounderFilters, type FounderFiltersState } from "@/lib/research-view";
import type { PresetKey } from "@/types";

const VALID_PRESETS: PresetKey[] = ["founder", "delivery", "claims", "evidence", "expansion"];

function parsePreset(value: string | null): PresetKey {
  if (value && VALID_PRESETS.includes(value as PresetKey)) {
    return value as PresetKey;
  }

  return "founder";
}

function parseFilters(searchParams: URLSearchParams): FounderFiltersState {
  const defaults = getDefaultFounderFilters();

  return {
    market: searchParams.get("market") ?? defaults.market,
    buyer: searchParams.get("buyer") ?? defaults.buyer,
    claims: searchParams.get("claims") ?? defaults.claims,
    subsidy: searchParams.get("subsidy") ?? defaults.subsidy,
    dependencies: searchParams.get("dependencies") ?? defaults.dependencies,
  };
}

function buildQueryString({
  preset,
  filters,
  selectedCode,
}: {
  preset: PresetKey;
  filters: FounderFiltersState;
  selectedCode: string | null;
}) {
  const params = new URLSearchParams();

  if (preset !== "founder") {
    params.set("preset", preset);
  }

  for (const [key, value] of Object.entries(filters)) {
    if (value !== "all") {
      params.set(key, value);
    }
  }

  if (selectedCode) {
    params.set("selected", selectedCode);
  }

  const query = params.toString();
  return query.length > 0 ? `?${query}` : "";
}

export function useResearchUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPreset = useMemo(() => parsePreset(searchParams.get("preset")), [searchParams]);
  const initialFilters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const initialSelectedCode = useMemo(() => searchParams.get("selected"), [searchParams]);

  const [preset, setPreset] = useState<PresetKey>(initialPreset);
  const [filters, setFilters] = useState<FounderFiltersState>(initialFilters);
  const [selectedCode, setSelectedCode] = useState<string | null>(initialSelectedCode);

  useEffect(() => {
    setPreset(initialPreset);
  }, [initialPreset]);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    setSelectedCode(initialSelectedCode);
  }, [initialSelectedCode]);

  const queryString = useMemo(
    () => buildQueryString({ preset, filters, selectedCode }),
    [preset, filters, selectedCode]
  );

  useEffect(() => {
    router.replace(`${pathname}${queryString}`, { scroll: false });
  }, [pathname, queryString, router]);

  function buildHref(path: string) {
    return `${path}${queryString}`;
  }

  return {
    preset,
    setPreset,
    filters,
    setFilters,
    selectedCode,
    setSelectedCode,
    queryString,
    buildHref,
  };
}
