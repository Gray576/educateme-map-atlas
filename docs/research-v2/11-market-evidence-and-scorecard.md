# Market Evidence And Scorecard

This document describes how SEMrush-derived market evidence is collected, interpreted, and converted into product-level scoring.

Use this as the authoritative reference for:

- what counts as local Luxembourg evidence
- what counts as cross-border Luxembourg-intent evidence
- what counts as adjacent or reference evidence
- how keyword and domain captures become product scores

## Why this layer exists

The core `research-v2` system is evidence-first and claim-first.
That layer answers:

- what is true
- what is blocked
- what is safe to show

The market-evidence layer answers a different question:

- where do we see observable search and competitor signals that are relevant enough to affect product priority?

This layer must stay separate from:

- the quote/claim truth layer
- the dashboard-safe factual card

It is a decision-support layer, not a truth layer.

## Evidence scope classes

Every SEMrush signal must be classified into one of these buckets.

### 1. `local`

Definition:

- captured in `db=LU`

Interpretation:

- strongest evidence for Luxembourg product prioritization
- may include mixed-language queries inside the `LU` database
- still counts as local Luxembourg demand

Examples:

- `sproochentest`
- `cours de luxembourgeois`
- `formation continue luxembourg`

### 2. `cross_border_luxembourg_intent`

Definition:

- captured in `db=FR` or `db=DE`
- but the query itself clearly targets Luxembourg

Allowed markers:

- `luxembourg`
- `luxembourgeois`
- `luxembourgish`
- `letzebuergesch`
- `lëtzebuergesch`
- `sproochentest`

Interpretation:

- can support Luxembourg cards
- useful because cross-border workers may search from France or Germany for Luxembourg-related outcomes
- weaker than `local`, but still materially relevant

Examples:

- `cours de luxembourgeois`
- `learn luxembourgish online`
- `mifid training luxembourg`

### 3. `adjacent_generic`

Definition:

- captured in `db=FR` or `db=DE`
- query does not clearly target Luxembourg

Interpretation:

- useful for message mining, keyword expansion, and category benchmarking
- does **not** count as local Luxembourg proof

Examples:

- `ai training`
- `french course`
- `compliance training`

### 4. `reference`

Definition:

- captured in `db=US`, `db=UK`, or similar reference markets

Interpretation:

- useful for category depth, SERP shape, CPC patterns, and large-universe exam keywords
- does **not** count as Luxembourg proof

Examples:

- `oet preparation`
- `oet sample test`

### 5. `not_required`

Definition:

- products where no meaningful search market layer is required yet
- examples: licensing, partner motions, pipeline offers that depend more on direct sales than search

Interpretation:

- absence of search evidence is not by itself disqualifying
- but those products should not be silently boosted by unrelated keyword data

## Product-to-market mapping

Product routing is defined in:

- [product-market-mapping.json](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/config/product-market-mapping.json)

That file defines for each product:

- `market_track`
  - `local`
  - `adjacent`
  - `reference`
  - `none`
- `lane_group`
- `lane_keys`
- `anchor_focus`

This is the bridge between:

- product cards
- LU keyword corpus
- cross-border/reference collection packs

## Raw collection outputs

### Extension captures

Chrome extension source:

- [tools/semrush-dom-capture-extension](/Users/sergey/Desktop/educateme-map/tools/semrush-dom-capture-extension)

Raw captures are downloaded into:

- [tools](/Users/sergey/Desktop/educateme-map/tools)

### Normalized corpus

Raw captures are normalized into:

- [semrush-corpus](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus)

Important subfolders:

- `by-domain/<db>/<domain>/reports`
- `by-keyword/<db>/<keyword>/reports`
- `country-keywords/<db>/`
- `config/`
- `product-scorecard/`

Storage rules are documented in:

- [10-semrush-corpus-storage.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/10-semrush-corpus-storage.md)

## Current derived artifacts

### LU country keyword layer

- [all-domain-keywords.json](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/country-keywords/lu/all-domain-keywords.json)
- [all-domain-keywords.csv](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/country-keywords/lu/all-domain-keywords.csv)
- [lu-shortlist.json](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/country-keywords/lu/lu-shortlist.json)
- [keyword-opportunities.json](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/country-keywords/lu/keyword-opportunities.json)

These files answer:

- what LU keywords recur across multiple domains
- what keyword families deserve deeper work
- what SERP domains dominate important local lanes

### Multi-geo seed packs

- [multigeo-keyword-pack.json](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/config/multigeo-keyword-pack.json)
- [multigeo-keyword-pack.md](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/config/multigeo-keyword-pack.md)

Generated seeds:

- [keyword-overview-seeds__fr__luxembourg-intent.json](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/config/keyword-overview-seeds__fr__luxembourg-intent.json)
- [keyword-overview-seeds__de__luxembourg-intent.json](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/config/keyword-overview-seeds__de__luxembourg-intent.json)
- [keyword-overview-seeds__us.json](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/config/keyword-overview-seeds__us.json)

