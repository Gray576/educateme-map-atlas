import {
  confidenceBreakdown,
  formatCurrency,
  formatScore,
  getAxisLabel,
} from "@/lib/decision";
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
        "rounded-2xl border border-border/70 bg-background/80 px-3 py-2.5",
        accent && "border-primary/30 bg-primary/5"
      )}
    >
      <p className="flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>{label}</span>
        <InfoHint label={label} description={description} />
      </p>
      <p className="mt-1 text-base font-semibold">
        {value}
        {suffix}
      </p>
    </div>
  );
}

export function ProductDetail({ product, preset }: ProductDetailProps) {
  const breakdown = confidenceBreakdown(product, preset);

  return (
    <div className="space-y-4 border-t border-border/70 px-4 py-4">
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
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

          <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2.5">
              <p className="flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>Half-life countdown</span>
                <InfoHint
                  label="Half-life countdown"
                  description="Operational countdown for expiring mandates or short-lived tailwinds. Creates urgency to decide now."
                />
              </p>
              <p className="mt-1 text-base font-semibold">{product.urgencyLabel}</p>
              <p className="text-[11px] text-muted-foreground">
                {product.deadline ? `Deadline ${product.deadline}` : "Using strategic half-life"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2.5">
              <p className="flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>Cost to launch</span>
                <InfoHint
                  label="Cost to launch"
                  description="Cash required before the first paying customer. Separate from manual effort."
                />
              </p>
              <p className="mt-1 text-base font-semibold">{formatCurrency(product.costToLaunch)}</p>
              <p className="text-[11px] text-muted-foreground">Before first paying customer</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2.5">
              <p className="flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>Dependencies</span>
                <InfoHint
                  label="Dependencies"
                  description="Upstream products or capabilities that must be in place first."
                />
              </p>
              <p className="mt-1 text-base font-semibold">
                {product.dependencies.length > 0 ? product.dependencies.join(", ") : "None"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {product.dependenciesResolved ? "Ready to move" : "Blocked until dependencies clear"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2.5">
              <p className="flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>Cannibalization</span>
                <InfoHint
                  label="Cannibalization"
                  description="Mutually exclusive or overlapping SKUs that can cannibalize the same buyer if launched together."
                />
              </p>
              <p className="mt-1 text-base font-semibold">
                {product.cannibalizationCluster ?? "Independent"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {product.cannibalizationCluster
                  ? "Do not launch this cluster all at once"
                  : "No active conflict flagged"}
              </p>
            </div>
          </div>

          <div className="grid gap-2.5 lg:grid-cols-2">
            <div className="rounded-3xl border border-border/70 bg-background/80 p-3.5">
              <p className="flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>Bottleneck</span>
                <InfoHint
                  label="Bottleneck"
                  description="The minimum axis score. This is the fastest way to see what blocks progress."
                />
              </p>
              <p className="mt-2 text-lg font-semibold">
                {product.bottleneck.label} {product.bottleneck.value}
              </p>
              <p className="mt-2 text-[12px] leading-5 text-muted-foreground">{product.nextAction}</p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/80 p-3.5">
              <p className="flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>Confidence breakdown</span>
                <InfoHint
                  label="Confidence breakdown"
                  description="Confidence is a weight, not a separate decision axis. Raw score is multiplied by confidence to get the final score."
                />
              </p>
              <div className="mt-2 grid gap-2 md:grid-cols-3">
                <div>
                  <p className="text-[11px] text-muted-foreground">Raw score</p>
                  <p className="text-base font-semibold">{formatScore(breakdown.raw)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Confidence</p>
                  <p className="text-base font-semibold">{Math.round(product.confidence)}%</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Adjusted</p>
                  <p className="text-base font-semibold">{formatScore(breakdown.adjusted)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-3xl border border-border/70 bg-background/80 p-3.5">
            <p className="flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>Next action</span>
              <InfoHint
                label="Next action"
                description="One atomic action that should raise the current bottleneck."
              />
            </p>
            <p className="mt-2 text-sm font-semibold leading-5">{product.nextAction}</p>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              This is the smallest move likely to lift the current bottleneck.
            </p>
          </div>

          <div className="rounded-3xl border border-border/70 bg-background/80 p-3.5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Target audience
            </p>
            <p className="mt-2 text-[12px] leading-5">{product.details.targetAudience}</p>
          </div>

          <div className="rounded-3xl border border-border/70 bg-background/80 p-3.5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">JTBD</p>
            <blockquote className="mt-2 border-l-2 border-primary pl-3 text-[12px] italic leading-5 text-muted-foreground">
              {product.details.jtbd}
            </blockquote>
          </div>

          <div className="rounded-3xl border border-border/70 bg-background/80 p-3.5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Deliverables
            </p>
            <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
              {product.details.deliverables}
            </p>
          </div>

          <div className="rounded-3xl border border-border/70 bg-background/80 p-3.5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Upsell path
            </p>
            <p className="mt-2 text-[12px] leading-5 text-muted-foreground">{product.upsell}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
