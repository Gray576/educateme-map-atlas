"use client";

import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InfoHint } from "@/components/ui/info-hint";
import {
  COMPOSITE_METRICS,
  getPresetLabel,
  RAW_LOAD_FACTORS,
} from "@/lib/research-metadata";
import { buildDrawerReasoning, type FounderRowRecord } from "@/lib/research-view";
import { cn } from "@/lib/utils";
import type { DataFieldEntry, PresetKey } from "@/types";

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
    <div className="grid grid-cols-[minmax(0,1fr)_96px] items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs font-medium">
        <span>{label}</span>
        <InfoHint label={label} description={description} widthClassName="w-48" />
      </div>
      <div className="flex justify-end">
        <span className={cn("inline-flex min-w-16 justify-center rounded-md px-2 py-1 text-xs font-semibold", scoreTone(value))}>
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
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
      <span className="text-xs font-medium">{label}</span>
      <span className="text-xs font-semibold text-muted-foreground">
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
    <div className="rounded-xl border border-border bg-background px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-sm font-semibold">{value}</p>
      {hint ? <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const FIELD_GUIDE: Record<
  string,
  {
    label: string;
    description: string;
  }
> = {
  jurisdiction_scope: {
    label: "География и юрисдикция",
    description: "Где именно действует продукт или route. Важно, потому что регуляторика и go-to-market обычно ломаются именно на границе юрисдикций. Использовать как ограничение на copy, pricing и rollout.",
  },
  verified_requirements: {
    label: "Подтвержденные требования",
    description: "Какие официальные требования реально подтверждены источниками. Это основа для безопасного promise и product scope.",
  },
  approval_entities: {
    label: "Органы / сущности одобрения",
    description: "Кто именно контролирует, аккредитует или влияет на допустимость route. Нужно, чтобы не продавать то, что зависит от чужого approval без доказательства.",
  },
  regulatory_framework: {
    label: "Регуляторная рамка",
    description: "Какие законы, circulars, exam rules или guidelines определяют поле. Важно для claim safety и sequencing.",
  },
  verified_competitors: {
    label: "Подтвержденные конкуренты",
    description: "Не гипотеза о рынке, а реально найденные игроки. Использовать для понимания category reality, не как доказательство спроса само по себе.",
  },
  target_audience_summary: {
    label: "Сводка по аудитории",
    description: "Кому именно адресован продукт по surviving evidence. Это полезно для buyer framing, но часто остается analyst-only, если сформулировано как сводка, а не как прямой официальный факт.",
  },
  subsidy_eligibility: {
    label: "Субсидии / eligibility",
    description: "Можно ли опираться на субсидию или co-funding. Важно для economics и sales promise; если поле conflicted, его нельзя использовать в продающем copy.",
  },
  training_support_route: {
    label: "Маршрут внешней поддержки обучения",
    description: "Есть ли официальный или публичный route, через который продукт может быть supported, reimbursed или accepted. Полезно для GTM и price framing.",
  },
  hard_blockers: {
    label: "Жесткие блокеры",
    description: "Что прямо сейчас не дает безопасно поднять продукт в более высокий release status. Это не просто риск, а список ограничителей следующего шага.",
  },
  regulatory_context: {
    label: "Регуляторный контекст",
    description: "Краткая подтвержденная формулировка того, как regulatory context влияет на продукт. Использовать для scope и для понимания friction.",
  },
  cross_country_regulatory_context: {
    label: "Кросс-страновой регуляторный контекст",
    description: "Что меняется между странами. Важно для понимания, переносима ли гипотеза вообще.",
  },
};

function getFieldGuide(entry: DataFieldEntry) {
  return (
    FIELD_GUIDE[entry.key] ?? {
      label: entry.label,
      description:
        "Поле собрано в рамках research-v2. Смотри на цвет, confidence band и количество source/claim refs, чтобы понять, можно ли использовать это поле в дашборде, только как analyst note или оно требует ручного добора.",
    }
  );
}

function fieldStatusTone(status: DataFieldEntry["status"]) {
  if (status === "verified") return "border-emerald-200 bg-emerald-50/80";
  if (status === "analyst") return "border-sky-200 bg-sky-50/80";
  return "border-orange-200 bg-orange-50/90";
}

function fieldStatusLabel(status: DataFieldEntry["status"]) {
  if (status === "verified") return "Проверено";
  if (status === "analyst") return "Аналитическое";
  return "Собрать вручную";
}

function confidenceLabel(value: DataFieldEntry["confidenceBand"]) {
  if (value === "high") return "Высокая";
  if (value === "medium") return "Средняя";
  if (value === "low") return "Низкая";
  if (value === "blocked") return "Заблокировано";
  return "Неизвестно";
}

function confidenceTone(value: DataFieldEntry["confidenceBand"]) {
  if (value === "high") return "bg-emerald-100 text-emerald-800";
  if (value === "medium") return "bg-amber-100 text-amber-800";
  if (value === "low" || value === "blocked") return "bg-rose-100 text-rose-800";
  return "bg-muted text-muted-foreground";
}

function LegendChip({
  title,
  description,
  tone,
}: {
  title: string;
  description: string;
  tone: string;
}) {
  return (
    <div className={cn("rounded-xl border px-3 py-3", tone)}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-foreground/80">{description}</p>
    </div>
  );
}

function FieldEntryCard({ entry }: { entry: DataFieldEntry }) {
  const guide = getFieldGuide(entry);

  return (
    <article className={cn("rounded-xl border px-3 py-3", fieldStatusTone(entry.status))}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{guide.label}</p>
            <InfoHint
              label={guide.label}
              description={guide.description}
              widthClassName="w-72"
              side="right"
            />
          </div>
          <p className="mt-1.5 break-words text-sm font-semibold">{entry.value}</p>
        </div>
        <Badge variant="outline" className="rounded-lg px-2 py-1 text-[10px]">
          {fieldStatusLabel(entry.status)}
        </Badge>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className={cn("inline-flex rounded-lg px-2 py-1 text-[10px] font-semibold", confidenceTone(entry.confidenceBand))}>
          {confidenceLabel(entry.confidenceBand)}
        </span>
        <Badge variant="secondary" className="rounded-lg px-2 py-1 text-[10px]">
          claims {entry.claimRefCount}
        </Badge>
        <Badge variant="secondary" className="rounded-lg px-2 py-1 text-[10px]">
          sources {entry.sourceRefCount}
        </Badge>
      </div>

      {entry.omissionReason ? (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {entry.status === "manual" ? "Почему не прошло:" : "Почему не выведено в основной слой:"} {entry.omissionReason}
        </p>
      ) : null}
    </article>
  );
}

function FieldGroup({
  title,
  description,
  entries,
}: {
  title: string;
  description: string;
  entries: DataFieldEntry[];
}) {
  return (
    <section className="rounded-md border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[10px]">
          {entries.length}
        </Badge>
      </div>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      <div className="mt-3 space-y-2.5">
        {entries.length > 0 ? (
          entries.map((entry) => <FieldEntryCard key={`${entry.status}-${entry.key}`} entry={entry} />)
        ) : (
          <p className="text-xs text-muted-foreground">В этой группе сейчас нет полей.</p>
        )}
      </div>
    </section>
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

      <aside className="relative z-10 h-full w-full max-w-[560px] overflow-y-auto border-l border-border bg-background shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-border bg-background/96 px-3 py-3 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Card audit · explainability drawer
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">
                {product.title} ({product.code})
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="rounded-lg px-2.5 py-1 text-xs">
                  {product.releaseStatus}
                </Badge>
                <Badge variant="outline" className="rounded-lg px-2.5 py-1 text-xs">
                  {product.quadrantSegment}
                </Badge>
                <Badge variant="secondary" className="rounded-lg px-2.5 py-1 text-xs">
                  {product.marketBadge}
                </Badge>
                <Badge variant="secondary" className="rounded-lg px-2.5 py-1 text-xs">
                  {product.buyerClusterBadge}
                </Badge>
                <Badge variant="secondary" className="rounded-lg px-2.5 py-1 text-xs">
                  safe {product.safeFieldCount}
                </Badge>
                <Badge variant="secondary" className="rounded-lg px-2.5 py-1 text-xs">
                  blocked {product.blockedFieldCount}
                </Badge>
                {product.subsidyStateBadge ? (
                  <Badge variant="outline" className="rounded-lg px-2.5 py-1 text-xs">
                    {product.subsidyStateBadge}
                  </Badge>
                ) : null}
                <span className={cn("inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold", scoreTone(product.scores.founderRank))}>
                  Founder {formatScore(product.scores.founderRank)}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{product.shortSummary}</p>
            </div>

            <Button variant="outline" size="icon" onClick={onClose} aria-label="Close drawer">
              <X />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="outline" className="h-7 rounded-md px-2.5 text-xs" onClick={onPrevious} disabled={!onPrevious}>
              Previous
            </Button>
            <Button variant="outline" className="h-7 rounded-md px-2.5 text-xs" onClick={onNext} disabled={!onNext}>
              Next
            </Button>
            <span className="text-xs text-muted-foreground">
              Current lens: {getPresetLabel(preset)}
            </span>
          </div>
        </div>

        <div className="space-y-3 px-3 py-3">
          <section className="rounded-md border border-border bg-card p-3">
            <h3 className="text-sm font-semibold">{reasoning.title}</h3>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-muted-foreground">
              {reasoning.bullets.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-md border border-border bg-card p-3">
            <h3 className="text-sm font-semibold">V2 release layer</h3>
            <div className="mt-2 grid gap-2.5 md:grid-cols-2">
              <DetailCard
                label="Release status"
                value={product.releaseStatus}
                hint="Fail-closed release gate from the v2 research run."
              />
              <DetailCard
                label="Segment"
                value={product.quadrantSegment}
                hint="Commercial validation segment used for experiment design and quadrant placement."
              />
              <DetailCard
                label="Validation model"
                value={product.validationModel ?? "Not yet specified"}
              />
              <DetailCard
                label="Validation velocity"
                value={
                  product.validationVelocityScore !== null
                    ? `${product.validationVelocityScore}/5`
                    : "Not yet scored"
                }
              />
              <DetailCard
                label="Time to first €"
                value={
                  product.timeToFirstEuroScore !== null
                    ? `${product.timeToFirstEuroScore}/5`
                    : "Not yet scored"
                }
              />
              <DetailCard
                label="Regulatory friction (inverse)"
                value={
                  product.regulatoryFrictionInverseScore !== null
                    ? `${product.regulatoryFrictionInverseScore}/5`
                    : "Not yet scored"
                }
              />
              <DetailCard
                label="Overall confidence"
                value={product.overallConfidenceBand}
              />
              <DetailCard
                label="Safe vs blocked"
                value={`${product.safeFieldCount} safe / ${product.blockedFieldCount} blocked`}
              />
            </div>
          </section>

          <section className="rounded-md border border-border bg-card p-3">
            <h3 className="text-sm font-semibold">Легенда доверия</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Карточка теперь делится на три слоя: что подтверждено и безопасно для решений, что пока остается аналитическим,
              и что еще требует ручного добора или внешнего подтверждения.
            </p>
            <div className="mt-3 grid gap-2.5">
              <LegendChip
                title="Светло-зеленый: проверено"
                description="Поле прошло в dashboard-safe слой. Его можно использовать в решениях, copy и приоритизации, но все равно смотреть на конкретный source context."
                tone="border-emerald-200 bg-emerald-50/80"
              />
              <LegendChip
                title="Светло-голубой: аналитическое"
                description="Поле полезно для мышления и сегментации, но это уже сжатая аналитическая формулировка, а не чистый публичный факт. Использовать как рабочую гипотезу, не как жесткое обещание."
                tone="border-sky-200 bg-sky-50/80"
              />
              <LegendChip
                title="Светло-оранжевый: собрать вручную"
                description="Поле не прошло release gate или требует внешнего добора. Его нельзя использовать как подтвержденное. Это очередь на ручную валидацию."
                tone="border-orange-200 bg-orange-50/90"
              />
            </div>
          </section>

          <FieldGroup
            title="Проверенные собранные данные"
            description="Это поля, которые survived fact-checking и попали в безопасный слой для дашборда."
            entries={product.safeFieldEntries}
          />

          <FieldGroup
            title="Аналитические поля"
            description="Это собранные данные, которые полезны для понимания рынка и route, но пока оставлены как analyst-only."
            entries={product.analystFieldEntries}
          />

          <FieldGroup
            title="Поля для ручного добора"
            description="Это поля, которые не прошли release gate и требуют ручной проверки, route-owner input или дополнительных источников."
            entries={product.blockedFieldEntries}
          />

          <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_190px]">
            <div className="rounded-md border border-border bg-card p-3">
              <h3 className="text-sm font-semibold">Why it sits here</h3>
              <div className="mt-3 space-y-2.5">
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

            <div className="space-y-3">
              <section className="rounded-md border border-border bg-card p-3">
                <h3 className="text-sm font-semibold">Raw load factors</h3>
                <div className="mt-2 space-y-2">
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

              <section className="rounded-md border border-border bg-card p-3">
                <h3 className="text-sm font-semibold">Data quality</h3>
                <div className="mt-2 space-y-2 text-xs">
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

          <section className="rounded-md border border-border bg-card p-3">
            <h3 className="text-sm font-semibold">Operator matrix row</h3>
            <div className="mt-2 grid gap-2.5 md:grid-cols-2">
              <DetailCard
                label="Matrix market"
                value={product.operatorMatrix.market}
              />
              <DetailCard
                label="Matrix stage"
                value={product.operatorMatrix.stage}
              />
              <DetailCard
                label="Matrix archetype"
                value={product.operatorMatrix.archetype}
              />
              <DetailCard
                label="Operator difficulty"
                value={product.operatorMatrix.operatorDifficulty}
              />
              <DetailCard
                label="Time to signal"
                value={product.operatorMatrix.timeToSignal}
              />
              <DetailCard
                label="First-launch fit"
                value={product.operatorMatrix.firstLaunchFit}
              />
            </div>
            <div className="mt-3 rounded-xl border border-border bg-background px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Why</p>
              <p className="mt-1.5 text-xs leading-5 text-foreground">{product.operatorMatrix.rationale}</p>
            </div>
          </section>

          <section className="rounded-md border border-border bg-card p-3">
            <h3 className="text-sm font-semibold">Dependencies</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.dependencyLabels.map((item: string) => (
                <Badge key={item} variant="secondary" className="rounded-lg px-2.5 py-1 text-xs">
                  {item}
                </Badge>
              ))}
              {product.dependencyLabels.length === 0 ? (
                <p className="text-muted-foreground">No dependency labels in current card.</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-md border border-border bg-card p-3">
            <h3 className="text-sm font-semibold">Route and delivery context</h3>
            <div className="mt-2 grid gap-2.5 md:grid-cols-2">
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

            <div className="mt-3">
              <p className="text-xs font-medium">Proof stack</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {product.proofStack.map((item) => (
                  <Badge key={item} variant="outline" className="rounded-lg px-2.5 py-1 text-xs">
                    {item}
                  </Badge>
                ))}
                {product.proofStack.length === 0 ? (
                  <p className="text-muted-foreground">No proof stack values in current card.</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-md border border-border bg-card p-3">
            <h3 className="text-sm font-semibold">Buyer structure</h3>
            <div className="mt-2 grid gap-2.5 md:grid-cols-2">
              <DetailCard
                label="Current promise"
                value={product.sourceCard.product_summary.claimed_outcome}
                hint="Current promise after the v2 rerun removed unsafe or unverified framing."
              />
              <DetailCard
                label="Core pain"
                value={product.sourceCard.product_summary.core_pain}
                hint="Problem framing that survived the current fact-checked pass."
              />
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

            <div className="mt-3">
              <p className="text-xs font-medium">Secondary buyer types</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {product.sourceCard.buyer_analysis.secondary_buyer_types.map((item) => (
                  <Badge key={`${item.value}-${item.reason}`} variant="secondary" className="rounded-lg px-2.5 py-1 text-xs">
                    {item.value}
                  </Badge>
                ))}
                {product.sourceCard.buyer_analysis.secondary_buyer_types.length === 0 ? (
                  <p className="text-muted-foreground">No secondary buyers recorded.</p>
                ) : null}
              </div>
            </div>

            <div className="mt-3">
              <p className="text-xs font-medium">Buyer influencers</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {product.sourceCard.buyer_analysis.buyer_influencers.map((item) => (
                  <Badge key={`${item.value}-${item.reason}`} variant="outline" className="rounded-lg px-2.5 py-1 text-xs">
                    {item.value}
                  </Badge>
                ))}
                {product.sourceCard.buyer_analysis.buyer_influencers.length === 0 ? (
                  <p className="text-muted-foreground">No influencer roles recorded.</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-md border border-border bg-card p-3">
            <h3 className="text-sm font-semibold">Top conflicts</h3>
            <div className="mt-2 space-y-2.5">
              {topConflicts.length > 0 ? (
                topConflicts.map((conflict: FounderRowRecord["sourceCard"]["claim_conflicts"][number]) => (
                  <article key={`${conflict.claim_area}-${conflict.claim_text}`} className="rounded-md border border-border bg-background px-3 py-2.5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{conflict.claim_area}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{conflict.claim_text}</p>
                      </div>
                      <span className={cn("inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold", severityTone(conflict.severity))}>
                        {conflict.severity}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{conflict.what_is_wrong}</p>
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
