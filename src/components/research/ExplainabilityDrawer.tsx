"use client";

import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InfoHint } from "@/components/ui/info-hint";
import { COMPOSITE_METRICS, getPresetLabel, RAW_LOAD_FACTORS } from "@/lib/research-metadata";
import { buildDrawerReasoning, type FounderRowRecord } from "@/lib/research-view";
import { cn } from "@/lib/utils";
import type { PresetKey } from "@/types";

function formatScore(value: number) {
  return value.toFixed(1);
}

function scoreTone(score: number) {
  if (score >= 70) return "bg-emerald-100 text-emerald-800";
  if (score >= 45) return "bg-amber-100 text-amber-800";
  return "bg-rose-100 text-rose-800";
}

function severityTone(severity: "low" | "medium" | "high") {
  if (severity === "high") return "bg-rose-100 text-rose-800";
  if (severity === "medium") return "bg-amber-100 text-amber-800";
  return "bg-emerald-100 text-emerald-800";
}

function MetricRow({
  label,
  description,
  value,
}: {
  label: string;
  description: string;
  value: number;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_140px] items-center gap-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span>{label}</span>
        <InfoHint label={label} description={description} widthClassName="w-56" />
      </div>
      <div className="flex justify-end">
        <span className={cn("inline-flex min-w-24 justify-center rounded-xl px-3 py-2 text-sm font-semibold", scoreTone(value))}>
          {formatScore(value)}
        </span>
      </div>
    </div>
  );
}

function RawRow({
  label,
  value,
  scale,
}: {
  label: string;
  value: number;
  scale?: "/4";
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm font-semibold text-muted-foreground">
        {value}
        {scale ?? ""}
      </span>
    </div>
  );
}

function DetailCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background px-4 py-4">
      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-base font-semibold">{value}</p>
      {hint ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ExplainabilityDrawer({
  product,
  preset,
  onClose,
  onPrevious,
  onNext,
}: {
  product: FounderRowRecord | null;
  preset: PresetKey;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}) {
  if (!product) return null;

  const reasoning = buildDrawerReasoning(product, preset);
  const topConflicts = product.sourceCard.claim_conflicts.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/18 backdrop-blur-[1px]"
      />

      <aside className="relative z-10 h-full w-full max-w-[760px] overflow-y-auto border-l border-border bg-background shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-border bg-background/96 px-6 py-5 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Card audit · explainability drawer
              </p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight">
                {product.title} ({product.code})
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-xl px-3 py-1 text-sm">
                  {product.marketBadge}
                </Badge>
                <Badge variant="secondary" className="rounded-xl px-3 py-1 text-sm">
                  {product.buyerClusterBadge}
                </Badge>
                {product.subsidyStateBadge ? (
                  <Badge variant="outline" className="rounded-xl px-3 py-1 text-sm">
                    {product.subsidyStateBadge}
                  </Badge>
                ) : null}
                <span className={cn("inline-flex rounded-xl px-3 py-1 text-sm font-semibold", scoreTone(product.scores.founderRank))}>
                  Founder {formatScore(product.scores.founderRank)}
                </span>
              </div>
              <p className="mt-4 text-lg leading-7 text-muted-foreground">{product.shortSummary}</p>
            </div>

            <Button variant="outline" size="icon" onClick={onClose} aria-label="Close drawer">
              <X />
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={onPrevious} disabled={!onPrevious}>
              Previous
            </Button>
            <Button variant="outline" onClick={onNext} disabled={!onNext}>
              Next
            </Button>
            <span className="text-sm text-muted-foreground">
              Current lens: {getPresetLabel(preset)}
            </span>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          <section className="rounded-[28px] border border-border bg-card p-5">
            <h3 className="text-2xl font-semibold">{reasoning.title}</h3>
            <ul className="mt-4 space-y-2 text-base leading-7 text-muted-foreground">
              {reasoning.bullets.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
            <div className="rounded-[28px] border border-border bg-card p-5">
              <h3 className="text-2xl font-semibold">Why it sits here</h3>
              <div className="mt-5 space-y-4">
                {COMPOSITE_METRICS.map((metric) => (
                  <MetricRow
                    key={metric.key}
                    label={metric.label}
                    description={metric.description}
                    value={product.scores[metric.key]}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <section className="rounded-[28px] border border-border bg-card p-5">
                <h3 className="text-2xl font-semibold">Raw load factors</h3>
                <div className="mt-4 space-y-3">
                  {RAW_LOAD_FACTORS.map((item) => (
                    <RawRow
                      key={item.key}
                      label={item.label}
                      value={product.rawFactors[item.key]}
                      scale={item.scale}
                    />
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-border bg-card p-5">
                <h3 className="text-2xl font-semibold">Data quality</h3>
                <div className="mt-4 space-y-3 text-base">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Source coverage</span>
                    <span className="font-semibold">{Math.round(product.qualitySignals.sourceCoverage * 100)}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Avg field confidence</span>
                    <span className="font-semibold">{Math.round(product.qualitySignals.avgFieldConfidence * 100)}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Unverified claims</span>
                    <span className="font-semibold">{product.qualitySignals.unverifiedClaimsCount}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">High conflicts</span>
                    <span className="font-semibold">{product.qualitySignals.highConflictCount}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Medium conflicts</span>
                    <span className="font-semibold">{product.qualitySignals.mediumConflictCount}</span>
                  </div>
                </div>
              </section>
            </div>
          </section>

          <section className="rounded-[28px] border border-border bg-card p-5">
            <h3 className="text-2xl font-semibold">Dependencies</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.dependencyLabels.map((item: string) => (
                <Badge key={item} variant="secondary" className="rounded-xl px-3 py-1 text-sm">
                  {item}
                </Badge>
              ))}
              {product.dependencyLabels.length === 0 ? (
                <p className="text-muted-foreground">No dependency labels in current card.</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-[28px] border border-border bg-card p-5">
            <h3 className="text-2xl font-semibold">Route and delivery context</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <DetailCard
                label="Market bucket"
                value={product.marketBadge}
                hint="Primary portfolio geography used for grouping and filtering."
              />
              <DetailCard
                label="Primary route"
                value={product.primaryRouteCountry ?? "Mixed / not singular"}
                hint="Route-level geography stays in detail view so it does not pollute the primary market badge."
              />
              <DetailCard
                label="Delivery language"
                value={product.deliveryLanguage ?? "Unknown"}
                hint="Best-effort route language extracted from the product framing."
              />
              <DetailCard
                label="Regulatory context"
                value={product.regulatoryContextLabel ?? "Unregulated or unclear"}
              />
              <DetailCard
                label="Scope variance"
                value={product.scopeVarianceRisk}
                hint="Current-scope delivery variance only."
              />
              <DetailCard
                label="Expansion variance"
                value={product.expansionVarianceRisk}
                hint="Likely variance when the same concept expands to adjacent markets or segments."
              />
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium">Proof stack</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.proofStack.map((item) => (
                  <Badge key={item} variant="outline" className="rounded-xl px-3 py-1 text-sm">
                    {item}
                  </Badge>
                ))}
                {product.proofStack.length === 0 ? (
                  <p className="text-muted-foreground">No proof stack values in current card.</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-border bg-card p-5">
            <h3 className="text-2xl font-semibold">Buyer structure</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <DetailCard
                label="Primary buyer"
                value={product.sourceCard.buyer_analysis.primary_buyer_type.value}
                hint={product.sourceCard.buyer_analysis.primary_buyer_type.reason}
              />
              <DetailCard
                label="Budget owner"
                value={product.sourceCard.buyer_analysis.budget_owner.value}
                hint={product.sourceCard.buyer_analysis.budget_owner.reason}
              />
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium">Secondary buyer types</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sourceCard.buyer_analysis.secondary_buyer_types.map((item) => (
                  <Badge key={`${item.value}-${item.reason}`} variant="secondary" className="rounded-xl px-3 py-1 text-sm">
                    {item.value}
                  </Badge>
                ))}
                {product.sourceCard.buyer_analysis.secondary_buyer_types.length === 0 ? (
                  <p className="text-muted-foreground">No secondary buyers recorded.</p>
                ) : null}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium">Buyer influencers</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sourceCard.buyer_analysis.buyer_influencers.map((item) => (
                  <Badge key={`${item.value}-${item.reason}`} variant="outline" className="rounded-xl px-3 py-1 text-sm">
                    {item.value}
                  </Badge>
                ))}
                {product.sourceCard.buyer_analysis.buyer_influencers.length === 0 ? (
                  <p className="text-muted-foreground">No influencer roles recorded.</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-border bg-card p-5">
            <h3 className="text-2xl font-semibold">Top conflicts</h3>
            <div className="mt-4 space-y-4">
              {topConflicts.length > 0 ? (
                topConflicts.map((conflict: FounderRowRecord["sourceCard"]["claim_conflicts"][number]) => (
                  <article key={`${conflict.claim_area}-${conflict.claim_text}`} className="rounded-2xl border border-border bg-background px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold">{conflict.claim_area}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{conflict.claim_text}</p>
                      </div>
                      <span className={cn("inline-flex rounded-xl px-3 py-1 text-sm font-semibold", severityTone(conflict.severity))}>
                        {conflict.severity}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{conflict.what_is_wrong}</p>
                  </article>
                ))
              ) : (
                <p className="text-muted-foreground">No structured claim conflicts recorded for this card.</p>
              )}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
