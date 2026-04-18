# High-Confidence Enrichment Algorithm

This algorithm replaces "fill many fields once" with "verify a smaller number of claims repeatedly until they survive contradiction search."

## Non-negotiable rules

1. Claim-first, not field-first.
2. Quotes before synthesis.
3. Confidence is computed, not authored.
4. Contradictions block release; they do not merely reduce a score.
5. Omit or mark `unknown` when evidence is insufficient.
6. Each phase ends with a self-audit and can be re-run.

## Output target

For each product, the pipeline must produce:

- an evidence-first source card
- a quote ledger
- a claim ledger
- a contradiction log
- a field decision log
- a dashboard ingestion payload
- a post-step self-audit log

## Required architecture

Use orchestrator-worker flow with specialized verifiers.

Why:

- Anthropic's production research system explicitly uses a lead agent plus subagents exploring different aspects in parallel.
- Anthropic's hallucination guidance recommends direct quotes, citation verification, iterative refinement, and best-of-N comparison.
- CoVe adds a formal verification pass after draft generation.
- SAFE and FActScore show why long-form outputs should be decomposed into atomic facts.
- GRADE is a good model for certainty grading because it forces explicit judgment domains instead of vague confidence scores.

## Phase 0 - Intake and scoping

### Inputs

- current product title and product code
- current product description / legacy card
- target market and jurisdiction
- business question for the dashboard

### Actions

- separate the product into:
  - externally checkable facts
  - internal hypotheses
  - strategic judgments
- write the research question in falsifiable form
- define the jurisdictions, languages, and time window that matter

### Output

- `research-brief.md`
- first list of atomic claims and open questions

### Gate

Do not proceed until every planned output field maps to at least one atomic claim.

## Phase 1 - Atomic claim decomposition

### Actions

- decompose all public-facing statements into atomic claims
- classify each claim:
  - mandate
  - licensing
  - accreditation
  - compliance
  - subsidy
  - reimbursement
  - exam
  - recognition
  - competitor
  - numeric
  - deadline
  - internal hypothesis
- separate source-checkable claims from internal business assumptions

### Output

- `claim-ledger.seed.json`

### Gate

No compound claims.
No blended "fact + interpretation" rows.

## Phase 2 - Search planning

### Actions

- create query packs per claim family:
  - official/regulator
  - licensing/exam body
  - public institution or ministry
  - incumbent provider / competitor
  - statistics / dataset
  - market scan / long-tail contradiction search
- require at least two independent retrieval routes for high-risk claims:
  - direct site search or official site navigation
  - general web search
- define explicit contradiction queries:
  - "not eligible"
  - "exception"
  - "withdrawn"
  - "expired"
  - "list of providers"
  - "deadline"
  - "not applicable"

### Output

- `search-plan.md`

### Gate

Every high-risk claim must have a contradiction search path before evidence collection starts.

## Phase 3 - Source collection and source tiering

### Actions

- collect candidate sources
- classify each source into a tier
- record metadata:
  - source id
  - title
  - publisher
  - URL
  - source type
  - authority tier
  - jurisdiction
  - published date if available
  - accessed date
  - language
  - archive or snapshot info if available

### Tier policy

- `T1`: regulator, law, official public register, exam body, government, peer-reviewed paper
- `T2`: professional body, accepted official partner route, public institution, official provider list
- `T3`: company primary page, incumbent provider, official commercial documentation
- `T4`: reputable media or industry secondary analysis
- `T5`: blog, community, forum, unattributed content

### Output

- `source-ledger.jsonl`

### Gate

- regulated claims require at least one `T1` or `T2` source
- numeric claims require a primary or official statistical source
- competitor gap claims cannot pass without an explicit market scan method

## Phase 4 - Quote extraction

### Actions

- extract exact quotes or exact structured facts from each source
- each quote must include:
  - `quote_id`
  - `source_id`
  - exact text or exact data point
  - page / section / anchor if possible
  - access time
- store multiple quotes per claim if necessary

### Output

- `quote-ledger.jsonl`

### Gate

No claim can move to verification without quote-level evidence, except when the source is structured data and the exact cell/value is recorded.

## Phase 5 - Claim verification

### Actions

- verify each atomic claim against the quote ledger
- assign:
  - `verified`
  - `partially_verified`
  - `unverified`
  - `contradicted`
  - `unclear`
- record supporting and contradicting evidence separately

### Minimum evidence rules

- mandate / licensing / accreditation / subsidy / reimbursement / deadline:
  - at least 2 independent sources
  - at least 1 from `T1` or `T2`
- numeric audience / market size:
  - at least 1 primary statistical source
  - second corroborating source if the number will be shown in the dashboard
- competitor inventory:
  - explicit documented search protocol
  - otherwise mark as `partial` or `unclear`
- buyer/persona claims:
  - source-backed only if triangulated from multiple independent sources or internal first-party evidence

### Output

- `claim-ledger.json`

### Gate

No dashboard field may be synthesized from any claim still marked `unverified`, `unclear`, or `contradicted`.

## Phase 6 - Falsification

### Actions

- run an adversarial contradiction pass
- force a separate agent to disprove each high-impact claim
- search for:
  - exclusions
  - exceptions
  - outdated rules
  - conflicting provider statements
  - market counterexamples

### Reversal rule

When two agents disagree, evidence wins in this order:

1. new direct fact with source and quote
2. stronger source tier on the same question
3. clearer jurisdiction match
4. fresher evidence
5. logical argument
6. unsupported assertion

### Output

- `contradiction-log.json`

### Gate

Any unresolved `T1` contradiction blocks release of the affected field.

## Phase 7 - Field synthesis

### Actions

- synthesize fields only from verified claims
- produce a field decision record per field:
  - value
  - confidence band
  - evidence profile
  - source refs
  - quote refs
  - omission reason if dropped

### Confidence rubric

Compute confidence from evidence profile, not from freehand percentages.

Domains:

- authority
- corroboration
- directness
- consistency
- freshness
- inference burden

Recommended bands:

- `high`
  - authority strong
  - corroborated
  - direct
  - no unresolved contradiction
- `medium`
  - usable for analyst view
  - not safe for default dashboard surfacing
- `low`
  - retain only in research notes
- `blocked`
  - contradicted, stale, or under-evidenced

### Output

- `field-decisions.json`

### Gate

Only `high` fields move to the dashboard payload by default.

## Phase 8 - Calibration and release

### Actions

- compute release status:
  - `publish`
  - `review`
  - `blocked`
- run structured self-audit
- compare against pilot benchmarks where available
- store unresolved review items

### Release policy

Block if any of the following are true:

- unresolved `T1` contradiction
- required source tier missing
- missing quote evidence for a displayed fact
- stale analysis timestamp
- schema violation
- confidence below `high` for a default dashboard field

### Output

- `dashboard-ingestion.json`
- `manual-review.md`
- `post-step-audit.md`

## Post-step self-audit loop

After every phase, run the prompt from [templates/post-step-self-audit-prompt.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/post-step-self-audit-prompt.md).

If the audit finds a material gap, the phase is not "done." It is re-run with a changed plan.

## Benchmarking

Structural audit is not enough.

Run quantitative validation on:

- BrowseComp or a domain-specific retrieval set
- citation precision / citation recall
- contradiction escape rate
- field-level high-confidence coverage
- expert spot-check agreement

Use `openai/simple-evals` as a benchmark reference:
[https://github.com/openai/simple-evals](https://github.com/openai/simple-evals)
