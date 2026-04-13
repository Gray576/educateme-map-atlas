"use client";

import type { ReactNode } from "react";
import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ArrowUpDown, Lock } from "lucide-react";
import { InfoHint } from "@/components/ui/info-hint";
import { ProductDetail } from "@/components/ProductDetail";
import { formatCurrency, formatHalfLife, formatScore } from "@/lib/decision";
import { cn } from "@/lib/utils";
import type { EnrichedProduct, Preset, SortState } from "@/types";

interface ProductTableProps {
  products: EnrichedProduct[];
  preset: Preset;
  sortState: SortState;
  onSortChange: (state: SortState) => void;
}

const STAGE_CLASS = {
  hypothesis: "border-zinc-200 bg-zinc-50 text-zinc-600",
  ready: "border-blue-200 bg-blue-50 text-blue-600",
  piloting: "border-amber-200 bg-amber-50 text-amber-700",
  live: "border-green-200 bg-green-50 text-green-700",
} as const;

function MetaPill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "exclusive";
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-[10px] border px-3 text-[12px] font-medium",
        tone === "default" && "border-border bg-muted text-muted-foreground",
        tone === "exclusive" && "border-blue-200 bg-blue-50 text-blue-600"
      )}
    >
      {children}
    </span>
  );
}

function SortLabel({
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

  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className={cn(
        "flex w-full items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground",
        active && "text-foreground",
        align === "right" && "justify-end"
      )}
    >
      <span>{label}</span>
      <InfoHint
        label={label}
        description={description}
        side={hintSide ?? (align === "right" ? "right" : "left")}
        widthClassName="w-44"
      />
      <ArrowUpDown className="h-2.5 w-2.5 opacity-55" />
    </button>
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
      direction:
        column === "delta" || column === "bottleneck" || column === "halfLife" ? "asc" : "desc",
    });
  };

  const emptyState = useMemo(
    () => (
      <div className="rounded-[14px] border border-dashed border-border bg-card px-6 py-16 text-center">
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
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-8 px-2 py-2" />
              <th className="px-3 py-2 text-left">
                <SortLabel
                  label="CODE"
                  description="Stable SKU code for scanning and cross-referencing products."
                  column="code"
                  sortState={sortState}
                  onSort={handleSort}
                />
              </th>
              <th className="px-3 py-2 text-left">
                <SortLabel
                  label="PRODUCT"
                  description="Product name with Market and Model inside the row, not in separate columns."
                  column="product"
                  sortState={sortState}
                  onSort={handleSort}
                />
              </th>
              <th className="px-3 py-2 text-left">
                <SortLabel
                  label="STAGE"
                  description="Single lifecycle axis replacing overlapping old status labels."
                  column="stage"
                  sortState={sortState}
                  onSort={handleSort}
                />
              </th>
              <th className="px-3 py-2 text-right">
                <SortLabel
                  label="TTS"
                  description="Weeks to first paying customer."
                  column="timeToShip"
                  sortState={sortState}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-3 py-2 text-right">
                <SortLabel
                  label="VENT"
                  description="Venture score: strategic/platform upside weighted by confidence."
                  column="venture"
                  sortState={sortState}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-3 py-2 text-right">
                <SortLabel
                  label="CASH"
                  description="Cashflow score: near-term money potential weighted by confidence."
                  column="cashflow"
                  sortState={sortState}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-3 py-2 text-right">
                <SortLabel
                  label="Δ"
                  description="Difference between Venture and Cashflow. Near zero means universal winner."
                  column="delta"
                  sortState={sortState}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-3 py-2 text-right">
                <SortLabel
                  label="Y1"
                  description="Year-one contribution after applying gross margin."
                  column="y1Contribution"
                  sortState={sortState}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-3 py-2 text-left">
                <SortLabel
                  label="BOTTLENECK"
                  description="The currently lowest blocking axis."
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
                      "cursor-pointer border-t border-border transition-colors hover:bg-muted/30 group",
                      isOpen && "bg-muted/20"
                    )}
                    onClick={() => setOpenCode(isOpen ? null : product.shortCode)}
                  >
                    <td className="px-2 py-2 align-top">
                      {isOpen ? (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </td>
                    <td className="px-3 py-2 align-top font-mono text-xs text-muted-foreground">
                      {product.shortCode}
                    </td>
                    <td className="min-w-[320px] px-3 py-2 align-top">
                      <div className="space-y-1">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {product.title}
                          </p>
                          {!product.dependenciesResolved && (
                            <div className="mt-1">
                              <MetaPill>
                                <span className="inline-flex items-center gap-1">
                                  <Lock className="h-3 w-3" />
                                  Blocked by {product.dependencies.join(", ")}
                                </span>
                              </MetaPill>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <MetaPill>{product.market}</MetaPill>
                          {product.modelList.map((model) => (
                            <MetaPill key={`${product.shortCode}-${model}`}>{model}</MetaPill>
                          ))}
                          {product.cannibalizationCluster && (
                            <MetaPill tone="exclusive">Mutually exclusive</MetaPill>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top text-center">
                      <span
                        className={cn(
                          "inline-flex h-5 items-center rounded border px-1.5 text-[10px] font-medium",
                          STAGE_CLASS[product.stage]
                        )}
                      >
                        {product.stageLabel}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right align-top font-mono text-xs">
                      {product.axes.timeToShip}w
                    </td>
                    <td className="px-3 py-2 text-right align-top font-mono text-xs text-foreground">
                      {formatScore(product.ventureScore)}
                    </td>
                    <td className="px-3 py-2 text-right align-top font-mono text-xs text-foreground">
                      {formatScore(product.cashflowScore)}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 text-right align-top font-mono text-xs font-medium",
                        product.delta > 0.2 && "text-green-600",
                        product.delta < -0.2 && "text-red-500"
                      )}
                    >
                      {product.delta > 0 ? "+" : ""}
                      {formatScore(product.delta)}
                    </td>
                    <td className="px-3 py-2 text-right align-top font-mono text-xs font-medium text-foreground">
                      {formatCurrency(product.y1Contribution)}
                    </td>
                    <td className="min-w-[150px] px-3 py-2 align-top">
                      <p className="text-xs text-foreground">
                        {product.bottleneck.label} {product.bottleneck.value}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatHalfLife(product)}
                      </p>
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
