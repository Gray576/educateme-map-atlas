# Independent Operator Deep/Light Pass

This document narrows the `independent_operator_signal` protocol into two execution modes:

- `deep pass`: higher-cost manual review when the market may exist but current operator proof is weak or ambiguous
- `light pass`: lower-cost confirmation sweep for products where the main verdict is already stable

Use this after the first SEMrush-backed operator summary is already present in the card.

## Goal

The goal is not to prove TAM from Facebook groups or small sites.

The goal is to answer a narrower question:

- does this category have credible fragmented supply or community-led acquisition residue
- or is the market still visible only through institutions, broad schools, or generic marketplaces

## Deep pass

Use `deep pass` when at least one of these is true:

- current `independent_operator_signal` is `weak`
- the product looks socially or service-led rather than institution-led
- SEMrush demand exists, but the provider layer is still unclear
- the category may be monetized through communities, niche tutors, coaches, recruiters, or small consultancies

### Deep-pass evidence order

1. Existing operator summary in the card
2. SEMrush direct/problem/proxy keywords
3. Small domains in organic positions and competitor tables
4. Public offer proof on small provider pages
5. Facebook group search using the current logged-in browser session
6. Final summary update back into the product card

### Deep-pass outputs

Update only the compact card layer:

- `market_evidence.independent_operator_summary.signal`
- `independent_operator_examples`
- `operator_types_seen`
- `social_funnel_signal`
- `takeaway`
- `why_not_stronger`

Do not dump raw Facebook OCR or raw SERP tables into the card.

## Light pass

Use `light pass` when:

- the operator verdict is already stable
- the product is clearly official, exam-led, or academy-led
- Facebook/community residue is unlikely to change the conclusion materially

### Light-pass checks

1. Confirm existing operator examples still make sense
2. Confirm no obvious missing small-provider cluster is known
3. If Facebook search returns only generic noise, record that as negative evidence and stop

## Tiering used in the current portfolio

### Tier 1: deep pass

- `A6`
- `A9`
- `L2`
- `L3`
- `A7`
- `B2`
- `B5`
- `B6`
- `B3`

### Tier 2: light pass

- `L1`
- `L5`
- `A1`
- `A2`
- `A3`
- `A4`
- `A5`
- `A8`
- `A10`
- `B1`
- `B4`
- `C1`
- `L4`
- `L6`
- `L7`

## Facebook search rules

Facebook is supporting evidence only.

Use it to detect:

- repeated problem-language communities
- operator-led funnel residue
- relocation/recruitment groups
- small topic-specific learning groups

Do not treat Facebook alone as proof of a monetized market.

### Positive signal

- topic-specific groups are visible
- group names clearly match the problem or route
- multiple groups exist
- there are signs of lead generation, recruiting, training, or partner routing

### Negative signal

- only broad country/expat groups surface
- only generic AI or generic nursing groups surface
- the query collapses into irrelevant homonyms
- no topic-specific community is visible

## Current execution result

The current deep-pass Facebook/OCR sweep added useful social-funnel evidence for:

- `A9`
- `L2`
- `A6`
- `B5`
- `B6`

It added mostly negative or weak evidence for:

- `L3`
- `A7`
- `B2`
- `B3`

This means Facebook improved confidence calibration, but it did not override the operator signal on its own.
