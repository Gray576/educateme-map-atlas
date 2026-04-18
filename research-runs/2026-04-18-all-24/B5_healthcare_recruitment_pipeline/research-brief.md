# Research Brief - B5 - Healthcare Recruitment Pipeline

## Product

- Code: B5
- Title: Healthcare Recruitment Pipeline
- Run id: 2026-04-18-all-24
- Seed source: legacy research card
- Rerun priority: P0

## Current legacy framing

- One-line summary: Cross-border nurse recruitment concept for Belgian and Luxembourg employers that bundles language training, recognition support and post-placement coaching.
- Target user: Recruitment agencies and hospital employers hiring foreign-trained nurses into Belgium and Luxembourg, with nurses as the end beneficiaries of the pathway.
- Core pain: Employers and recruiters face nurse shortages, but actual hiring depends on language proof, recognition steps, visa or licence processes and practical relocation support.
- Claimed outcome: A smoother route from candidate sourcing to placement by bundling language preparation, recognition support and post-placement support.

## Scope to verify

- Primary market: Benelux
- Country scope: Belgium, Luxembourg
- Profession scope: nurses

## Current evidence snapshot

- Sources in legacy card: 11
- Externally checkable claims: 8
- Verified: 1
- Partially verified: 5
- Unverified: 1
- Contradicted: 1
- Internal unresolved claims: 6
- Claim conflicts: 4
- Legacy external claims with zero source ids: 0
- Dangling source refs: 0

## Immediate risk picture

1. [high] No one does this for Luxembourg/Belgium.
   Reason: LiReco, Charité and HSE all show adjacent or direct models with recruitment, language support and relocation assistance. The exclusivity claim is not defensible.
   Sources: lireco_about, charite_recruitment, hse_relocation_package, hse_overseas_candidates
2. [high] Deliverables: language certificate.
   Reason: The card does not specify whether the certificate would be accepted by destination-country authorities; official routes require accepted proof formats and country-specific thresholds.
   Sources: lux_health_professions, belgium_foreign_diploma_visa
3. [medium] Europe needs 950K health workers by 2030.
   Reason: WHO/Europe says the expected shortage is nearly 1 million health workers by 2030. The figure is close but not quoted precisely.
   Sources: who_europe_nurse_shortage
4. [medium] Agencies spend £10–17K per nurse.
   Reason: The only official figure reviewed is an Irish public-sector case with €10,000 agency fee and €15,500 total recruitment cost for an international nurse, which is not the same claim.
   Sources: hse_pq_61870

## Manual review carried over from legacy card

1. route-boundary - Decide whether this is a training offer, a recruitment service, a recognition-support service or a combined business line.
2. certificate-design - Validate whether the product prepares candidates for accepted destination-country language proof or only issues an internal course certificate.
3. country-sequencing - Split Luxembourg and Belgium route design if needed because the rules are materially different.
4. funding-angle - Do not use Erasmus+ as a practical commercial subsidy angle until a specific eligible project route is identified.

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
