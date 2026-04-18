# Research Brief - B1 - German for Nurses (B1->B2 Pflege Sprint)

## Product

- Code: B1
- Title: German for Nurses (B1->B2 Pflege Sprint)
- Run id: 2026-04-18-all-24
- Seed source: legacy research card
- Rerun priority: P0

## Current legacy framing

- One-line summary: Online German sprint for international nurses preparing for German healthcare work and nursing-specific language proof.
- Target user: International nurses and recruitment partners preparing nurses for German practice.
- Core pain: Candidates need nursing-specific German fast enough to clear accepted proof and move into the German labour market.
- Claimed outcome: Faster progress toward a passable nursing German exam and improved employability in Germany.

## Scope to verify

- Primary market: Germany
- Country scope: Germany
- Profession scope: nurses, healthcare workers

## Current evidence snapshot

- Sources in legacy card: 9
- Externally checkable claims: 6
- Verified: 5
- Partially verified: 0
- Unverified: 0
- Contradicted: 1
- Internal unresolved claims: 4
- Claim conflicts: 3
- Legacy external claims with zero source ids: 0
- Dangling source refs: 0

## Immediate risk picture

1. [high] Bilateral agreements with India, Morocco and Brazil define the recruiting route.
   Reason: The reviewed public evidence shows partner-country recruitment for India, Indonesia, the Philippines and Tunisia, not Morocco or Brazil.
   Sources: triplewin_makeit, triplewin_projects
2. [medium] 300K+ foreign nurses already there (17.8%).
   Reason: Official BA figures are 270,000 foreign-national nurses in 2023 and 18% in 2025; the source-card number is not exact.
   Sources: ba_nursing_shortage_2024, ba_nurses_2025
3. [medium] Subsidy: none.
   Reason: BAMF vocational German language support and BA-supported recruitment/training routes exist, so the blanket no-subsidy framing is incomplete.
   Sources: bamf_deufoev, triplewin_makeit, triplewin_projects

## Manual review carried over from legacy card

1. route_design - Decide whether the product is exam prep only or a broader migration-support motion.
2. country_origin_scope - The public route differs by source country; do not reuse an unsupported country list.
3. funding_angle - Validate whether any BAMF or BA route is operationally usable for this offer.

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
