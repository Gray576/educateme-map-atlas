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

const AXIS_DETAILS: Array<{
  key: keyof EnrichedProduct["axes"];
  description: string;
  suffix?: string;
}> = [
  {
    key: "timeToShip",
    description:
      "Weeks to first paying customer. This is the sortable replacement for the old readiness badge.",
    suffix: "w",
  },
  {
    key: "studioLeverage",
    description:
      "How much this product reuses existing studio assets, curriculum, audience, or delivery machinery.",
  },
  {
    key: "distribution",
    description: "Whether there is already a reliable channel to reach the buyer.",
  },
  {
    key: "tamCeiling",
    description: "Annual revenue ceiling if this SKU works.",
  },
  {
    key: "painMandate",
    description: "How hard the buyer is pushed by pain, regulation, or market pressure.",
  },
  {
    key: "halfLife",
    description: "How many months remain before the mandate or tailwind collapses.",
    suffix: " mo",
  },
  {
    key: "teamFit",
    description: "How well the current team can credibly build and deliver this.",
  },
  {
    key: "manualEffort",
    description: "Delivery scalability. Higher means less painful manual work.",
  },
  {
    key: "wedge",
    description: "Whether this SKU opens larger follow-on opportunities.",
  },
  {
    key: "grossMargin",
    description: "Gross margin percentage used to convert Y1 revenue into Y1 contribution.",
    suffix: "%",
  },
  {
    key: "cacLtv",
    description: "Attractiveness of acquisition cost relative to lifetime value.",
  },
  {
    key: "moatBuild",
    description: "Ability of this SKU to build a moat rather than just win one sale.",
  },
];

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
  columns = 1,
}: {
  items: Array<{ label: ReactNode; value: ReactNode }>;
  columns?: 1 | 2;
}) {
  return (
    <div className={cn("grid gap-1.5", columns === 2 && "xl:grid-cols-2 xl:gap-x-4")}>
      {items.map((item, index) => (
        <div
          key={index}
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
          subtitle="Synthetic scoring layer, shown as one compact list so the layout stays stable."
          tone="derived"
        >
          <PairList
            columns={2}
            items={AXIS_DETAILS.map((axis) => ({
              label: (
                <span className="inline-flex items-center gap-1">
                  <span>{getAxisLabel(axis.key)}</span>
                  <InfoHint
                    label={getAxisLabel(axis.key)}
                    description={axis.description}
                  />
                </span>
              ) as unknown as string,
              value: `${product.axes[axis.key]}${axis.suffix ?? ""}`,
            }))}
          />
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
              columns={2}
              items={[
                {
                  label: "Discovery status",
                  value: product.discoveryStatus,
                },
                {
                  label: "Readiness detail",
                  value: product.details.readinessDetail,
                },
                {
                  label: "Target audience",
                  value: product.details.targetAudience,
                },
                {
                  label: "JTBD",
                  value: <span className="italic text-muted-foreground">{product.details.jtbd}</span>,
                },
                {
                  label: "Curriculum",
                  value: (
                    <ul className="list-disc space-y-1 pl-4 text-[12px] leading-5 text-foreground">
                      {product.details.curriculum.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ),
                },
                {
                  label: "Format",
                  value: product.details.grid.Format,
                },
                {
                  label: "Group size",
                  value: product.details.grid["Group Size"],
                },
                {
                  label: "Languages",
                  value: product.details.grid.Languages,
                },
                {
                  label: "Subsidy",
                  value: product.details.grid.Subsidy,
                },
                {
                  label: "Full price",
                  value: product.details.priceFull,
                },
                {
                  label: "Deliverables",
                  value: product.details.deliverables,
                },
                {
                  label: "Competitive",
                  value: product.details.competitive,
                },
                {
                  label: "Why it works",
                  value: product.details.whyItWorks,
                },
                {
                  label: "Tags",
                  value: product.tags.join(", "),
                },
                {
                  label: "Top-line price",
                  value: product.price,
                },
                {
                  label: "Top-line revenue",
                  value: product.revenue,
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
