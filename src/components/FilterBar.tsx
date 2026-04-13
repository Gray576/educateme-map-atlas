"use client";

import { Search } from "lucide-react";
import { InfoHint } from "@/components/ui/info-hint";
import { cn } from "@/lib/utils";
import type {
  BottleneckAxis,
  Filters,
  Market,
  Model,
  Preset,
  SortPreset,
} from "@/types";

interface FilterBarProps {
  filters: Filters;
  preset: Preset;
  sortPreset: SortPreset;
  onChange: (next: Filters) => void;
  onPresetChange: (preset: Preset) => void;
  onSortPreset: (preset: SortPreset) => void;
}

const MARKETS: [Market | "all", string][] = [
  ["all", "All markets"],
  ["LUX", "LUX"],
  ["EU", "EU"],
  ["GCC", "GCC"],
];

const MODELS: [Model | "all", string][] = [
  ["all", "All models"],
  ["B2B", "B2B"],
  ["B2C", "B2C"],
  ["B2B2C", "B2B2C"],
];

const BOTTLENECKS: [BottleneckAxis | "all", string][] = [
  ["all", "Any bottleneck"],
  ["distribution", "Distribution"],
  ["teamFit", "Team fit"],
  ["studioLeverage", "Studio leverage"],
  ["tamCeiling", "TAM ceiling"],
  ["painMandate", "Pain × mandate"],
  ["manualEffort", "Manual effort"],
  ["wedge", "Wedge"],
  ["cacLtv", "CAC/LTV"],
  ["moatBuild", "Moat build"],
];

const PRESETS: [Preset, string, string][] = [
  ["venture", "Venture", "View products by venture score"],
  ["cashflow", "Cashflow", "View products by cashflow score"],
  ["balanced", "Balanced", "View products by balanced score"],
];

const SORT_PRESETS: [Exclude<SortPreset, null>, string, string][] = [
  ["ship60", "Ship next 60 days", "Time-to-ship ≤ 8 weeks, ranked for cash"],
  ["venture", "Venture bets", "Positive delta, venture-first sort"],
  ["quickwins", "Quick wins", "High leverage with low shipping friction"],
  ["dyingmandates", "Dying mandates", "Shortest half-life first"],
];

function CompactTab({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-all",
        active
          ? "bg-foreground text-background shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
      <InfoHint
        label={label}
        description={hint}
        className={active ? "text-background/70" : ""}
        widthClassName="w-44"
      />
    </button>
  );
}

function PillButton({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-all",
        active
          ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] font-medium text-[hsl(var(--accent))]"
          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
      )}
    >
      {label}
      <InfoHint label={label} description={hint} widthClassName="w-52" />
      {active && (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-[9px] text-[hsl(var(--accent-foreground))]">
          ✓
        </span>
      )}
    </button>
  );
}

function CompactSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 rounded-md border border-border bg-secondary px-2.5 text-xs text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      {options.map(([optionValue, label]) => (
        <option key={optionValue} value={optionValue}>
          {label}
        </option>
      ))}
    </select>
  );
}

export function FilterBar({
  filters,
  preset,
  sortPreset,
  onChange,
  onPresetChange,
  onSortPreset,
}: FilterBarProps) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <section className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-0.5 rounded-md bg-secondary p-0.5">
          {PRESETS.map(([value, label, hint]) => (
            <CompactTab
              key={value}
              active={preset === value}
              onClick={() => onPresetChange(value)}
              label={label}
              hint={hint}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {SORT_PRESETS.map(([value, label, hint]) => (
            <PillButton
              key={value}
              active={sortPreset === value}
              onClick={() => onSortPreset(value)}
              label={label}
              hint={hint}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search code, product, blocker..."
            value={filters.search}
            onChange={(event) => set({ search: event.target.value })}
            className="h-8 w-full rounded-md border border-border bg-secondary pl-8 pr-2.5 text-xs outline-none placeholder:text-muted-foreground"
          />
        </label>

        <CompactSelect
          value={filters.market}
          onChange={(value) => set({ market: value as Filters["market"] })}
          options={MARKETS}
        />
        <CompactSelect
          value={filters.model}
          onChange={(value) => set({ model: value as Filters["model"] })}
          options={MODELS}
        />
        <CompactSelect
          value={filters.bottleneckType}
          onChange={(value) => set({ bottleneckType: value as Filters["bottleneckType"] })}
          options={BOTTLENECKS}
        />
        <CompactSelect
          value={String(filters.dependenciesResolved)}
          onChange={(value) =>
            set({
              dependenciesResolved: value === "all" ? "all" : value === "true",
            })
          }
          options={[
            ["all", "Dependencies: all"],
            ["true", "Dependencies: clear"],
            ["false", "Dependencies: blocked"],
          ]}
        />
        <CompactSelect
          value={filters.scoreMetric}
          onChange={(value) => set({ scoreMetric: value as Filters["scoreMetric"] })}
          options={[
            ["cashflow", "Slider: Cashflow"],
            ["venture", "Slider: Venture"],
          ]}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
            <span>Min. {filters.scoreMetric}</span>
            <InfoHint
              label="Minimum score"
              description="Filter products by minimum score."
              widthClassName="w-44"
            />
          </div>
          <div className="flex max-w-md flex-1 items-center gap-3">
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={filters.scoreMin}
              onChange={(event) => set({ scoreMin: Number(event.target.value) })}
              className="w-full accent-black"
            />
            <span className="w-8 text-right font-mono text-xs text-foreground">
              {filters.scoreMin.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => set({ urgentOnly: !filters.urgentOnly })}
            className={cn(
              "h-7 rounded-md border px-2.5 text-xs transition-colors",
              filters.urgentOnly
                ? "border-border bg-muted text-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            Half-life &lt; 18 mo
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...filters,
                search: "",
                market: "all",
                model: "all",
                scoreMetric: "cashflow",
                scoreMin: 0,
                bottleneckType: "all",
                urgentOnly: false,
                dependenciesResolved: "all",
              })
            }
            className="h-7 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
