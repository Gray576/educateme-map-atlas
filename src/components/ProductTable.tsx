"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ChevronsUpDown, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductDetail } from "@/components/ProductDetail";
import {
  formatCurrency,
  formatHalfLife,
  formatScore,
  getScoreForPreset,
} from "@/lib/decision";
import { cn } from "@/lib/utils";
import type { EnrichedProduct, Preset, SortState } from "@/types";

interface ProductTableProps {
  products: EnrichedProduct[];
  preset: Preset;
  sortState: SortState;
  onSortChange: (state: SortState) => void;
}

const MODEL_CLASS = {
  B2B: "border-sky-200 bg-sky-50 text-sky-700",
  B2C: "border-emerald-200 bg-emerald-50 text-emerald-700",
  B2B2C: "border-amber-200 bg-amber-50 text-amber-700",
} as const;

const MARKET_CLASS = {
  LUX: "border-slate-200 bg-slate-50 text-slate-700",
  EU: "border-indigo-200 bg-indigo-50 text-indigo-700",
  GCC: "border-teal-200 bg-teal-50 text-teal-700",
} as const;

const STAGE_CLASS = {
  hypothesis: "bg-zinc-100 text-zinc-700",
  ready: "bg-blue-100 text-blue-700",
  piloting: "bg-amber-100 text-amber-700",
  live: "bg-emerald-100 text-emerald-700",
} as const;

function SortButton({
  label,
  description,
  column,
  sortState,
  onSort,
  align = "left",
}: {
  label: string;
  description: string;
  column: SortState["column"];
  sortState: SortState;
  onSort: (column: SortState["column"]) => void;
  align?: "left" | "right";
}) {
  const active = sortState.column === column;
  const icon = active ? (
    <ChevronDown
      className={cn(
        "h-3.5 w-3.5 transition-transform",
        sortState.direction === "asc" && "rotate-180"
      )}
    />
  ) : (
    <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
  );

  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      title={description}
      aria-label={`${label}: ${description}`}
      className={cn(
        "flex w-full items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground",
        align === "right" && "justify-end"
      )}
    >
      <span>{label}</span>
      {icon}
    </button>
  );
}

function ScoreCell({ value }: { value: number }) {
  return <span className="font-mono text-sm font-semibold">{formatScore(value)}</span>;
}

function DeltaCell({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "font-mono text-sm font-semibold",
        value > 0.2 && "text-indigo-700",
        value < -0.2 && "text-emerald-700",
        value >= -0.2 && value <= 0.2 && "text-foreground"
      )}
    >
      {value > 0 ? "+" : ""}
      {formatScore(value)}
    </span>
  );
}

function ColumnHint({ preset, product }: { preset: Preset; product: EnrichedProduct }) {
  const label =
    preset === "venture"
      ? "Venture-led"
      : preset === "cashflow"
      ? "Cash-led"
      : "Balanced view";

  return (
    <span className="text-[11px] text-muted-foreground">
      {label} · active score {formatScore(getScoreForPreset(product, preset))}
    </span>
  );
}

