# External Research System Audit Pack

This pack is for auditing another research system against the same standard.

It is designed for two different use cases:

1. structural audit
2. quantitative validation

They are not the same thing.

## Short answer

Yes, we can finish the missing steps in our system.

But no, a list of prompts alone is not enough if the goal is a trustworthy validation of another system.

Prompts are enough for:

- structural audit
- process comparison
- architecture review
- identifying missing controls

Prompts are not enough for:

- citation precision measurement
- hallucination rate measurement
- confidence calibration quality
- benchmarked performance claims

For that, you need outputs, source traces, and an independent grading step.

## Correct model

Use a two-layer audit:

### Layer 1 - Structural audit by prompt pack

Goal:

- understand how the other system works
- identify EDGE / PARITY / GAP against the protocol

Inputs:

- system prompts
- workflow description
- sample artifacts
- example outputs

Output:

- qualitative audit report

### Layer 2 - Quantitative validation

Goal:

- test whether the system actually behaves as claimed

Inputs:

- a fixed task set
- real outputs from that system
- source/citation traces
- independent grader

Output:

- accuracy
- citation precision
- contradiction escape rate
- confidence calibration quality

## What we can do next in our own system

These are the remaining missing pieces:

1. Multi-engine retrieval layer
2. Citation / quote verifier
3. Benchmark harness
4. Confidence calibration against outcomes

## What a prompt-only audit can realistically cover

A prompt pack can evaluate:

- engines and source strategy
- source tiering
- citation verification policy
- multi-agent structure
- anti-sycophancy controls
- quote-then-answer workflow
- fact verification rules
- reflection / critique loop
- confidence calibration policy
- benchmark policy

That is exactly the protocol level.

It cannot prove that the system really executes those controls correctly.

## Prompt Pack

### Prompt 1 - Workflow inventory

```text
You are auditing an LLM-based research workflow.

Describe the system as an execution graph, not as marketing copy.

Return:
1. all stages in order
2. which stages use external data
3. where verification happens
4. where contradiction search happens
5. where confidence is assigned
6. what artifacts are produced at each step

Be skeptical. If something is implied but not explicit, mark it as unknown.
```

### Prompt 2 - Source and engine audit

```text
Audit this research system's retrieval layer.

Answer:
1. Which search engines / APIs / data sources are used?
2. Is there single-engine dependence?
3. Is there source tiering?
4. Are official / regulator / primary sources required for high-risk claims?
5. What source metadata is preserved?
6. What retrieval failure modes are unhandled?

Return a verdict for each: EDGE / PARITY / GAP.
```

### Prompt 3 - Citation and quote audit

```text
Audit whether this system is actually quote-grounded.

Check:
1. Are exact quotes extracted before synthesis?
2. Are citations validated post-synthesis?
3. Can every public-facing fact be traced to a source and quote?
4. Does the system verify that the cited quote really supports the claim?
5. What happens when a claim has no valid citation?

Return:
- hard verdict
- likely hallucination risks
- missing controls
```

### Prompt 4 - Anti-sycophancy and falsification audit

```text
Audit the system's anti-sycophancy design.

Check:
1. Is there a dedicated falsification phase?
2. Is disagreement encouraged or suppressed?
3. Is there a reversal rule based on stronger evidence rather than persuasive wording?
4. Are contradiction queries planned up front?
5. Does the system fail closed when contradictions remain unresolved?

Do not reward polite wording. Audit actual safeguards.
```

### Prompt 5 - Confidence audit

```text
Audit the confidence model.

Check:
1. Is confidence freehand-authored or derived from evidence quality?
2. Does confidence depend on source authority, corroboration, freshness, and contradiction status?
3. Are confidence bands calibrated against outcomes?
4. Is low confidence translated into omission or just a warning label?

Return:
- what confidence currently means
- why that is or is not valid
- what would be needed for calibrated confidence
```

### Prompt 6 - Benchmark readiness audit

```text
Audit whether this system is benchmark-ready.

Check:
1. Can it be run on a fixed question set?
2. Can its outputs be exported with citations and sources?
3. Can an independent grader score the results?
4. Is there any existing measurement of accuracy, citation precision, or hallucination rate?
5. What minimal harness is needed to benchmark it?

Return:
- ready / not ready
- exact blockers
```

### Prompt 7 - Artifact integrity audit

```text
Audit the system's artifacts.

Check:
1. Are raw evidence, synthesized judgments, and dashboard outputs separated?
2. Are there schema validators?
3. Are source ids referentially valid?
4. Are there release gates?
5. Are there stale or duplicated computed values?

Return:
- artifact map
- integrity risks
- blocking defects
```

### Prompt 8 - Hard self-critique

Use this after every audit draft.

```text
Write a harsh critique of your current audit.

What did you fail to inspect?
What assumptions did you make too early?
What evidence do you still not have?
What could falsify your conclusions?
What did you confuse between process design and actual measured performance?

Then output:
Confidence: [before]% -> [after]% - [reason]
```

## What to request from the other system

If you want to audit another system properly, ask for:

- system prompt or workflow description
- artifact examples
- 3-5 recent outputs with citations
- source lists
- any internal scoring / confidence logic
- benchmark claims if they have them

If they cannot provide outputs, you can still do structural audit.
You cannot do credible quantitative validation.

## Attached templates in this repo

Use these with this audit pack:

- [external-system-artifact-request.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/external-system-artifact-request.md)
- [external-system-audit-prompts.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/external-system-audit-prompts.md)

## Minimum quantitative validation pack

To move beyond prompts, require:

- fixed evaluation set
- outputs in raw form
- source/citation trace
- independent grader rubric
- contradiction checks

Recommended fields:

- task_id
- question
- system_answer
- cited_sources
- quoted_evidence
- grader_verdict
- citation_precision
- factual_error_count
- contradiction_escape_flag

## Final rule

Prompts are for auditing architecture.
Artifacts and benchmarks are for auditing truthfulness.

Do not confuse the two.
