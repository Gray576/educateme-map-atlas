# Research Enrichment v2

This folder defines the replacement for the current product-card enrichment workflow.

The goal is not "more fields." The goal is a smaller set of fields that can survive:

- multi-source retrieval
- explicit contradiction search
- quote-level grounding
- post-step self-audit
- confidence calibration
- release gating

The current repo already has a useful `ResearchCard` path, but it mixes raw evidence with analyst judgment and score-layer heuristics. This v2 package separates those concerns:

- source-of-truth stays evidence-first
- synthesis is derived from verified claims only
- dashboard output is a narrow safe projection, not the full research object

## File map

- [00-current-system-audit.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/00-current-system-audit.md)
  Hard audit of the current dataset and pipeline, with real repo metrics.
- [01-high-confidence-enrichment-algorithm.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/01-high-confidence-enrichment-algorithm.md)
  The new strict, unified, multi-agent workflow.
- [02-field-allowlist-and-confidence-policy.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/02-field-allowlist-and-confidence-policy.md)
  Which fields survive, which move to analyst-only, and which are removed from automated enrichment.
- [03-agent-system.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/03-agent-system.md)
  Agent roles, responsibilities, and anti-failure rules.
- [04-dashboard-integration-contract.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/04-dashboard-integration-contract.md)
  Artifact package, ingestion contract, migration notes, and release gates.
- [05-validation-pull-quadrant-protocol.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/05-validation-pull-quadrant-protocol.md)
  The scoring rubric, separate B2B/B2C quadrants, and SEMrush collection protocol.
- [06-external-system-audit-pack.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/06-external-system-audit-pack.md)
  Prompt pack and methodology for auditing another research system.
- [07-benchmark-harness.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/07-benchmark-harness.md)
  Fixed-task benchmark harness, response contract, and adjudication loop.
- [08-semrush-collection-playbook.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/08-semrush-collection-playbook.md)
  Exact manual collection instructions for SEMrush exports, proxy-market handling, and return format.
- [10-semrush-corpus-storage.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/10-semrush-corpus-storage.md)
  How raw SEMrush captures are normalized into a reusable by-domain / by-keyword corpus.
- [11-market-evidence-and-scorecard.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/11-market-evidence-and-scorecard.md)
  The current SEMrush evidence model, cross-border Luxembourg-intent rule, and product scorecard logic.
- [12-luxembourg-market-collection-plan.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/12-luxembourg-market-collection-plan.md)
  The Luxembourg-only collection plan: product clusters, LU anchors, and FR/DE Luxembourg-intent coverage.
- [13-germany-market-collection-plan.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/13-germany-market-collection-plan.md)
  The Germany-only collection plan: adjacent DE evidence for `B1/B2/B3` and separate DE cross-border Luxembourg-intent usage.
- [templates/post-step-self-audit-prompt.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/post-step-self-audit-prompt.md)
  The reusable self-audit prompt to run after every phase.
- [templates/high-confidence-card.template.json](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/high-confidence-card.template.json)
  Proposed evidence-first source card template.
- [templates/dashboard-ingestion.template.json](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/dashboard-ingestion.template.json)
  Narrow, safe payload for dashboard integration.
- [templates/commercial-validation.template.json](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/commercial-validation.template.json)
  Sidecar template for quadrant scoring, validation velocity, and SEMrush market observables.
- [templates/semrush-keywords.template.csv](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/semrush-keywords.template.csv)
  CSV template for per-keyword SEMrush collection.
- [templates/semrush-paid-competitors.template.csv](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/semrush-paid-competitors.template.csv)
  CSV template for paid competitor capture from Advertising Research.
- [templates/semrush-traffic-notes.template.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/semrush-traffic-notes.template.md)
  Markdown template for Traffic Analytics sanity notes.
- [templates/semrush-collection-notes.template.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/semrush-collection-notes.template.md)
  Markdown template for final market-read and proxy-database notes.
- [templates/external-system-artifact-request.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/external-system-artifact-request.md)
  Exact request pack for getting sample outputs and traces from another system.
- [templates/external-system-audit-prompts.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/external-system-audit-prompts.md)
  Copy-paste prompts for structural audit of another system.
- [templates/manual-review.template.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/manual-review.template.md)
  Reviewer-facing checklist for blocked or unclear products.

## Core decisions

1. Confidence is computed from evidence quality and consistency. It is not authored freehand.
2. Every displayed fact must trace back to a source ledger and quote ledger.
3. Contradictions do not lower rank quietly; they block release or demote fields to `unknown`.
4. Fields stay in the dashboard only if they reach high-confidence coverage on most products in a pilot set.
5. Raw evidence, synthesized judgments, and dashboard projections live in separate artifacts.

## Current operational commands

Generate the full 24-product seed pack:

```bash
npm run research:v2:bootstrap
```

Validate the generated run:

```bash
npm run research:v2:validate
```

Verify citation and quote integrity:

```bash
npm run research:v2:verify-citations
```

Generate per-product seed search plans:

```bash
npm run research:v2:search-plans
```

Generate the 24-product quadrant/SEMrush scorecard seed:

```bash
npm run research:v2:quadrant-template
```

Build the fixed-task benchmark package:

```bash
npm run research:v2:build-benchmark
```

Score benchmark responses:

```bash
npm run research:v2:score-benchmark
```

Fill the pre-SEMrush commercial validation layer:

```bash
npm run research:v2:commercial-layer
```

Fetch quote candidates from current source URLs:

```bash
npm run research:v2:quote-candidates
```

Normalize one or more raw SEMrush captures into the reusable corpus:

```bash
npm run research:v2:normalize-semrush-capture -- /absolute/path/to/capture.json
```

Build a niche-country rollup on top of the corpus:

```bash
npm run research:v2:build-semrush-niche-rollup -- \
  --db lu \
  --name luxembourgish-route \
  --domain educateme.lu \
  --keyword sproochentest
```

Important:

- run bootstrap and validate sequentially, not in parallel
- validator reads JSON files written by bootstrap; parallel execution can catch partially written artifacts
- current default run target is `research-runs/2026-04-18-all-24`

## External method references

- Anthropic, "How we built our multi-agent research system":
  [https://www.anthropic.com/engineering/built-multi-agent-research-system](https://www.anthropic.com/engineering/built-multi-agent-research-system)
- Anthropic, "Reduce hallucinations":
  [https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations](https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
- Anthropic, "Building effective agents":
  [https://www.anthropic.com/research/building-effective-agents](https://www.anthropic.com/research/building-effective-agents)
- Meta, "Chain-of-Verification Reduces Hallucination in Large Language Models":
  [https://arxiv.org/abs/2309.11495](https://arxiv.org/abs/2309.11495)
- Google DeepMind et al., SAFE / Long-form factuality:
  [https://arxiv.org/abs/2403.18802](https://arxiv.org/abs/2403.18802)
- FActScore:
  [https://arxiv.org/abs/2305.14251](https://arxiv.org/abs/2305.14251)
- ALCE:
  [https://arxiv.org/abs/2305.14627](https://arxiv.org/abs/2305.14627)
- BrowseComp:
  [https://arxiv.org/abs/2504.12516](https://arxiv.org/abs/2504.12516)
- Google AI Co-Scientist:
  [https://arxiv.org/abs/2502.18864](https://arxiv.org/abs/2502.18864)
- Sharma et al., sycophancy:
  [https://arxiv.org/abs/2310.13548](https://arxiv.org/abs/2310.13548)
- Cochrane GRADE handbook chapter:
  [https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-14](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-14)
