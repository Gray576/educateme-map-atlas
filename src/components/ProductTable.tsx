"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ChevronsUpDown, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfoHint } from "@/components/ui/info-hint";
import { ProductDetail } from "@/components/ProductDetail";
import {
  formatCurrency,
  formatHalfLife,
  formatScore,
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
  hintSide,
}: {
  label: string;
  description: string;
  column: SortState["column"];
  sortState: SortState;
  onSort: (column: SortState["column"]) => void;
  align?: "left" | "right";
  hintSide?: "left" | "right";
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
      className={cn(
        "flex w-full items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground",
        align === "right" && "justify-end"
      )}
    >
      <span>{label}</span>
      <InfoHint
        label={label}
        description={description}
        side={hintSide ?? (align === "right" ? "right" : "left")}
      />
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
    <div className="overflow-hidden rounded-[24px] border border-border/70 bg-card/90 shadow-[0_12px_32px_-24px_rgba(14,37,33,0.35)] backdrop-blur">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border">
              <th className="w-8 px-3 py-3" />
              <th className="px-2 py-3 text-left">
                <SortButton
                  label="Code"
                  description="Stable SKU code for scanning and cross-referencing products."
                  column="code"
                  sortState={sortState}
                  onSort={handleSort}
                />
              </th>
              <th className="px-2 py-3 text-left">
                <SortButton
                  label="Product"
                  description="Product name with Market and Model moved into pills to save decision space."
                  column="product"
                  sortState={sortState}
                  onSort={handleSort}
                />
              </th>
              <th className="px-2 py-3 text-left">
                <SortButton
                  label="Stage"
                  description="Single lifecycle axis replacing the old overlapping status labels: Hypothesis → Ready → Piloting → Live."
                  column="stage"
                  sortState={sortState}
                  onSort={handleSort}
                />
              </th>
              <th className="px-2 py-3 text-right">
                <SortButton
                  label="Time-to-ship"
                  description="Weeks to first paying customer. Reframed from Readiness into a sortable shipping timeline."
                  column="timeToShip"
                  sortState={sortState}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-2 py-3 text-right">
                <SortButton
                  label="Venture"
                  description="Σ(axis × venture-weight) × confidence. Measures how much this SKU can become a platform or strategic wedge."
                  column="venture"
                  sortState={sortState}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-2 py-3 text-right">
                <SortButton
                  label="Cashflow"
                  description="Σ(axis × cashflow-weight) × confidence. Measures likelihood of putting money in the bank within roughly six months."
                  column="cashflow"
                  sortState={sortState}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-2 py-3 text-right">
                <SortButton
                  label="Δ"
                  description="Difference between Venture and Cashflow scores. Positive means venture-only bet, negative means cashflow-first, near zero means universal winner."
                  column="delta"
                  sortState={sortState}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-2 py-3 text-right">
                <SortButton
                  label="Y1 Contribution"
                  description="Year-one revenue adjusted by gross margin. Higher-quality cash beats a bigger but low-margin top line."
                  column="y1Contribution"
                  sortState={sortState}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-2 py-3 text-left">
                <SortButton
                  label="Bottleneck"
                  description="Lowest blocking axis at a glance, like Distribution 1 or Team fit 2. Shows what limits progress right now."
                  column="bottleneck"
                  sortState={sortState}
                  onSort={handleSort}
                  hintSide="right"
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
                      "cursor-pointer border-t border-border/60 transition-colors hover:bg-muted/20",
                      isOpen && "bg-muted/40"
                    )}
                    onClick={() => setOpenCode(isOpen ? null : product.shortCode)}
                  >
                    <td className="px-3 py-3.5">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </td>
                    <td className="px-2 py-3.5 align-top font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {product.shortCode}
                    </td>
                    <td className="min-w-[260px] px-2 py-3.5 align-top">
                      <div className="space-y-1.5">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold leading-5">{product.title}</p>
                            {!product.dependenciesResolved && (
                              <Badge
                                variant="outline"
                                className="gap-1 border-amber-200 bg-amber-50 text-[10px] text-amber-700"
                              >
                                <Lock className="h-3 w-3" />
                                Blocked by {product.dependencies.join(", ")}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <Badge
                            variant="outline"
                            className={cn("h-4 border px-1.5 text-[10px]", MARKET_CLASS[product.market])}
                          >
                            {product.market}
                          </Badge>
                          {product.modelList.map((model) => (
                            <Badge
                              key={`${product.shortCode}-${model}`}
                              variant="outline"
                              className={cn("h-4 border px-1.5 text-[10px]", MODEL_CLASS[model])}
                            >
                              {model}
                            </Badge>
                          ))}
                          {product.cannibalizationCluster && (
                            <Badge
                              variant="outline"
                              className="h-4 border-rose-200 bg-rose-50 px-1.5 text-[10px] text-rose-700"
                            >
                              Mutually exclusive
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3.5 align-top">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          STAGE_CLASS[product.stage]
                        )}
                      >
                        {product.stageLabel}
                      </span>
                    </td>
                    <td className="px-2 py-3.5 text-right align-top">
                      <span className="font-mono text-[13px] font-semibold">
                        {product.axes.timeToShip}w
                      </span>
                    </td>
                    <td className="px-2 py-3.5 text-right align-top">
                      <ScoreCell value={product.ventureScore} />
                    </td>
                    <td className="px-2 py-3.5 text-right align-top">
                      <ScoreCell value={product.cashflowScore} />
                    </td>
                    <td className="px-2 py-3.5 text-right align-top">
                      <DeltaCell value={product.delta} />
                    </td>
                    <td className="px-2 py-3.5 text-right align-top">
                      <span className="text-[13px] font-semibold">
                        {formatCurrency(product.y1Contribution)}
                      </span>
                    </td>
                    <td className="min-w-[180px] px-2 py-3.5 align-top">
                      <div className="space-y-0.5">
                        <p className="text-[13px] font-semibold leading-5">
                          {product.bottleneck.label} {product.bottleneck.value}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
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
