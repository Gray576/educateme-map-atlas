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
  B2B: "border-border bg-muted text-muted-foreground",
  B2C: "border-border bg-muted text-muted-foreground",
  B2B2C: "border-border bg-muted text-muted-foreground",
} as const;

const MARKET_CLASS = {
  LUX: "border-border bg-muted text-muted-foreground",
  EU: "border-border bg-muted text-muted-foreground",
  GCC: "border-border bg-muted text-muted-foreground",
} as const;

const STAGE_CLASS = {
  hypothesis: "border border-border bg-muted text-muted-foreground",
  ready: "border border-blue-300 bg-blue-50 text-blue-600",
  piloting: "border border-border bg-muted text-muted-foreground",
  live: "border border-green-300 bg-green-50 text-green-700",
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
        "flex w-full items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground",
        active && "text-foreground",
        align === "right" && "justify-end"
      )}
    >
      <span>{label}</span>
      <InfoHint
        label={label}
        description={description}
        side={hintSide ?? (align === "right" ? "right" : "left")}
        widthClassName="w-56"
      />
      {icon}
    </button>
  );
}

function ScoreCell({ value }: { value: number }) {
  return <span className="font-mono text-[18px] font-medium">{formatScore(value)}</span>;
}

function DeltaCell({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "font-mono text-[18px] font-medium",
        value > 0.2 && "text-green-600",
        value < -0.2 && "text-red-500",
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
    <div className="overflow-hidden rounded-[14px] border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-[#f3f3f3]">
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
                  label="TTS"
                  description="Weeks to first paying customer. Reframed from Readiness into a sortable shipping timeline."
                  column="timeToShip"
                  sortState={sortState}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-2 py-3 text-right">
                <SortButton
                  label="VENT"
                  description="Σ(axis × venture-weight) × confidence. Measures how much this SKU can become a platform or strategic wedge."
                  column="venture"
                  sortState={sortState}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-2 py-3 text-right">
                <SortButton
                  label="CASH"
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
                  label="Y1"
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
                      "cursor-pointer border-t border-border/80 bg-card transition-colors hover:bg-[#fafafa]",
                      isOpen && "bg-[#fafafa]"
                    )}
                    onClick={() => setOpenCode(isOpen ? null : product.shortCode)}
                  >
                    <td className="px-3 py-5">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </td>
                    <td className="px-2 py-5 align-top font-mono text-[12px] font-medium uppercase tracking-[0.02em] text-muted-foreground">
                      {product.shortCode}
                    </td>
                    <td className="min-w-[380px] px-2 py-5 align-top">
                      <div className="space-y-1.5">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[28px] font-medium leading-none tracking-tight">{product.title}</p>
                            {!product.dependenciesResolved && (
                              <Badge
                                variant="outline"
                                className="gap-1 border-border bg-muted text-[11px] text-muted-foreground"
                              >
                                <Lock className="h-3 w-3" />
                                Blocked by {product.dependencies.join(", ")}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className={cn("h-8 rounded-[10px] border px-3 text-[16px] font-medium", MARKET_CLASS[product.market])}
                          >
                            {product.market}
                          </Badge>
                          {product.modelList.map((model) => (
                            <Badge
                              key={`${product.shortCode}-${model}`}
                              variant="outline"
                              className={cn("h-8 rounded-[10px] border px-3 text-[16px] font-medium", MODEL_CLASS[model])}
                            >
                              {model}
                            </Badge>
                          ))}
                          {product.cannibalizationCluster && (
                            <Badge
                              variant="outline"
                              className="h-8 rounded-[10px] border-blue-300 bg-blue-50 px-3 text-[16px] font-medium text-blue-600"
                            >
                              Mutually exclusive
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-5 align-top">
                      <span
                        className={cn(
                          "inline-flex rounded-[10px] px-4 py-1.5 text-[16px] font-medium",
                          STAGE_CLASS[product.stage]
                        )}
                      >
                        {product.stageLabel}
                      </span>
                    </td>
                    <td className="px-2 py-5 text-right align-top">
                      <span className="font-mono text-[18px] font-medium">
                        {product.axes.timeToShip}w
                      </span>
                    </td>
                    <td className="px-2 py-5 text-right align-top">
                      <ScoreCell value={product.ventureScore} />
                    </td>
                    <td className="px-2 py-5 text-right align-top">
                      <ScoreCell value={product.cashflowScore} />
                    </td>
                    <td className="px-2 py-5 text-right align-top">
                      <DeltaCell value={product.delta} />
                    </td>
                    <td className="px-2 py-5 text-right align-top">
                      <span className="text-[18px] font-medium">
                        {formatCurrency(product.y1Contribution)}
                      </span>
                    </td>
                    <td className="min-w-[200px] px-2 py-5 align-top">
                      <div className="space-y-0.5">
                        <p className="text-[18px] font-medium leading-tight">
                          {product.bottleneck.label} {product.bottleneck.value}
                        </p>
                        <p className="text-[14px] text-muted-foreground">
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
