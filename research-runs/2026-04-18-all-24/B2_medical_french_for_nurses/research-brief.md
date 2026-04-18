# Research Brief - B2 - Medical French for Nurses

## Product

- Code: B2
- Title: Medical French for Nurses
- Run id: 2026-04-18-all-24
- Seed source: legacy research card
- Rerun priority: P0

## Current legacy framing

- One-line summary: Medical French training concept for nurses targeting French-speaking healthcare systems where language proof and recognition rules differ by country.
- Target user: International nurses and staffing partners targeting France, Belgium and Switzerland.
- Core pain: Nurses need job-ready medical French and still have to clear country-specific recognition and language-proof requirements.
- Claimed outcome: Better medical French and a smoother path toward employment in French-speaking healthcare systems.

## Scope to verify

- Primary market: France, Belgium and Switzerland
- Country scope: France, Belgium, Switzerland
- Profession scope: nurses, healthcare workers

## Current evidence snapshot

- Sources in legacy card: 10
- Externally checkable claims: 4
- Verified: 3
- Partially verified: 0
- Unverified: 1
- Contradicted: 0
- Internal unresolved claims: 4
- Claim conflicts: 3
- Legacy external claims with zero source ids: 0
- Dangling source refs: 0

## Immediate risk picture

1. [high] The same model can be applied to France, Belgium and Switzerland without material redesign.
   Reason: The public sources show materially different recognition and language requirements in each country, so a single model is not obviously portable.
   Sources: france_paramedical, belgium_visa_lang, swiss_foph
2. [high] The product's certificate will be accepted for practice or recognition.
   Reason: Acceptance depends on the destination authority; provider-issued certificates are not automatically valid.
   Sources: france_paramedical, belgium_visa_lang, swiss_foph
3. [medium] No dedicated online Medical French provider identified.
   Reason: The review found substitutes, but not an exhaustive market census, so the absence claim is not proven.
   Sources: prolingua_tailor_made, inlingua_company_courses

## Manual review carried over from legacy card

1. route_design - Split the offer by destination country if you want credible claims.
2. certificate_claim - Do not imply that a course certificate is accepted by destination authorities unless that is validated.
3. market_focus - Choose whether the first wedge is France, Belgium or Switzerland instead of all three at once.

## Provenance defects inherited from legacy card

No zero-source external claims detected.

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
