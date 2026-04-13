import {
  confidenceBreakdown,
  formatCurrency,
  formatScore,
  getAxisLabel,
} from "@/lib/decision";
import type { ReactNode } from "react";
import { InfoHint } from "@/components/ui/info-hint";
import { cn } from "@/lib/utils";
import type { EnrichedProduct, Preset } from "@/types";

interface ProductDetailProps {
  product: EnrichedProduct;
  preset: Preset;
}

const PRIMARY_AXES: (keyof EnrichedProduct["axes"])[] = [
  "timeToShip",
  "studioLeverage",
  "distribution",
  "tamCeiling",
  "painMandate",
  "halfLife",
];

const EXPAND_AXES: (keyof EnrichedProduct["axes"])[] = [
  "teamFit",
  "manualEffort",
  "wedge",
  "grossMargin",
  "cacLtv",
  "moatBuild",
];

function AxisCard({
  label,
  description,
  value,
  suffix = "",
  accent = false,
}: {
  label: string;
  description: string;
  value: number;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-[148px] rounded-xl border border-border bg-card px-3 py-2",
        accent && "border-primary/20 bg-blue-50/40"
      )}
    >
      <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        <span>{label}</span>
        <InfoHint label={label} description={description} />
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">
        {value}
        {suffix}
      </p>
    </div>
  );
}

function SectionShell({
  title,
  subtitle,
  tone,
  children,
}: {
  title: string;
  subtitle: string;
  tone: "source" | "derived";
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border px-3 py-3",
        tone === "source" && "border-stone-200 bg-stone-50/35",
        tone === "derived" && "border-slate-200 bg-slate-50/45"
      )}
    >
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {title}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function PairList({
  items,
}: {
  items: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <div className="grid gap-1.5">
      {items.map((item) => (
        <div
          key={item.label}
          className="grid gap-1 border-b border-border/60 pb-1.5 last:border-b-0 last:pb-0 md:grid-cols-[136px_minmax(0,1fr)]"
        >
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {item.label}
          </div>
          <div className="text-[12px] leading-5 text-foreground">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export function ProductDetail({ product, preset }: ProductDetailProps) {
  const breakdown = confidenceBreakdown(product, preset);

  return (
    <div className="border-t border-border bg-muted/10 px-4 py-3">
      <div className="space-y-3">
        <SectionShell
          title="Decision axes"
          subtitle="Synthetic scoring layer. Horizontal on purpose to save height."
          tone="derived"
        >
          <div className="-mx-1 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2 px-1">
              {PRIMARY_AXES.map((axis) => (
                <AxisCard
                  key={axis}
                  label={getAxisLabel(axis)}
                  description={
                    axis === "timeToShip"
                      ? "Weeks to first paying customer. This is the sortable replacement for the old readiness badge."
                      : axis === "studioLeverage"
                      ? "How much this product reuses existing studio assets, curriculum, audience, or delivery machinery."
                      : axis === "distribution"
                      ? "Whether there is already a reliable channel to reach the buyer."
                      : axis === "tamCeiling"
                      ? "Annual revenue ceiling if this SKU works."
                      : axis === "painMandate"
                      ? "How hard the buyer is pushed by pain, regulation, or market pressure."
                      : "How many months remain before the mandate or tailwind collapses."
                  }
                  value={product.axes[axis]}
                  suffix={axis === "timeToShip" ? "w" : axis === "halfLife" ? " mo" : ""}
                  accent={axis === "timeToShip" || axis === "painMandate"}
                />
              ))}
              {EXPAND_AXES.map((axis) => (
                <AxisCard
                  key={axis}
                  label={getAxisLabel(axis)}
                  description={
                    axis === "teamFit"
                      ? "How well the current team can credibly build and deliver this."
                      : axis === "manualEffort"
                      ? "Delivery scalability. Higher means less painful manual work."
                      : axis === "wedge"
                      ? "Whether this SKU opens larger follow-on opportunities."
                      : axis === "grossMargin"
                      ? "Gross margin percentage used to convert Y1 revenue into Y1 contribution."
                      : axis === "cacLtv"
                      ? "Attractiveness of acquisition cost relative to lifetime value."
                      : "Ability of this SKU to build a moat rather than just win one sale."
                  }
                  value={product.axes[axis]}
                  suffix={axis === "grossMargin" ? "%" : ""}
                />
              ))}
            </div>
          </div>
        </SectionShell>

        <div className="grid gap-3 xl:grid-cols-[1.05fr_1.1fr]">
          <SectionShell
            title="Decision layer"
            subtitle="Synthesized fields and operational guidance added on top of the raw catalog."
            tone="derived"
          >
            <PairList
              items={[
                {
                  label: "Bottleneck",
                  value: `${product.bottleneck.label} ${product.bottleneck.value}`,
                },
                {
                  label: "Next action",
                  value: product.nextAction,
                },
                {
                  label: "Half-life countdown",
                  value: product.deadline
                    ? `${product.urgencyLabel} · Deadline ${product.deadline}`
                    : product.urgencyLabel,
                },
                {
                  label: "Cost to launch",
                  value: formatCurrency(product.costToLaunch),
                },
                {
                  label: "Dependencies",
                  value:
                    product.dependencies.length > 0
                      ? `${product.dependencies.join(", ")} · ${
                          product.dependenciesResolved ? "ready to move" : "blocked"
                        }`
                      : "None",
                },
                {
                  label: "Cannibalization",
                  value: product.cannibalizationCluster ?? "Independent",
                },
                {
                  label: "Confidence",
                  value: `Raw ${formatScore(breakdown.raw)} · ${Math.round(
                    product.confidence
                  )}% confidence · Adjusted ${formatScore(breakdown.adjusted)}`,
                },
              ]}
            />
          </SectionShell>

          <SectionShell
            title="Source data"
            subtitle="Original descriptive fields carried from the JSON catalog."
            tone="source"
          >
            <PairList
              items={[
                {
                  label: "Target audience",
                  value: product.details.targetAudience,
                },
                {
                  label: "JTBD",
                  value: <span className="italic text-muted-foreground">{product.details.jtbd}</span>,
                },
                {
                  label: "Deliverables",
                  value: product.details.deliverables,
                },
                {
                  label: "Upsell path",
                  value: product.upsell,
                },
              ]}
            />
          </SectionShell>
        </div>
      </div>
    </div>
  );
}
