import Link from "next/link";

import { buildResearchDataset } from "@/data/research";

export const dynamic = "force-static";

function formatScore(value: number) {
  return value.toFixed(1);
}

export default async function ResearchPage() {
  const products = await buildResearchDataset();
  const topFounder = [...products]
    .sort((a, b) => b.scores.founderRank - a.scores.founderRank)
    .slice(0, 10);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="space-y-2">
        <div className="inline-flex items-center rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] text-foreground">
          EducateMe
        </div>
        <p className="text-sm text-muted-foreground">Research-card dataset</p>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          This route reads the new cards from
          {" "}
          <code>/Users/sergey/Desktop/product growth/plan/cards</code>, validates them,
          normalizes the payload, and computes the first pass of founder-oriented scores without
          touching the legacy dashboard.
        </p>
        <div className="pt-2">
          <Link
            href="/calibration"
            className="inline-flex rounded-xl border border-border bg-card px-3 py-1.5 text-sm font-semibold"
          >
            Open calibration view
          </Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Cards loaded</p>
          <p className="mt-2 text-3xl font-semibold">{products.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Top market</p>
          <p className="mt-2 text-3xl font-semibold">
            {products.filter((item) => item.market === "LUX").length}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">LUX products in dataset</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Avg evidence
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {formatScore(
              products.reduce((sum, item) => sum + item.scores.evidenceConfidence, 0) /
                products.length
            )}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Avg founder score
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {formatScore(
              products.reduce((sum, item) => sum + item.scores.founderRank, 0) / products.length
            )}
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-border bg-card p-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Top founder ranking preview</h2>
          <p className="text-sm text-muted-foreground">
            Temporary debug view for the new scoring layer. Founder screen UI will replace this.
          </p>
        </div>

        <div className="space-y-3">
          {topFounder.map((product, index) => (
            <article
              key={product.code}
              className="grid gap-3 rounded-xl border border-border px-3 py-2.5 md:grid-cols-[56px_minmax(0,1.3fr)_120px_120px_120px_120px]"
            >
              <div className="text-sm font-semibold text-muted-foreground">{index + 1}</div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{product.title}</h3>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                    {product.marketBadge}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                    {product.buyerClusterBadge}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{product.shortSummary}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Founder</p>
                <p className="mt-1 text-lg font-semibold">{formatScore(product.scores.founderRank)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Delivery</p>
                <p className="mt-1 text-lg font-semibold">{formatScore(product.scores.deliveryEase)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Claims</p>
                <p className="mt-1 text-lg font-semibold">{formatScore(product.scores.claimSafety)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Evidence</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatScore(product.scores.evidenceConfidence)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
