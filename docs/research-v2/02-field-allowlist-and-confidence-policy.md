# Field Allowlist And Confidence Policy

This document answers one question:

Which fields are worth keeping if we only allow fields that are high-confidence on most products after multiple verification layers?

## Policy objective

A field survives only if:

- it is useful for the dashboard
- it can be grounded repeatedly across products
- it reaches `high` confidence on most products in a pilot run

## Adoption rule

Promote a field family to the dashboard only if, on a representative pilot set:

- at least 70% of products reach `high` confidence for that field
- fewer than 10% of products hit unresolved contradiction for that field
- median support is at least 2 independent sources
- high-risk claims include at least 1 `T1` or `T2` source

If that bar is not met:

- move the field to analyst-only view
- or drop it from automated enrichment

## Confidence profile

Do not store arbitrary percentages as the final truth signal.
Store an evidence profile and derive the band.

### Evidence profile domains

- `authority`: how strong are the source tiers?
- `corroboration`: how many independent sources support the field?
- `directness`: do the sources directly answer the field?
- `consistency`: do sources agree?
- `freshness`: are the sources current enough?
- `inference_burden`: how many interpretation steps were needed?

### Suggested scoring

- `high`
  - direct evidence
  - strong source tier
  - corroborated
  - no unresolved contradiction
- `medium`
  - some evidence, but incomplete or indirect
- `low`
  - mostly inferential
- `blocked`
  - contradicted, stale, or unsupported

## Allowlist

### A. Keep in the evidence-first source card

These are low-ambiguity, source-centric fields:

- `product_code`
- `product_title`
- `analysis_timestamp`
- `sources[]`
- `claims[]`
- `requirements[]`
- `entities[]`
- `competitors[]` when directly evidenced
- `open_questions[]`
- `manual_review_items[]`
- `verification_summary`

### B. Safe for dashboard by default

Only if each field passes the confidence gates:

- verification status summary
  - verified claim count
  - contradicted claim count
  - blocked claim count
- verified regulator / framework / approval entities
- verified regulatory requirements
- verified funding or approval route existence
- verified hard blockers
- verified jurisdiction scope
- verified competitor names
- release status

These are safe because they can be tied tightly to claim and quote evidence.

### C. Analyst-only unless a product-specific case clears the bar

These fields may be useful, but are often too inferential or too context-sensitive to trust by default:

- target audience summary
- primary buyer type
- budget owner
- buyer influencers
- market regulatory context
- subsidy existence
- subsidy eligibility status
- proof stack
- proof burden
- dependency types
- delivery language
- country scope when not explicit in sources
- numeric audience size
- deadlines not stated directly by an official source
- competitor gap claims like "no DE/PT/IT provider"

### D. Remove from automated truth layer

These should not be treated as stored truth in the next system:

- `product_summary.one_sentence_summary`
- `product_summary.core_pain`
- `product_summary.claimed_outcome`
- `buyer_analysis.*`
- `dashboard_enrichment.*`
- `risk_map.*`
- `claim_conflicts[]` as authored truth rather than derived verifier output
- `quality_signals.*` when authored inside the card
- heuristic market bucket
- delivery language guessed from product title
- static archetype and operator overlays inside the truth layer
- founder rank / delivery / evidence / claims scores before benchmarking

## Why the current system fails this policy

Real repo metrics make the failure explicit:

- only 52 of 116 externally checkable claims are verified
- 19 claims are contradicted
- 30 claims are marked verified with only one source id
- 15 claims have zero source ids
- every card still contains internal unresolved claims
- authored average field confidence is high despite widespread conflicts

That means the current field set is too broad for the actual evidence quality.

## Decision boundary for omission

If a field is useful but under-evidenced:

- keep it in analyst notes
- do not show it in the default dashboard
- do not silently guess it

`unknown` is better than a confident but wrong field.
