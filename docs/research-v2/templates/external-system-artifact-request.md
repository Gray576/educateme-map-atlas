# External System Artifact Request

Use this when you want another research system to be audited against the same protocol.

Send it as-is or adapt the placeholders.

## Request

Please provide the following artifacts for your research system.

We need them for a protocol-level audit and, if possible, a quantitative validation pass.

### 1. Workflow and prompt artifacts

- system prompt or workflow description
- stage-by-stage process description
- any role prompts or agent prompts
- source policy or citation policy
- confidence policy

### 2. Output artifacts

Please provide `3-5` recent real outputs, not polished examples.

For each output include:

- the original task or user prompt
- the final answer
- the full source list
- direct quotes or quote traces if your system stores them
- any internal confidence or scoring metadata

### 3. Benchmark / evaluation claims

If you have any internal quality claims, include:

- benchmark name
- dataset or task set
- metric definitions
- reported scores
- scoring methodology

### 4. Preferred artifact format

For each sample output, return a JSON object with:

```json
{
  "sample_id": "sample_001",
  "task": "Original user task or benchmark prompt",
  "final_answer": "Full answer text",
  "citations": [
    {
      "source_id_or_url": "https://example.com/source",
      "quote_text": "Exact quote if available",
      "location": "page / section / anchor",
      "is_official_source": true
    }
  ],
  "confidence": {
    "value": "high",
    "method": "how confidence was assigned"
  }
}
```

## Minimum acceptable fallback

If you cannot provide real output artifacts, send:

- workflow description
- prompt pack
- source policy
- confidence policy

That is enough for a structural audit.
It is not enough for a credible quantitative validation.