Important:

- `FR/DE` seeds are filtered to Luxembourg-intent queries only
- `US` seeds remain reference-market seeds

### Product scorecard

- [product-market-scorecard.v1.json](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/product-scorecard/product-market-scorecard.v1.json)
- [product-market-scorecard.v1.csv](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/product-scorecard/product-market-scorecard.v1.csv)
- [product-market-scorecard.v1.md](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/product-scorecard/product-market-scorecard.v1.md)

This scorecard is not a launch ranking.
It is a market-evidence ranking with explicit scope controls.

## Writeback to product cards

The scorecard is a derived artifact.
The canonical per-product source of truth must still live in the product card folder.

Use:

- [apply-product-market-scorecard-to-cards.mjs](/Users/sergey/Desktop/educateme-map/scripts/apply-product-market-scorecard-to-cards.mjs)

This sync writes the latest SEMrush-backed market evidence back into:

- `commercial-validation.json`
- `dashboard-ingestion.json`

What it adds:

- `market_evidence_scope_class`
- `market_evidence`
- compact per-product summaries for:
  - top follow-up keywords
  - top market questions
  - operator segment weighting
  - cross-border Luxembourg-intent keywords
- analyst-only dashboard summaries for:
  - market evidence
  - SEMrush anchor evidence
  - next research step

Rule:

- `semrush-corpus` remains the raw/derived evidence layer
- product card artifacts remain the canonical layer consumed by the frontend and future research passes

## How scoring currently works

The script:

- [build-product-market-scorecard.mjs](/Users/sergey/Desktop/educateme-map/scripts/build-product-market-scorecard.mjs)

builds product scores from:

1. `commercial-validation-overview.csv`
2. product-level `commercial-validation.json`
3. product-market mapping
4. normalized keyword-overview captures
5. LU lane signals

It computes:

- `validation_velocity_composite`
- `demand_pull_composite`
- `demand_pull_composite_adjusted`
- `evidence_scope_class`
- `scope_fit`
- `evidence_multiplier`
- `operator_segment_weighted_score_1_5`
- `operator_segment_score_adjustment`
- `provisional_market_score_v1`

### Scope-fit rule

For `local` products:

- `local` evidence = fit
- `cross_border_luxembourg_intent` = fit
- `adjacent_generic` = mismatch
- `reference` = mismatch

For `adjacent` products:

- `adjacent_generic` = fit
- everything else = mismatch or missing

For `reference` products:

- `reference` = fit
- everything else = mismatch or missing

For `none` products:

- `not_required`

### Why this matters

Without this rule:

- LU demand can artificially raise non-Luxembourg products
- DE/FR generic category demand can falsely look like Luxembourg proof
- US exam demand can leak into local market prioritization

## Operational workflow

### Local Luxembourg pass

1. Capture LU domains.
2. Normalize captures.
3. Build LU country keyword table.
4. Build LU shortlist.
5. Capture LU keyword-overview for shortlist anchors.
6. Build LU opportunities.
7. Recompute product scorecard.

### Cross-border Luxembourg-intent pass

Only after the LU layer is stable.

1. Use `FR` and `DE` seed files with Luxembourg-intent queries.
2. Capture keyword-overview.
3. Normalize captures.
4. Recompute scorecard.
5. Local products may improve if FR/DE queries still clearly target Luxembourg.

### Reference pass

Use only for products whose market track is `reference`.

Example:

- OET products

## Current limitations

1. `CPC`, `competitive density`, and paid layers are still incomplete in many captures.
2. `Domain Overview` extraction is weaker than `Organic Positions` and `Keyword Overview`.
3. Some products still have market-track mappings that are only first-pass heuristics.
4. This scorecard is intentionally conservative; it should under-claim rather than over-claim.
5. Independent-operator evidence is segment-aware:
   - `B2C` gives higher weight to fragmented operators and community-led acquisition
   - `B2B` discounts social-only residue and favors direct specialist offers
   - the applied effect is bounded, so operator evidence cannot overpower missing keyword demand on its own

## Commands

Build LU keyword opportunities:

```bash
npm run research:v2:build-semrush-keyword-opportunities
```

Build multi-geo seed packs:

```bash
npm run research:v2:build-semrush-multigeo-pack
```

Build the current product market scorecard:

```bash
npm run research:v2:build-product-market-scorecard
```

## Do not forget

- `db=LU` is not the same thing as English-only Luxembourg demand
- `db=FR/DE` is not automatically irrelevant to Luxembourg
- but `db=FR/DE` only counts for Luxembourg cards when the query itself still points at Luxembourg
- generic foreign category demand is useful context, not local proof
