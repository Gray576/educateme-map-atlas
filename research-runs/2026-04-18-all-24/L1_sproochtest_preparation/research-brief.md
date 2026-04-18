# Research Brief - L1 - Sproochtest Preparation

## Product

- Code: L1
- Title: Sproochtest Preparation
- Run id: 2026-04-18-all-24
- Seed source: legacy research card
- Rerun priority: P0

## Current legacy framing

- One-line summary: Live Luxembourgish exam-prep course for people preparing for the Sproochentest required in the nationality process.
- Target user: Adults preparing for Luxembourgish nationality, especially naturalisation candidates who need to pass the Sproochentest.
- Core pain: Learners need a structured way to pass the official Luxembourgish language exam on the first attempt.
- Claimed outcome: Exam readiness, pass confidence and reimbursement awareness for the nationality route.

## Scope to verify

- Primary market: Luxembourg
- Country scope: Luxembourg
- Profession scope: naturalisation candidates, adult learners

## Current evidence snapshot

- Sources in legacy card: 11
- Externally checkable claims: 4
- Verified: 2
- Partially verified: 1
- Unverified: 0
- Contradicted: 1
- Internal unresolved claims: 5
- Claim conflicts: 2
- Legacy external claims with zero source ids: 0
- Dangling source refs: 0

## Immediate risk picture

1. [high] Government reimbursement ~750 after exam pass.
   Reason: The public sources confirm reimbursement routes, but the card merges course-fee reimbursement, exam-fee reimbursement and eligibility conditions into one simple claim.
   Sources: guichet_conditions_prealables, guichet_naturalisation, guichet_sproochentest_pdf, etic_sproochentest, luxlanguages_sproochentest_individual
2. [high] No real competitor pressure / pure upsell.
   Reason: There are already official and private alternatives in the Sproochentest prep and Luxembourgish course market, so the market is not empty.
   Sources: inll_sproochentest, etic_sproochentest, luxlanguages_sproochentest_group, prolingua_luxembourgish, luxlessons_home

## Manual review carried over from legacy card

1. reimbursement-copy - Make the reimbursement language precise and separate the test fee from the course fee.
2. market-positioning - Decide whether the offer is a premium exam-prep product or a citizenship-journey bundle, because both need different messaging.

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
