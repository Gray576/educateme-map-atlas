# Research Brief - A8 - B2B Language Proficiency Audit

## Product

- Code: A8
- Title: B2B Language Proficiency Audit
- Run id: 2026-04-18-all-24
- Seed source: legacy research card
- Rerun priority: P0

## Current legacy framing

- One-line summary: CEFR-aligned B2B language audit for Luxembourg firms that want per-employee diagnostics, gap analysis and training recommendations.
- Target user: Companies with multilingual operations, especially HR, compliance and business-unit leaders in Luxembourg.
- Core pain: Firms need objective language diagnostics before deciding where to deploy people or which employees need training.
- Claimed outcome: A company language capability report with per-employee CEFR levels and training recommendations.

## Scope to verify

- Primary market: Luxembourg
- Country scope: Luxembourg
- Profession scope: multilingual corporate teams, fund admins, law firms, fiduciaries

## Current evidence snapshot

- Sources in legacy card: 9
- Externally checkable claims: 4
- Verified: 0
- Partially verified: 1
- Unverified: 1
- Contradicted: 2
- Internal unresolved claims: 4
- Claim conflicts: 2
- Legacy external claims with zero source ids: 1
- Dangling source refs: 0

## Immediate risk picture

1. [high] Pearson, Cambridge and Pipplet are generic, English-focused competitors.
   Reason: Pearson and Pipplet both support broader multilingual or non-English assessment routes, and Pipplet explicitly offers 40+ languages. The market is not English-only.
   Sources: pearson_versant, pipplet_about, pipplet_standard
2. [medium] Nobody does a Luxembourg-specific trilingual language audit.
   Reason: The absolute uniqueness claim is not defensible because multilingual assessment and HR reporting tools already exist in Luxembourg, even if no exact clone was found.
   Sources: allingua_home, allingua_approach, pipplet_about, pearson_versant

## Manual review carried over from legacy card

1. assessment-methodology - Before launch, define the CEFR rubric and whether the audit is psychometric enough to stand up to buyer scrutiny.
2. privacy-design - Employee-level reporting should be reviewed for data protection and internal HR policy fit.

## Provenance defects inherited from legacy card

1. Zero-source external claim - 78% of employers use language tests.

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
