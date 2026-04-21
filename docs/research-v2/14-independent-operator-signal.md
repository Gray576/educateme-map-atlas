# Independent Operator Signal

This protocol tests whether a product category already has fragmented, operator-led demand.

`Independent operator` means:
- solo provider
- niche prep tutor
- small specialist consultancy
- small private training business below institutional scale
- operator using a Facebook group or similar community as a funnel surface

It does **not** mean:
- official body
- university
- large academy
- marketplace
- directory

## Why use it

Independent operators are a proxy for:
- real pain
- existing monetization
- fragmented market structure

They are not proof of:
- large TAM
- scalable paid acquisition
- strong WTP

## Workflow

1. Set scope:
- product
- market/database
- direct, problem, and route hypotheses

2. Build the search set:
- direct anchors
- problem anchors
- route/proxy anchors
- operator modifiers such as `tutor`, `private`, `coach`, `consultant`, `seminar`

3. Gather evidence:
- product anchors and follow-ups
- SEMrush Organic Positions
- SEMrush Keyword Overview
- competitor tables
- visible small domains
- public price/package/contact proof
- Facebook groups or similar community acquisition surfaces

4. Classify candidates:
- `independent_operator`
- `private_school_or_academy`
- `official_or_institutional`
- `marketplace_or_directory`
- `social_community_only`
- `content_only`

5. Score the signal:
- `strong`
- `medium`
- `weak`
- `none`

## Strong signal

Use `strong` only if:
- at least 2 independent operators exist
- at least 1 shows a concrete offer or price
- at least 1 is visible on a non-branded direct, problem, or route query
- the market is not controlled only by official pages

## Facebook groups

Treat Facebook groups as supporting evidence only.

They help when they show:
- recurring problem language
- operator-led posting
- lead magnet behavior
- routing into a niche offer

They do not replace keyword, pricing, or direct-offer proof.

## Output

Store a compact summary:
- `independent_operator_signal`
- `independent_operator_examples`
- `operator_types_seen`
- `supporting_queries`
- `pricing_or_offer_proof`
- `social_funnel_signal`
- `takeaway`
- `why_not_stronger`

For product cards, persist this as a compact `independent_operator_summary` block inside `commercial-validation.market_evidence`, and mirror the same payload into `dashboard-ingestion.analyst_only_fields.independent_operator_summary`.
