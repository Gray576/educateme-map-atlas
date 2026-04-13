"use client";

import { Button } from "@/components/ui/button";
import { InfoHint } from "@/components/ui/info-hint";
import { Input } from "@/components/ui/input";
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
  ["venture", "Venture", "Platform upside first"],
  ["cashflow", "Cashflow", "Cash in 6 months"],
  ["balanced", "Balanced", "Universal winners"],
];

const SORT_PRESETS: [Exclude<SortPreset, null>, string, string][] = [
  ["ship60", "Ship next 60 days", "Time-to-ship ≤ 8 weeks, ranked for cash"],
  ["venture", "Venture bets", "Positive delta, venture-first sort"],
  ["quickwins", "Quick wins", "High leverage, low shipping friction"],
  ["dyingmandates", "Dying mandates", "Shortest half-life first"],
];

function Select({
  label,
  description,
  value,
  onChange,
  options,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      title={`${label}: ${description}`}
      aria-label={`${label}: ${description}`}
      className="h-9 rounded-full border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
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
    <section className="rounded-[24px] border border-border/70 bg-card/85 p-3 shadow-[0_12px_30px_-24px_rgba(14,37,33,0.34)] backdrop-blur">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESETS.map(([value, label, hint]) => (
            <button
              key={value}
              type="button"
              onClick={() => onPresetChange(value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-left transition",
                preset === value
                  ? "border-primary/70 bg-primary text-primary-foreground shadow-sm"
                  : "border-border/80 bg-background/80 text-foreground hover:bg-muted"
              )}
            >
              <span className="flex items-center gap-1 text-sm font-semibold">
                {label}
                <InfoHint
                  label={label}
                  description={hint}
                  className={preset === value ? "text-primary-foreground/80" : ""}
                />
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {SORT_PRESETS.map(([value, label, hint]) => (
            <Button
              key={value}
              size="sm"
              variant={sortPreset === value ? "default" : "outline"}
              className="h-auto rounded-full px-2.5 py-1.5 text-left"
              onClick={() => onSortPreset(value)}
            >
              <span className="flex items-center gap-1 text-[11px] font-semibold">
                {label}
                <InfoHint
                  label={label}
                  description={hint}
                  className={sortPreset === value ? "text-primary-foreground/80" : ""}
                />
              </span>
            </Button>
          ))}
        </div>

        <div className="grid gap-2 lg:grid-cols-[minmax(0,1.2fr)_repeat(5,minmax(0,0.86fr))]">
          <Input
            type="search"
            placeholder="Search code, product, blocker, action…"
            value={filters.search}
            onChange={(event) => set({ search: event.target.value })}
            className="h-8 rounded-full bg-background/80 text-sm"
          />

          <Select
            label="Market"
            description="Keep the market filter, but move Market out of its own table column."
            value={filters.market}
            onChange={(value) => set({ market: value as Filters["market"] })}
            options={MARKETS}
          />

          <Select
            label="Model"
            description="B2B, B2C, or B2B2C. Model belongs in filters and pills, not as a dedicated decision column."
            value={filters.model}
            onChange={(value) => set({ model: value as Filters["model"] })}
            options={MODELS}
          />

          <Select
            label="Bottleneck type"
            description="Show everything blocked by the same limiting axis, such as Distribution or Team fit."
            value={filters.bottleneckType}
            onChange={(value) =>
              set({ bottleneckType: value as Filters["bottleneckType"] })
            }
            options={BOTTLENECKS}
          />

          <Select
            label="Dependencies resolved"
            description="Filter between products that are ready to move and products still blocked by upstream dependencies."
            value={String(filters.dependenciesResolved)}
            onChange={(value) =>
              set({
                dependenciesResolved:
                  value === "all" ? "all" : value === "true",
              })
            }
            options={[
              ["all", "Dependencies: all"],
              ["true", "Dependencies clear"],
              ["false", "Blocked by dependency"],
            ]}
          />

          <Select
            label="Score metric"
            description="Switch the slider between Venture and Cashflow score ranges."
            value={filters.scoreMetric}
            onChange={(value) => set({ scoreMetric: value as Filters["scoreMetric"] })}
            options={[
              ["cashflow", "Slider: Cashflow"],
              ["venture", "Slider: Venture"],
            ]}
          />
        </div>

        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
          <div className="rounded-3xl border border-border/80 bg-background/80 px-3 py-2.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                Minimum {filters.scoreMetric} score
                <InfoHint
                  label="Minimum score"
                  description="Score range slider for Venture or Cashflow. Use it to cut noise below your minimum bar."
                />
              </span>
              <span className="font-semibold text-foreground">{filters.scoreMin.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={filters.scoreMin}
              onChange={(event) => set({ scoreMin: Number(event.target.value) })}
              className="mt-2 w-full accent-foreground"
            />
          </div>

          <Button
            size="sm"
            variant={filters.urgentOnly ? "default" : "outline"}
            className="rounded-full px-4"
            onClick={() => set({ urgentOnly: !filters.urgentOnly })}
          >
            Half-life &lt; 18 mo
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="rounded-full px-4"
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
          >
            Reset filters
          </Button>
        </div>
      </div>
    </section>
  );
}
