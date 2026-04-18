# External System Audit Prompts

These prompts are for copy-paste use against another research system or its owner.

Run them in order.

## Prompt 1 - Workflow inventory

```text
Describe your research system as an execution graph, not as marketing copy.

Return:
1. all stages in order
2. which stages use external data
3. where verification happens
4. where contradiction search happens
5. where confidence is assigned
6. what artifacts are produced at each step

If something is implied but not explicit, mark it as unknown.
```

## Prompt 2 - Retrieval and source audit

```text
Audit the retrieval layer.

Answer:
1. Which search engines, APIs, or databases are used?
2. Is there single-engine dependence?
3. Is there source tiering?
4. Are official or primary sources required for high-risk claims?
5. What source metadata is preserved?
6. What retrieval failure modes are unhandled?

Return a verdict for each item: EDGE / PARITY / GAP.
```

## Prompt 3 - Citation and quote audit

```text
Audit whether the system is actually quote-grounded.

Check:
1. Are exact quotes extracted before synthesis?
2. Are citations validated after synthesis?
3. Can every public-facing fact be traced to a source and quote?
4. Does the system verify that the cited quote really supports the claim?
5. What happens when a claim has no valid citation?

Return:
- hard verdict
- likely hallucination risks
- missing controls
```

## Prompt 4 - Falsification audit

```text
Audit the system's anti-sycophancy and falsification design.

Check:
1. Is there a dedicated falsification phase?
2. Is disagreement encouraged or suppressed?
3. Is there a reversal rule based on stronger evidence?
4. Are contradiction queries planned explicitly?
5. Does the system fail closed when contradictions remain unresolved?

Do not reward persuasive wording. Audit actual safeguards.
```

## Prompt 5 - Confidence audit

```text
Audit the confidence model.

Check:
1. Is confidence freehand-authored or derived from evidence quality?
2. Does confidence depend on source authority, corroboration, freshness, and contradiction status?
3. Are confidence bands calibrated against outcomes?
4. Is low confidence translated into omission or only a warning label?

Return:
- what confidence currently means
- why that is or is not valid
- what would be needed for calibrated confidence
```

## Prompt 6 - Artifact integrity audit

```text
Audit the system's artifacts.

Check:
1. Are raw evidence, synthesized judgments, and public outputs separated?
2. Are there schema validators?
3. Are source ids referentially valid?
4. Are there release gates?
5. Are there stale or duplicated computed values?

Return:
- artifact map
- integrity risks
- blocking defects
```

## Prompt 7 - Benchmark readiness audit

```text
Audit whether the system is benchmark-ready.

Check:
1. Can it be run on a fixed task set?
2. Can outputs be exported with citations and sources?
3. Can an independent grader score the results?
4. Is there any measurement of accuracy, citation precision, or hallucination rate?
5. What minimal harness is still missing?

Return:
- ready / not ready
- exact blockers
```

## Prompt 8 - Hard self-critique

Use this after every draft or vendor answer.

```text
Write a harsh critique of your current audit.

What did you fail to inspect?
What assumptions did you make too early?
What evidence do you still not have?
What could falsify your conclusions?
What did you confuse between process design and measured performance?

Then output:
Confidence: [before]% -> [after]% - [reason]
```
