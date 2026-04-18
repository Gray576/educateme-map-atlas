# Current System Audit

This is the hard audit of the current research-card system already in the repo.

## Executive verdict

The current system is useful as a structured analyst notebook.
It is not strong enough to act as a high-confidence research pipeline for dashboard-facing truth.

The main failure mode is not lack of fields. It is false certainty:

- raw evidence and analyst judgment are mixed in the same card
- many confidence values are authored, not derived
- validation is shallow
- contradiction handling is descriptive, not blocking
- dashboard scoring uses synthetic inputs that are only lightly audited

## Actual repo metrics

Measured directly from the 24 JSON cards in `src/data/research/cards`:

- 24 cards
- 194 sources total
- 116 externally checkable claims
- 52 verified claims
- 22 partially verified claims
- 23 unverified claims
- 19 contradicted claims
- 93 internal unverified claims
- 56 claim conflicts
- 31 high-severity conflicts
- 22 medium-severity conflicts
- average authored field confidence: `0.824`
- 16/24 cards contain at least one contradicted externally checkable claim
- 10/24 cards contain at least one unverified externally checkable claim
- 24/24 cards contain internal unverified claims
- 24/24 cards contain claim conflicts
- 22/24 cards contain at least one high-severity conflict
- among 116 externally checkable claims:
  - 15 have zero source ids
  - 41 have exactly one source id
  - 60 have two or more source ids
  - only 22 are both `verified` and backed by two or more sources
  - 30 are marked `verified` with only one source id

Additional schema/provenance issues found in the current cards:

- 38 enum mismatches across 14/24 cards
- 4 dangling `source_id` references
- 18 `risk_map` entries with empty `source_ids`
- duplicated and inconsistent computed values inside `quality_signals`

## Hard critique

### What the current system did not do well enough

- It treated many inferred judgments as if they were stable evidence.
- It stored confidence numbers without a strict, reproducible rubric.
- It let cards pass with schema drift and broken enum values.
- It allowed claims with zero source ids to coexist beside verified claims.
- It used contradictions as inputs to scoring, but not as release blockers.
- It relied on heuristics for market, buyer cluster, and delivery language.
- It kept code-side overlays (`archetypes`, `operator_matrix`) as second sources of truth.

### What it missed

- quote-level evidence
- source freshness rules
- source-id referential integrity
- mandatory authority requirements by claim type
- explicit falsification search
- release gates tied to contradiction thresholds
- benchmarked calibration against outcomes or expert labels

### What it got wrong structurally

- It over-compressed the research process into one JSON object.
- It mixed three layers that should be separate:
  - source-backed evidence
  - derived analyst judgment
  - dashboard projections and scores

## Confidence calibration

**Confidence: 78% -> 86% -- corrected upward because the audit used final code inspection plus real dataset statistics, so the protocol's "-50% code not reread" and "-55% real data not checked" penalties do not apply.**

That confidence applies to the audit of the current system, not to the current cards.

## Core-check

### Artifact quality verdict

The current artifacts do not meet the quality bar for a "high-confidence enrichment system."

There is a clear gap between expected and actual behavior:

- expected:
  evidence-first, falsifiable, release-gated, confidence-calibrated
- actual:
  structured but partially synthetic, permissive validation, non-blocking contradictions

## Real results that matter

These are the concrete signals that make the gap undeniable:

- fewer than half of externally checkable claims are verified: `52 / 116`
- more than half of cards contain contradicted public-facing claims: `16 / 24`
- every card still contains unresolved internal claims: `24 / 24`
- high authored confidence coexists with widespread contradictions and unresolved questions
- the current validator does not enforce nested shape, enum correctness, or source-id integrity

## What will be unclear to a user or team if the current system stays as-is

- which fields are raw facts vs analyst interpretation
- whether "confidence" means evidence quality or just author certainty
- whether a dashboard score is safe to act on or just directionally useful
- whether a contradiction should block launch or merely lower a score
- whether a displayed buyer or subsidy label is source-backed or heuristic

## Decision

Do not keep extending the current card format as a single truth object.

Replace it with:

1. an evidence-first source card
2. a separate verification layer
3. a separate dashboard ingestion projection
