"use client";

import type { ReactNode } from "react";
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

function ToolbarButton({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-11 items-center rounded-full border px-5 text-[15px] font-medium transition-colors",
        active
          ? "border-black bg-black text-white"
          : "border-border bg-card text-foreground hover:bg-muted"
      )}
    >
      {children}
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
      className="h-12 rounded-xl border border-border bg-card px-4 text-[15px] text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
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
    <section className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(([value, label, hint]) => (
          <ToolbarButton key={value} active={preset === value} onClick={() => onPresetChange(value)}>
            <span className="flex items-center gap-2">
              {label}
              <InfoHint
                label={label}
                description={hint}
                className={preset === value ? "text-white/75" : ""}
                widthClassName="w-52"
              />
            </span>
          </ToolbarButton>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {SORT_PRESETS.map(([value, label, hint]) => (
          <ToolbarButton key={value} active={sortPreset === value} onClick={() => onSortPreset(value)}>
            <span className="flex items-center gap-2">
              {label}
              <InfoHint label={label} description={hint} widthClassName="w-56" />
            </span>
          </ToolbarButton>
        ))}
      </div>

      <div className="grid gap-2 xl:grid-cols-[minmax(260px,1.4fr)_repeat(5,minmax(170px,1fr))]">
        <label className="flex h-12 items-center gap-3 rounded-xl border border-border bg-card px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search code, product, blocker..."
            value={filters.search}
            onChange={(event) => set({ search: event.target.value })}
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
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

      <div className="grid gap-2 xl:grid-cols-[minmax(360px,1fr)_auto_auto] xl:items-center">
        <div className="flex items-center gap-4 rounded-xl px-1 py-1">
          <div className="flex min-w-[180px] items-center gap-2 text-[13px] text-muted-foreground">
            <span>Min. {filters.scoreMetric}</span>
            <InfoHint
              label="Minimum score"
              description="Use the slider to hide lower-quality options for the selected score."
              widthClassName="w-52"
            />
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
          <span className="w-12 text-right text-[15px] font-medium">{filters.scoreMin.toFixed(1)}</span>
        </div>

        <button
          type="button"
          onClick={() => set({ urgentOnly: !filters.urgentOnly })}
          className={cn(
            "h-12 rounded-xl border px-4 text-[15px] font-medium transition-colors",
            filters.urgentOnly
              ? "border-black bg-muted text-foreground"
              : "border-border bg-card text-foreground hover:bg-muted"
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
          className="h-12 rounded-xl border border-border bg-card px-4 text-[15px] font-medium text-foreground transition-colors hover:bg-muted"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
