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
      className="h-16 rounded-2xl border border-border bg-card px-5 text-[18px] text-foreground shadow-none outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
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
    <section className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map(([value, label, hint]) => (
            <button
              key={value}
              type="button"
              onClick={() => onPresetChange(value)}
              className={cn(
                "h-12 rounded-2xl border px-5 text-left transition",
                preset === value
                  ? "border-black bg-black text-white"
                  : "border-border bg-muted text-foreground hover:bg-background"
              )}
            >
              <span className="flex items-center gap-1.5 text-[13px] font-medium">
                {label}
                <InfoHint
                  label={label}
                  description={hint}
                  className={preset === value ? "text-white/80" : ""}
                />
              </span>
            </button>
          ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
          {SORT_PRESETS.map(([value, label, hint]) => (
            <Button
              key={value}
              size="sm"
              variant="outline"
              className={cn(
                "h-12 rounded-full border-border bg-card px-5 text-left text-[13px] font-medium shadow-none",
                sortPreset === value && "border-foreground/30 bg-muted"
              )}
              onClick={() => onSortPreset(value)}
            >
              <span className="flex items-center gap-1.5 text-[13px] font-medium">
                {label}
                <InfoHint
                  label={label}
                  description={hint}
                  className="text-muted-foreground"
                />
              </span>
            </Button>
          ))}
      </div>

      <div className="grid gap-2 lg:grid-cols-[minmax(0,1.35fr)_repeat(5,minmax(0,0.9fr))]">
          <Input
            type="search"
            placeholder="Search code, product, blocker, action…"
            value={filters.search}
            onChange={(event) => set({ search: event.target.value })}
            className="h-16 rounded-2xl border-border bg-card px-5 text-[18px] placeholder:text-[18px] shadow-none md:text-[18px]"
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
          <div className="flex items-center gap-4 px-1 py-2">
            <div className="flex min-w-[190px] items-center gap-2 text-[14px] text-muted-foreground">
              <span className="flex items-center gap-1">
                Minimum {filters.scoreMetric} score
                <InfoHint
                  label="Minimum score"
                  description="Score range slider for Venture or Cashflow. Use it to cut noise below your minimum bar."
                />
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={filters.scoreMin}
              onChange={(event) => set({ scoreMin: Number(event.target.value) })}
              className="w-full accent-black"
            />
            <span className="w-14 text-right text-[18px] font-medium text-foreground">
              {filters.scoreMin.toFixed(1)}
            </span>
          </div>

          <Button
            size="sm"
            variant="outline"
            className={cn(
              "h-12 rounded-xl border-border bg-card px-5 text-[13px] shadow-none",
              filters.urgentOnly && "bg-muted"
            )}
            onClick={() => set({ urgentOnly: !filters.urgentOnly })}
          >
            Half-life &lt; 18 mo
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-12 rounded-xl border-border bg-card px-5 text-[13px] shadow-none"
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
    </section>
  );
}