export function ProductTable({
  products,
  preset,
  sortState,
  onSortChange,
}: ProductTableProps) {
  const [openCode, setOpenCode] = useState<string | null>(null);

  const handleSort = (column: SortState["column"]) => {
    if (!column) return;
    if (sortState.column === column) {
      onSortChange({
        column,
        direction: sortState.direction === "desc" ? "asc" : "desc",
      });
      return;
    }

    onSortChange({
      column,
      direction: column === "delta" || column === "bottleneck" || column === "halfLife" ? "asc" : "desc",
    });
  };

  const emptyState = useMemo(
    () => (
      <div className="rounded-[28px] border border-dashed border-border bg-card px-6 py-16 text-center">
        <p className="text-sm font-medium">No products match this decision view.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Relax one filter or switch the preset to widen the opportunity set.
        </p>
      </div>
    ),
    []
  );

  if (products.length === 0) return emptyState;

  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border">
              <th className="w-10 px-4 py-4" />
              <th className="px-3 py-4 text-left">
                <SortButton
                  label="Code"
                  description="Stable SKU code for scanning and cross-referencing products."
                  column="code"
                  sortState={sortState}
                  onSort={handleSort}
                />
              </th>
              <th className="px-3 py-4 text-left">
                <SortButton
                  label="Product"
                  description="Product name with Market and Model moved into pills to save decision space."
                  column="product"
                  sortState={sortState}
                  onSort={handleSort}
                />
              </th>
              <th className="px-3 py-4 text-left">
                <SortButton
                  label="Stage"
                  description="Single lifecycle axis replacing the old overlapping status labels: Hypothesis → Ready → Piloting → Live."
                  column="stage"
                  sortState={sortState}
                  onSort={handleSort}
                />
              </th>
              <th className="px-3 py-4 text-right">
                <SortButton
                  label="Time-to-ship"
                  description="Weeks to first paying customer. Reframed from Readiness into a sortable shipping timeline."
                  column="timeToShip"
                  sortState={sortState}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-3 py-4 text-right">
                <SortButton
                  label="Venture"
                  description="Σ(axis × venture-weight) × confidence. Measures how much this SKU can become a platform or strategic wedge."
                  column="venture"
                  sortState={sortState}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-3 py-4 text-right">
                <SortButton
                  label="Cashflow"
                  description="Σ(axis × cashflow-weight) × confidence. Measures likelihood of putting money in the bank within roughly six months."
                  column="cashflow"
                  sortState={sortState}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-3 py-4 text-right">
                <SortButton
                  label="Δ"
                  description="Difference between Venture and Cashflow scores. Positive means venture-only bet, negative means cashflow-first, near zero means universal winner."
                  column="delta"
                  sortState={sortState}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-3 py-4 text-right">
                <SortButton
                  label="Y1 Contribution"
                  description="Year-one revenue adjusted by gross margin. Higher-quality cash beats a bigger but low-margin top line."
                  column="y1Contribution"
                  sortState={sortState}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-3 py-4 text-left">
                <SortButton
                  label="Bottleneck"
                  description="Lowest blocking axis at a glance, like Distribution 1 or Team fit 2. Shows what limits progress right now."
                  column="bottleneck"
                  sortState={sortState}
                  onSort={handleSort}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isOpen = openCode === product.shortCode;

              return (
                <Fragment key={product.shortCode}>
                  <tr
                    className={cn(
                      "cursor-pointer border-t border-border/70 transition-colors hover:bg-muted/30",
                      isOpen && "bg-muted/40"
                    )}
                    onClick={() => setOpenCode(isOpen ? null : product.shortCode)}
                  >
                    <td className="px-4 py-4">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </td>
                    <td className="px-3 py-4 align-top font-mono text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {product.shortCode}
                    </td>
                    <td className="min-w-[320px] px-3 py-4 align-top">
                      <div className="space-y-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold">{product.title}</p>
                            {!product.dependenciesResolved && (
                              <Badge
                                variant="outline"
                                className="gap-1 border-amber-200 bg-amber-50 text-amber-700"
                              >
                                <Lock className="h-3 w-3" />
                                Blocked by {product.dependencies.join(", ")}
                              </Badge>
                            )}
                          </div>
                          <ColumnHint preset={preset} product={product} />
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          <Badge
                            variant="outline"
                            className={cn("border", MARKET_CLASS[product.market])}
                          >
                            {product.market}
                          </Badge>
                          {product.modelList.map((model) => (
                            <Badge
                              key={`${product.shortCode}-${model}`}
                              variant="outline"
                              className={cn("border", MODEL_CLASS[model])}
                            >
                              {model}
                            </Badge>
                          ))}
                          {product.cannibalizationCluster && (
                            <Badge
                              variant="outline"
                              className="border-rose-200 bg-rose-50 text-rose-700"
                            >
                              Mutually exclusive
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          STAGE_CLASS[product.stage]
                        )}
                      >
                        {product.stageLabel}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right align-top">
                      <span className="font-mono text-sm font-semibold">
                        {product.axes.timeToShip}w
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right align-top">
                      <ScoreCell value={product.ventureScore} />
                    </td>
                    <td className="px-3 py-4 text-right align-top">
                      <ScoreCell value={product.cashflowScore} />
                    </td>
                    <td className="px-3 py-4 text-right align-top">
                      <DeltaCell value={product.delta} />
                    </td>
                    <td className="px-3 py-4 text-right align-top">
                      <span className="text-sm font-semibold">
                        {formatCurrency(product.y1Contribution)}
                      </span>
                    </td>
                    <td className="min-w-[210px] px-3 py-4 align-top">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">
                          {product.bottleneck.label} {product.bottleneck.value}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatHalfLife(product)}
                        </p>
                      </div>
                    </td>
                  </tr>

                  {isOpen && (
                    <tr className="bg-muted/20">
                      <td colSpan={10} className="px-0 py-0">
                        <ProductDetail product={product} preset={preset} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
