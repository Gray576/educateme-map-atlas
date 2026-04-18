# Dashboard Integration Contract

This document defines what the future dashboard should ingest from the new research pipeline.

## Current integration constraints in the repo

The existing app ingests `ResearchCard` JSON through:

- `buildResearchDataset()`
- `loadResearchCards()`
- `validateResearchCard()`
- `normalizeResearchCard()`
- `scoreProducts()`

Important repo constraint:

- `src/data/research/cards` is card-only.
  Every `.json` file in that folder is parsed as a card.

Therefore:

- keep sidecar artifacts outside `src/data/research/cards`
- keep manifests, ledgers, and review files in a different directory

## Proposed artifact package per product

Suggested directory:

`research-runs/<run_id>/<product_code>/`

Required artifacts:

- `research-brief.md`
- `source-ledger.jsonl`
- `quote-ledger.jsonl`
- `claim-ledger.json`
- `contradiction-log.json`
- `field-decisions.json`
- `high-confidence-card.json`
- `dashboard-ingestion.json`
- `manual-review.md`
- `post-step-audit.md`

Suggested batch-level artifacts:

- `research-runs/<run_id>/dataset-manifest.json`
- `research-runs/<run_id>/run-summary.md`

## Separation of concerns

### 1. Evidence-first source card

Purpose:

- canonical research object
- source-backed truth only

Must not include:

- heuristic badges
- dashboard ranks
- freehand confidence percentages
- UI-only convenience labels

### 2. Dashboard ingestion payload

Purpose:

- narrow, safe projection for the dashboard
- contains only fields allowed by the field policy

### 3. Manual review artifact

Purpose:

- explain why a card or field is blocked or downgraded

## Ingestion rules

1. Only `high-confidence-card.json` should ever be transformed into dashboard data.
2. `dashboard-ingestion.json` must be fully derivable from the evidence-first artifacts.
3. Any mismatch between:
   - claim ledger
   - field decision log
   - dashboard payload
   is a hard failure.
4. No field may appear in `dashboard-ingestion.json` without:
   - source refs
   - claim refs
   - confidence band
   - last verified timestamp

## Required manifest fields

Batch manifest should include:

- `schema_version`
- `run_id`
- `generated_at`
- `product_codes`
- `file_map`
- `checksums`
- `pipeline_version`
- `prompt_version`
- `benchmark_snapshot` if available

## Release gates

Block a product from dashboard ingestion if any of these are true:

- schema validation failed
- dangling `source_id`
- high-risk claim lacks required source tier
- unresolved T1 contradiction
- required quote evidence missing
- field marked `blocked`
- stale run timestamp

## Migration advice for this repo

### Short-term safe path

- keep existing `src/data/research/cards` untouched
- create the new artifacts under `docs/research-v2/templates` for design
- when implementation starts, create a new runtime path outside the legacy cards folder

### Medium-term safe path

- introduce `ResearchCardV2`
- write a strict schema validator
- add a dedicated loader for v2 artifacts
- move manual overlays like archetype and operator matrix into explicit sidecars or into a separate, well-scoped enrichment layer

### Risks to avoid

- dropping extra JSON files into `src/data/research/cards`
- mixing legacy `EnrichedProduct` and `ResearchCard` models
- localizing or renaming filter enums without a migration plan
- keeping static code-side joins as hidden second truth

## Recommended next implementation step

Do not rewrite the dashboard first.

First implement:

1. schema
2. validators
3. artifact writers
4. one-product pilot
5. three-product pilot
6. field adoption benchmark

Only after that should the dashboard consume the new payload.
