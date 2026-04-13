import Link from "next/link";

import { buildResearchDataset } from "@/data/research";
import { buildCalibrationReport } from "@/lib/research-calibration";

export const dynamic = "force-static";

function formatScore(value: number) {
  return value.toFixed(1);
}

function buildFounderHref(code: string, preset = "founder") {
  const params = new URLSearchParams({ selected: code });

  if (preset !== "founder") {
    params.set("preset", preset);
  }

  return `/?${params.toString()}`;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[0_16px_40px_-36px_rgba(15,23,42,0.28)]">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default async function CalibrationPage() {
  const products = await buildResearchDataset();
  const report = buildCalibrationReport(products);

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] text-foreground">
            EducateMe
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Internal calibration · ranking sanity check</p>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
            Quick view over the full card dataset to check whether the scoring layer is behaving
            credibly before we call this ready for wider internal use.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold"
          >
            Open founder view
          </Link>
          <Link
            href="/research"
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold"
          >
            Dataset debug
          </Link>
        </div>
      </div>

      <section className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Products</p>
          <p className="mt-1.5 text-2xl font-semibold">{report.stats.productCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Avg founder</p>
          <p className="mt-1.5 text-2xl font-semibold">{formatScore(report.stats.avgFounder)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Avg evidence</p>
          <p className="mt-1.5 text-2xl font-semibold">{formatScore(report.stats.avgEvidence)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Avg conflicts</p>
          <p className="mt-1.5 text-2xl font-semibold">{formatScore(report.stats.avgConflictCount)}</p>
        </div>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        <Section title="Top founder ranking" description="Best current ship-now candidates under the composite founder lens.">
          <div className="space-y-3">
            {report.topFounder.map((product, index) => (
              <div key={product.code} className="rounded-2xl border border-border bg-background px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">{index + 1}. {product.code} {product.title}</p>
                    <Link
                      href={buildFounderHref(product.code)}
                      className="mt-2 inline-flex text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
                    >
                      Open in founder view
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">{product.marketBadge} · {product.buyerClusterBadge}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Founder</p>
                    <p className="text-xl font-semibold">{formatScore(product.scores.founderRank)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Bottom founder ranking" description="Cards that the current model treats as heaviest or hardest to ship.">
          <div className="space-y-3">
            {report.bottomFounder.map((product, index) => (
              <div key={product.code} className="rounded-2xl border border-border bg-background px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">{index + 1}. {product.code} {product.title}</p>
                    <Link
                      href={buildFounderHref(product.code)}
                      className="mt-2 inline-flex text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
                    >
                      Open in founder view
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      claims auth {product.rawFactors.authorityForClaims}/4 · proof {product.rawFactors.proofBurden}/4 · conflicts {product.qualitySignals.conflictCount}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Founder</p>
                    <p className="text-xl font-semibold">{formatScore(product.scores.founderRank)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-3">
        <Section title="Heaviest delivery load" description="High route friction, dependencies or within-scope variance.">
          <div className="space-y-3">
            {report.heaviestDelivery.map(({ product, load }) => (
              <div key={product.code} className="rounded-2xl border border-border bg-background px-4 py-4">
                <p className="text-lg font-semibold">{product.code} {product.title}</p>
                <Link
                  href={buildFounderHref(product.code, "delivery")}
                  className="mt-2 inline-flex text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
                >
                  Open in delivery lens
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  load {load} · delivery auth {product.rawFactors.authorityForDelivery}/4 · deps {product.rawFactors.dependencyCount}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Heaviest claims load" description="Strong legal claim surface, claim authority burden or multiple conflicts.">
          <div className="space-y-3">
            {report.heaviestClaims.map(({ product, load }) => (
              <div key={product.code} className="rounded-2xl border border-border bg-background px-4 py-4">
                <p className="text-lg font-semibold">{product.code} {product.title}</p>
                <Link
                  href={buildFounderHref(product.code, "claims")}
                  className="mt-2 inline-flex text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
                >
                  Open in claims lens
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  load {load} · legal {product.rawFactors.legalClaimSeverity}/4 · claims auth {product.rawFactors.authorityForClaims}/4 · conflicts {product.qualitySignals.conflictCount}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Heaviest proof load" description="Products that ask the market to believe a longer or regulated proof path.">
          <div className="space-y-3">
            {report.heaviestProof.map(({ product, load }) => (
              <div key={product.code} className="rounded-2xl border border-border bg-background px-4 py-4">
                <p className="text-lg font-semibold">{product.code} {product.title}</p>
                <Link
                  href={buildFounderHref(product.code)}
                  className="mt-2 inline-flex text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
                >
                  Open in founder view
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  load {load} · proof burden {product.rawFactors.proofBurden}/4 · stack {product.proofStack.length}
                </p>
              </div>
            ))}
          </div>
        </Section>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        <Section title="Watchlist anomalies" description="Cards worth manually checking because the current score shape and raw burdens pull in different directions.">
          <div className="space-y-3">
            {report.watchlist.map(({ product, flags }) => (
              <div key={product.code} className="rounded-2xl border border-border bg-background px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">{product.code} {product.title}</p>
                    <Link
                      href={buildFounderHref(product.code)}
                      className="mt-2 inline-flex text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
                    >
                      Open in founder view
                    </Link>
                    <ul className="mt-3 space-y-1 text-sm leading-6 text-muted-foreground">
                      {flags.map((flag) => (
                        <li key={flag}>• {flag}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Founder</p>
                    <p className="text-xl font-semibold">{formatScore(product.scores.founderRank)}</p>
                  </div>
                </div>
              </div>
            ))}
            {report.watchlist.length === 0 ? (
              <p className="text-muted-foreground">No obvious watchlist anomalies in the current scoring run.</p>
            ) : null}
          </div>
        </Section>

        <Section title="Strong evidence, weaker founder rank" description="Cards worth re-checking if they have decent signal but are dragged down by route complexity.">
          <div className="space-y-3">
            {report.recoveryCandidates.map(({ product, delta }) => (
              <div key={product.code} className="rounded-2xl border border-border bg-background px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">{product.code} {product.title}</p>
                    <Link
                      href={buildFounderHref(product.code, "evidence")}
                      className="mt-2 inline-flex text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
                    >
                      Open in evidence lens
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      evidence {formatScore(product.scores.evidenceConfidence)} · buyer clarity {formatScore(product.scores.buyerClarity)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Recovery delta</p>
                    <p className="text-xl font-semibold">{formatScore(delta)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        <Section title="Strongest evidence" description="Cards with the cleanest current evidence base regardless of founder rank.">
          <div className="space-y-3">
            {report.strongestEvidence.map((product) => (
              <div key={product.code} className="rounded-2xl border border-border bg-background px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">{product.code} {product.title}</p>
                    <Link
                      href={buildFounderHref(product.code, "evidence")}
                      className="mt-2 inline-flex text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
                    >
                      Open in evidence lens
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      sources {Math.round(product.qualitySignals.sourceCoverage * 100)}% · avg field conf {Math.round(product.qualitySignals.avgFieldConfidence * 100)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Evidence</p>
                    <p className="text-xl font-semibold">{formatScore(product.scores.evidenceConfidence)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-3">
        <Section title="Market distribution">
          <div className="space-y-3">
            {report.marketDistribution.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Buyer distribution">
          <div className="space-y-3">
            {report.buyerDistribution.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Conflict distribution">
          <div className="space-y-3">
            {report.conflictDistribution.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </Section>
      </section>
    </main>
  );
}
