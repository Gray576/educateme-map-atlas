import { formatCurrency, formatScore, getScoreForPreset } from "@/lib/decision";
import type { EnrichedProduct, Preset } from "@/types";

interface StatsPanelProps {
  products: EnrichedProduct[];
  preset: Preset;
  total: number;
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

export function StatsPanel({ products, preset, total }: StatsPanelProps) {
  const topProduct = [...products].sort(
    (a, b) => getScoreForPreset(b, preset) - getScoreForPreset(a, preset)
  )[0];
  const urgent = products.filter((product) => product.halfLifeCountdownMonths < 18).length;
  const blocked = products.filter((product) => !product.dependenciesResolved).length;
  const venturePositive = products.filter((product) => product.delta > 0.2).length;
  const universal = products.filter((product) => Math.abs(product.delta) <= 0.2).length;

  return (
    <aside className="sticky top-6 space-y-4 rounded-[28px] border border-border bg-card p-4 shadow-sm">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Decision snapshot
        </p>
        <p className="mt-2 text-3xl font-semibold">{products.length}</p>
        <p className="text-sm text-muted-foreground">in view out of {total} total products</p>
      </div>

      <Metric
        label="Urgent"
        value={String(urgent)}
        hint="Half-life below 18 months"
      />
      <Metric
        label="Blocked"
        value={String(blocked)}
        hint="Waiting on dependencies"
      />
      <Metric
        label="Venture-only"
        value={String(venturePositive)}
        hint="Positive delta against cashflow"
      />
      <Metric
        label="Universal winners"
        value={String(universal)}
        hint="Delta roughly near zero"
      />

      {topProduct && (
        <div className="rounded-3xl border border-border bg-background p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Top in preset
          </p>
          <p className="mt-2 text-lg font-semibold">{topProduct.title}</p>
          <p className="text-sm text-muted-foreground">{topProduct.shortCode}</p>

          <div className="mt-4 grid gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-lg font-semibold">
                {formatScore(getScoreForPreset(topProduct, preset))}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Y1 contribution</p>
              <p className="text-lg font-semibold">
                {formatCurrency(topProduct.y1Contribution)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next action</p>
              <p className="text-sm leading-6">{topProduct.nextAction}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
