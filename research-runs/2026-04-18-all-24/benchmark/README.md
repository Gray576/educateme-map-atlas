# Benchmark Package - 2026-04-18-all-24

- Tasks: 96
- Products covered: 24
- Build time: 2026-04-18T13:02:36.638Z

## Files

- `benchmark-manifest.json`
- `tasks.json`
- `tasks.jsonl`
- `responses.template.jsonl`
- `adjudication.template.csv`

## How to use

1. Give `tasks.jsonl` and the response contract to the system under test.
2. Collect raw responses in JSONL format.
3. Fill `adjudication.template.csv` after independent review.
4. Run:

```bash
npm run research:v2:score-benchmark
```

The scorer will report structural coverage immediately. Accuracy-style metrics only become meaningful after adjudication rows are filled.

