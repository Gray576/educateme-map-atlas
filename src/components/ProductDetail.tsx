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
        "rounded-xl border border-border bg-card px-3 py-2",
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

function DetailCard({
  title,
  description,
  children,
  compact = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card px-3 py-2.5", compact && "px-3 py-2")}>
      <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        <span>{title}</span>
        {description ? <InfoHint label={title} description={description} /> : null}
      </p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export function ProductDetail({ product, preset }: ProductDetailProps) {
  const breakdown = confidenceBreakdown(product, preset);

  return (
    <div className="border-t border-border bg-muted/10 px-4 py-3">
      <div className="grid gap-3 xl:grid-cols-[1.6fr_0.95fr]">
        <div className="space-y-3">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
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

          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <DetailCard
              title="Half-life countdown"
              description="Operational countdown for expiring mandates or short-lived tailwinds. Creates urgency to decide now."
              compact
            >
              <p className="text-sm font-semibold text-foreground">{product.urgencyLabel}</p>
              <p className="text-[11px] text-muted-foreground">
                {product.deadline ? `Deadline ${product.deadline}` : "Using strategic half-life"}
              </p>
            </DetailCard>
            <DetailCard
              title="Cost to launch"
              description="Cash required before the first paying customer. Separate from manual effort."
              compact
            >
              <p className="text-sm font-semibold text-foreground">{formatCurrency(product.costToLaunch)}</p>
              <p className="text-[11px] text-muted-foreground">Before first paying customer</p>
            </DetailCard>
            <DetailCard
              title="Dependencies"
              description="Upstream products or capabilities that must be in place first."
              compact
            >
              <p className="text-sm font-semibold text-foreground">
                {product.dependencies.length > 0 ? product.dependencies.join(", ") : "None"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {product.dependenciesResolved ? "Ready to move" : "Blocked until dependencies clear"}
              </p>
            </DetailCard>
            <DetailCard
              title="Cannibalization"
              description="Mutually exclusive or overlapping SKUs that can cannibalize the same buyer if launched together."
              compact
            >
              <p className="text-sm font-semibold text-foreground">
                {product.cannibalizationCluster ?? "Independent"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {product.cannibalizationCluster
                  ? "Do not launch this cluster all at once"
                  : "No active conflict flagged"}
              </p>
            </DetailCard>
          </div>

          <div className="grid gap-2 lg:grid-cols-2">
            <DetailCard
              title="Bottleneck"
              description="The minimum axis score. This is the fastest way to see what blocks progress."
            >
              <p className="text-sm font-semibold text-foreground">
                {product.bottleneck.label} {product.bottleneck.value}
              </p>
              <p className="mt-1.5 text-[12px] leading-5 text-muted-foreground">{product.nextAction}</p>
            </DetailCard>
            <DetailCard
              title="Confidence breakdown"
              description="Confidence is a weight, not a separate decision axis. Raw score is multiplied by confidence to get the final score."
            >
              <div className="grid gap-2 md:grid-cols-3">
                <div>
                  <p className="text-[11px] text-muted-foreground">Raw score</p>
                  <p className="text-sm font-semibold text-foreground">{formatScore(breakdown.raw)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Confidence</p>
                  <p className="text-sm font-semibold text-foreground">{Math.round(product.confidence)}%</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Adjusted</p>
                  <p className="text-sm font-semibold text-foreground">{formatScore(breakdown.adjusted)}</p>
                </div>
              </div>
            </DetailCard>
          </div>
        </div>

        <div className="space-y-2">
          <DetailCard
            title="Next action"
            description="One atomic action that should raise the current bottleneck."
          >
            <p className="text-sm font-semibold leading-5 text-foreground">{product.nextAction}</p>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              This is the smallest move likely to lift the current bottleneck.
            </p>
          </DetailCard>

          <DetailCard title="Target audience">
            <p className="text-[12px] leading-5 text-foreground">{product.details.targetAudience}</p>
          </DetailCard>

          <DetailCard title="JTBD">
            <blockquote className="border-l-2 border-border pl-3 text-[12px] italic leading-5 text-muted-foreground">
              {product.details.jtbd}
            </blockquote>
          </DetailCard>

          <DetailCard title="Deliverables">
            <p className="text-[12px] leading-5 text-muted-foreground">{product.details.deliverables}</p>
          </DetailCard>

          <DetailCard title="Upsell path">
            <p className="text-[12px] leading-5 text-muted-foreground">{product.upsell}</p>
          </DetailCard>
        </div>
      </div>
    </div>
  );
}
