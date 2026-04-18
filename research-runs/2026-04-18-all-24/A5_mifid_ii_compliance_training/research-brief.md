# Research Brief - A5 - MiFID II Compliance Training

## Product

- Code: A5
- Title: MiFID II Compliance Training
- Run id: 2026-04-18-all-24
- Seed source: legacy research card
- Rerun priority: P0

## Current legacy framing

- One-line summary: Luxembourg MiFID II training concept that tries to package a CSSF-recognised external route with multilingual delivery and compliance-oriented certification.
- Target user: Financial institutions and staff under CSSF prudential supervision who provide investment information or advice.
- Core pain: Regulated financial firms need a credible external training path that maps to MiFID II knowledge-and-competence expectations and survives compliance scrutiny.
- Claimed outcome: A CSSF-recognised training path, completion certificate and audit documentation.

## Scope to verify

- Primary market: Luxembourg
- Country scope: Luxembourg
- Profession scope: investment advice staff, investment information staff

## Current evidence snapshot

- Sources in legacy card: 11
- Externally checkable claims: 9
- Verified: 4
- Partially verified: 0
- Unverified: 3
- Contradicted: 2
- Internal unresolved claims: 5
- Claim conflicts: 4
- Legacy external claims with zero source ids: 2
- Dangling source refs: 0

## Immediate risk picture

1. [high] CSSF Circular 17/670 mandates 60h training.
   Reason: The public materials show a modular accredited route with 64h or 76h in one House of Training description and a separate certification path on the current page. The card's universal 60h wording is misleading.
   Sources: cssf_17670, houseoftraining_mifid_cert, houseoftraining_mifid_blog
2. [high] INFPC 15-35% applies to this product.
   Reason: Guichet excludes mandatory regulated-profession training, while House of Training says its MiFID II route can be eligible. The public wording conflicts and does not support a clean claim for this new product.
   Sources: guichet_cvt, houseoftraining_mifid_cert
3. [high] Deliverable: CSSF-accredited completion certificate.
   Reason: The reviewed sources confirm an incumbent accredited route, not accreditation for this proposed product.
   Sources: houseoftraining_mifid_cert, houseoftraining_mifid_blog
4. [medium] CSSF deadline June 30, 2026.
   Reason: No official CSSF deadline matching this statement was found; an exam date is not the same as a regulatory deadline.
   Sources: houseoftraining_mifid_cert

## Manual review carried over from legacy card

1. route-strategy - Decide whether the business will pursue its own CSSF route, use a partner route or remain a non-accredited training reseller.
2. subsidy-copy - Remove any subsidy copy until eligibility is resolved at product level.
3. multilingual-gap - Re-test whether language coverage is truly a differentiator after accounting for the incumbent route.

## Provenance defects inherited from legacy card

1. Zero-source external claim - No DE/PT/IT providers exist.
2. Zero-source external claim - All financial sector employees providing investment services (73K in Luxembourg).

No dangling source ids detected.

## Mandatory v2 research objectives

1. Rebuild atomic claims from scratch; do not trust legacy confidence values.
2. Re-verify all regulated, subsidy, deadline, numeric, and competitor claims with quote-level evidence.
3. Run explicit contradiction search before field synthesis.
4. Demote any under-evidenced field to unknown.
5. Produce a safe dashboard payload only from high-confidence fields.

## Required source tracks

1. Official or regulator sources
2. Licensing / approval / exam body sources where applicable
3. Primary statistical sources for numeric claims
4. Competitor or incumbent provider sources
5. Contradiction-specific searches for exclusions, non-eligibility, or narrower scope

## Post-step audit requirement

After each phase, run the standard self-audit prompt from:
[post-step-self-audit-prompt.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/post-step-self-audit-prompt.md)
