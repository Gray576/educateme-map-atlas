# Commercial Validation Summary - 2026-04-18-all-24

## What is filled now

- quadrant segment
- validation model and binary pass/kill signal
- estimated cost and time to signal
- testability score
- time-to-first-euro score
- retention structure score
- regulatory friction inverse score
- keyword buckets for later SEMrush collection
- screenshot-backed demand evidence where it was strong enough to justify scoring
- screenshot-backed CAC/channel-fit notes where direct or adjacent search evidence exists
- multilingual lane interpretation where the new screenshots changed the market read
- database-aware interpretation, separating `db=LU` local evidence from `db=FR/DE/US` adjacent evidence

## What is still intentionally blank or partial

- SEMrush export metrics (volume, CPC, competitive density)
- willingness to pay score
- macro trajectory score
- founder-independence score
- paid competitor layer

## Screenshot enrichment passes

- Products with partial screenshot-backed demand layer: 14
- Demand confidence medium: 6
- Demand confidence low: 18

Reference docs:
- [semrush-screenshot-review.md](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-screenshot-review.md)
- [market-lanes-memo.md](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/market-lanes-memo.md)

The strongest additions are now split across two layers:

- screenshot-backed category and competitor evidence
- lane discovery: official route, community / integration, adult education / discovery, French local institutional, compliance buyer-language, and German exam / Pflege

## Reasoning policy

These updates were applied only to `commercial_validation`.

They do **not** override the higher-integrity verified layer. That means:

- `dashboard-ingestion.json` safe fields stay evidence-first and citation-backed
- screenshot evidence is used for market pull, keyword design, competitor watchlists, and channel-fit notes
- fields stay blank where the screenshots still do not justify a defensible score

## Aggregate

- Products written: 24
- Output CSV: /Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/commercial-validation-overview.csv

## Notes

- `commercial-validation.json` remains the source artifact under each product folder.
- `commercial-validation-overview.csv` now reflects both screenshot enrichment passes.
- The next high-value step is lane-targeted collection, not more random screenshots.
