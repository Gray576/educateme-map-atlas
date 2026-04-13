import {
  confidenceBreakdown,
  formatCurrency,
  formatScore,
  getAxisLabel,
} from "@/lib/decision";
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
  value,
  suffix = "",
  accent = false,
}: {
  label: string;
  value: number;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-background px-3 py-3",
        accent && "border-primary/30 bg-primary/5"
      )}
    >
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">
        {value}
        {suffix}
      </p>
    </div>
  );
}

export function ProductDetail({ product, preset }: ProductDetailProps) {
  const breakdown = confidenceBreakdown(product, preset);

  return (
    <div className="space-y-5 border-t border-border px-5 py-5">
      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {PRIMARY_AXES.map((axis) => (
              <AxisCard
                key={axis}
                label={getAxisLabel(axis)}
                value={product.axes[axis]}
                suffix={axis === "timeToShip" ? "w" : axis === "halfLife" ? " mo" : ""}
                accent={axis === "timeToShip" || axis === "painMandate"}
              />
            ))}
            {EXPAND_AXES.map((axis) => (
              <AxisCard
                key={axis}
                label={getAxisLabel(axis)}
                value={product.axes[axis]}
                suffix={axis === "grossMargin" ? "%" : ""}
              />
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border bg-background px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Half-life countdown
              </p>
              <p className="mt-1 text-lg font-semibold">{product.urgencyLabel}</p>
              <p className="text-sm text-muted-foreground">
                {product.deadline ? `Deadline ${product.deadline}` : "Using strategic half-life"}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Cost to launch
              </p>
              <p className="mt-1 text-lg font-semibold">{formatCurrency(product.costToLaunch)}</p>
              <p className="text-sm text-muted-foreground">Before first paying customer</p>
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Dependencies
              </p>
              <p className="mt-1 text-lg font-semibold">
                {product.dependencies.length > 0 ? product.dependencies.join(", ") : "None"}
              </p>
              <p className="text-sm text-muted-foreground">
                {product.dependenciesResolved ? "Ready to move" : "Blocked until dependencies clear"}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Cannibalization
              </p>
              <p className="mt-1 text-lg font-semibold">
                {product.cannibalizationCluster ?? "Independent"}
              </p>
              <p className="text-sm text-muted-foreground">
                {product.cannibalizationCluster
                  ? "Do not launch this cluster all at once"
                  : "No active conflict flagged"}
              </p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-3xl border border-border bg-background p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Bottleneck
              </p>
              <p className="mt-2 text-xl font-semibold">
                {product.bottleneck.label} {product.bottleneck.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{product.nextAction}</p>
            </div>
            <div className="rounded-3xl border border-border bg-background p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Confidence breakdown
              </p>
              <div className="mt-2 grid gap-2 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Raw score</p>
                  <p className="text-lg font-semibold">{formatScore(breakdown.raw)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="text-lg font-semibold">{Math.round(product.confidence)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adjusted</p>
                  <p className="text-lg font-semibold">{formatScore(breakdown.adjusted)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-background p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Next action
            </p>
            <p className="mt-2 text-base font-semibold">{product.nextAction}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              This is the smallest move likely to lift the current bottleneck.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-background p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Target audience
            </p>
            <p className="mt-2 text-sm leading-6">{product.details.targetAudience}</p>
          </div>

          <div className="rounded-3xl border border-border bg-background p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">JTBD</p>
            <blockquote className="mt-2 border-l-2 border-primary pl-4 text-sm italic leading-6 text-muted-foreground">
              {product.details.jtbd}
            </blockquote>
          </div>

          <div className="rounded-3xl border border-border bg-background p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Deliverables
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {product.details.deliverables}
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-background p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Upsell path
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{product.upsell}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
