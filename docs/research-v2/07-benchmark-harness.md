# Benchmark Harness

This is the fixed-task evaluation layer for `research-v2`.

It exists because protocol compliance is not enough. A system can describe a careful process and still produce weak outputs.

## Goal

Measure the research system on a repeatable task set with:

- fixed prompts
- fixed artifact contract
- independent adjudication
- explicit scoring dimensions

## What this harness does

1. Builds a benchmark task set from the current 24-product run
2. Creates a response contract for any system under test
3. Creates an adjudication template for manual or independent grading
4. Aggregates structural and adjudicated scores into a score report

## Benchmark units

Current benchmark unit:

- claim-level verification task

Each task asks the system to classify one atomic product claim as:

- `supported`
- `contradicted`
- `insufficient_evidence`

and return:

- answer text
- confidence band
- source citations
- direct quote citations

## Important limitation

The seed benchmark does **not** claim that the current legacy status is gold truth.

The task set is built from the existing seed claims because we need a stable, repeatable test pack now.
Final quantitative accuracy only becomes meaningful after independent adjudication.

## Output files

For a run directory:

`research-runs/<run_id>/benchmark/`

Expected artifacts:

- `benchmark-manifest.json`
- `tasks.json`
- `tasks.jsonl`
- `responses.template.jsonl`
- `adjudication.template.csv`
- `README.md`
- `score-report.json`
- `score-summary.md`

## Scoring layers

### 1. Structural score

Computed automatically from system responses:

- answered task coverage
- verdict format validity
- citation presence
- quote presence
- confidence presence

This is useful, but not enough.

### 2. Adjudicated score

Filled by a grader after reading the response and its citations.

Score columns:

- `verdict_correct_0_1`
- `citation_precision_0_1`
- `quote_grounding_0_1`
- `source_tier_ok_0_1`
- `answer_complete_0_1`
- `confidence_calibration_0_1`

Only this layer supports meaningful claims about:

- accuracy
- citation precision
- hallucination escape
- calibration quality

## Default build command

```bash
npm run research:v2:build-benchmark
```

## Default score command

```bash
npm run research:v2:score-benchmark
```

If no real responses exist yet, the scorer should still produce a structural summary showing zero coverage rather than pretending the system was tested.

## Required response contract

Each response row must include:

- `task_id`
- `system_id`
- `verdict`
- `answer_text`
- `confidence_band`
- `citations[]`

Each citation should include:

- `source_id_or_url`
- `quote_text`
- `location`
- `is_official_source`

## Use against another system

1. Build the benchmark from this repo
2. Give the benchmark task set and response contract to the other system
3. Collect raw outputs
4. Run the scorer
5. Fill independent adjudication
6. Re-run the scorer with adjudication populated

This is the minimum path from “prompt audit” to “measured performance”.
