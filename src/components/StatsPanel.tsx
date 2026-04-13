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
    <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
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
    <section className="rounded-[24px] border border-border/70 bg-card/85 p-3 shadow-[0_10px_28px_-24px_rgba(14,37,33,0.32)] backdrop-blur">
      <div className="grid gap-3 lg:grid-cols-[220px_repeat(4,minmax(0,1fr))_minmax(280px,1.2fr)]">
        <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Decision snapshot
          </p>
          <p className="mt-1 text-2xl font-semibold">{products.length}</p>
          <p className="text-[11px] text-muted-foreground">in view out of {total} products</p>
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
          <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  Top in preset
                </p>
                <p className="mt-1 text-base font-semibold">{topProduct.title}</p>
                <p className="text-[11px] text-muted-foreground">{topProduct.shortCode}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground">Score</p>
                <p className="text-lg font-semibold">
                  {formatScore(getScoreForPreset(topProduct, preset))}
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-start">
              <div>
                <p className="text-[11px] text-muted-foreground">Y1 contribution</p>
                <p className="text-sm font-semibold">
                  {formatCurrency(topProduct.y1Contribution)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Next action</p>
                <p className="text-[12px] leading-5">{topProduct.nextAction}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
