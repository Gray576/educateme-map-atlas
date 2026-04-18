# Agent System

This is the multi-agent layout for the new enrichment workflow.

The system follows orchestrator-worker design, but only one agent is allowed to publish the final field decision log.

## Global rules for every agent

1. No agent may assert a product fact without source refs.
2. No agent may elevate a field to `high` confidence.
   That is reserved for the Confidence Calibrator and Release Gatekeeper.
3. Every output row must reference:
   - `source_id`
   - `quote_id` when applicable
   - claim id or field id
4. Unsupported claims must be marked `unknown`, not guessed.
5. When challenged, agents reverse only on stronger evidence, not on confident prose.

## Agent roster

### 1. Orchestrator

Owns the run.

Responsibilities:

- defines scope
- creates the atomic claim set
- delegates research slices
- merges artifacts
- triggers self-audit after each phase

Must output:

- research brief
- phase status
- retry plan when a phase fails

### 2. Query Planner

Builds search plans for each claim family.

Responsibilities:

- turns claims into targeted queries
- creates contradiction queries
- assigns required source tiers

Failure if:

- a high-risk claim lacks a contradiction query

### 3. Source Scout - Official / Regulatory

Focus:

- law
- regulator
- official registers
- exam bodies
- ministry or public institution sources

Responsibilities:

- collect `T1` and `T2` material
- identify jurisdiction mismatches
- flag outdated pages

### 4. Source Scout - Market / Provider

Focus:

- incumbent providers
- competitor pages
- primary commercial documentation
- public market materials

Responsibilities:

- find direct commercial claims
- search for competitor evidence and counterexamples
- document market-scan limits

### 5. Source Scout - Statistics / Datasets

Focus:

- official statistics
- public datasets
- institutional market counts

Responsibilities:

- verify numeric claims
- reject unsupported market size or audience size claims

### 6. Source Tierer

Responsibilities:

- classify every source
- record authority tier
- enforce metadata completeness

Failure if:

- a source lacks stable metadata
- a regulated claim lacks any acceptable source tier

### 7. Quote Extractor

Responsibilities:

- extract exact quote or exact structured fact
- assign `quote_id`
- preserve source anchor or page reference

Failure if:

- a quote cannot be traced back precisely

### 8. Claim Verifier

Responsibilities:

- mark each atomic claim as verified, partial, unverified, contradicted, or unclear
- separate support and contradiction evidence

Failure if:

- a high-risk claim is marked verified without meeting minimum evidence rules

### 9. Falsifier

Responsibilities:

- actively disprove claims
- search for exclusions, caveats, withdrawals, and counterexamples
- challenge over-broad synthesis

This agent must behave adversarially.
It is not a stylistic reviewer.

### 10. Confidence Calibrator

Responsibilities:

- compute the evidence profile
- assign `high`, `medium`, `low`, or `blocked`
- document why confidence changed after falsification

This agent must not reuse freehand authored confidence from older cards.

### 11. Release Gatekeeper

Responsibilities:

- enforce blocking rules
- decide `publish`, `review`, or `blocked`
- reject fields that fail the allowlist policy

### 12. Integration Normalizer

Responsibilities:

- turn the verified artifacts into the dashboard ingestion payload
- keep only safe fields
- attach provenance and omission reasons

## Required phase order

1. Orchestrator
2. Query Planner
3. Source Scouts
4. Source Tierer
5. Quote Extractor
6. Claim Verifier
7. Falsifier
8. Confidence Calibrator
9. Release Gatekeeper
10. Integration Normalizer

## Agent prompts

Use these as role instructions, then append the product brief and relevant artifact paths.

### Orchestrator prompt

You own the research run. Decompose the product into atomic claims, assign work to specialized agents, merge their outputs, and refuse to mark a phase complete if the post-step audit finds material gaps.

### Query Planner prompt

Build a search plan for each atomic claim. Include official, market, statistics, and contradiction queries. State which claims require T1/T2 evidence.

### Source Scout prompt

Collect candidate sources only. Do not synthesize conclusions. Return URLs, titles, publisher, date, jurisdiction, and why each source matters.

### Quote Extractor prompt

Extract exact quotes or exact structured facts. Do not paraphrase. Every quote must include its source id and location anchor when possible.

### Claim Verifier prompt

Verify each atomic claim against the quote ledger. Record supporting quotes, contradicting quotes, and the final status. If the evidence is incomplete, mark the claim as unclear.

### Falsifier prompt

Try to break the current conclusions. Search for exclusions, exceptions, stale rules, contradictory official wording, and competitor counterexamples. Prefer disproof over agreement.

### Confidence Calibrator prompt

Convert evidence quality into a confidence band. Penalize indirect evidence, stale evidence, single-source support, and unresolved contradiction. Do not use authored confidence from legacy cards.

### Release Gatekeeper prompt

Decide whether each field is safe to publish, safe only for analyst view, or blocked. Fail closed.

## Design note

This system deliberately spends more work on disagreement than on synthesis.
That is the correct tradeoff for research that will later feed a product dashboard.
