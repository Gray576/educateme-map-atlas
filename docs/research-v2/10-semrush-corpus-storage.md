# SEMrush Corpus Storage

This document defines how raw SEMrush captures become reusable research assets.

The goal is not one giant export blob. The goal is a split corpus that can be reused:

- by product
- by keyword
- by competitor domain
- by new niche hypothesis

## Storage principle

Keep two layers:

1. `raw capture`
   The direct page artifact exported from the browser extension.
2. `normalized corpus`
   Structured page summaries and indices split by:
   - domain
   - keyword
   - report type
   - database

## Current output root

`/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus`

## Folder layout

```text
semrush-corpus/
  by-domain/
    lu/
      educateme.lu/
        reports/
          domain-overview__<timestamp>.json
          organic-positions__<timestamp>.json
  by-keyword/
    lu/
      sproochentest/
        reports/
          keyword-overview__<timestamp>.json
  by-page/
    <db>/
      <slug>/
        reports/
          <report-type>__<timestamp>.json
  index/
    domains.json
    keywords.json
    reports.json
```

## Why split it this way

This gives two retrieval directions:

- `product-first`
  Pull only the domains and keywords relevant to one of the 24 products.
- `market-first`
  Pull the same data when exploring a new niche or adjacent lane.

## Canonical unit

The canonical unit is still one captured page:

- one keyword overview page
- one domain overview page
- one organic positions page

But each page is stored under the entity it belongs to.

That means:

- `educateme.lu` reports stay under `by-domain/lu/educateme.lu`
- `sproochentest` reports stay under `by-keyword/lu/sproochentest`

## Report contents

Each normalized report keeps:

- `meta`
- `summary`
- `structured`
- `segments`
- `entities`

Where:

- `meta` = provenance
- `summary` = top-line values
- `structured` = report-type-specific extraction
- `segments` = capture diagnostics
- `entities` = discovered domains, urls, keywords

## Command

Normalize raw captures:

```bash
npm run research:v2:normalize-semrush-capture -- /absolute/path/to/capture.json
```

Or multiple at once:

```bash
npm run research:v2:normalize-semrush-capture -- /absolute/path/to/folder
```

## Product usage

When enriching a product card:

1. identify relevant local keywords
2. identify relevant competitor or infrastructure domains
3. read only those files from `by-keyword` and `by-domain`
4. copy only proven signals into `commercial_validation` or notes

This keeps the SEMrush layer composable rather than locked to one product.

## Niche-country rollup

On top of `by-domain` and `by-keyword`, keep an optional niche rollup file for fast review.

Example use case:

- one `LU` file for the `luxembourgish-route` niche
- one `DE` file for the `pflege-german-exam` niche

Command:

```bash
npm run research:v2:build-semrush-niche-rollup -- \
  --db lu \
  --name luxembourgish-route \
  --domain educateme.lu \
  --keyword sproochentest
```

This writes:

```text
semrush-corpus/niches/lu/luxembourgish-route.json
```

The rollup keeps:

- `marketSignals`
- `aggregatedKeywords`
- `competitorWatchlist`
- `topPages`

This is the quick-read file for one country + one niche.
