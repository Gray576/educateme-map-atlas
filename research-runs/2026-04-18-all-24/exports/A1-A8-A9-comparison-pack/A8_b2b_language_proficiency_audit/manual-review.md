# Manual Review - A8 - B2B Language Proficiency Audit

## Product

- Code: A8
- Title: B2B Language Proficiency Audit
- Run id: 2026-04-18-all-24
- Seed status: rerun_from_legacy_card

## Release status

- review
- reason: one structural claim was verified, two competitor claims were contradicted, and the numeric claim plus several internal hypotheses remain unresolved.

## Blocking questions

1. A mini-audit can work as a free lead magnet.
   Reason: This is a go-to-market hypothesis, not an externally verified fact.

2. The product will cover 20-100 employees per audit.
   Reason: This is a design choice from the card and was not externally verified.

3. Margin will be 70-75%.
   Reason: Margin is an internal commercial estimate, not a public fact.

4. A pilot with three companies is enough to validate the framework.
   Reason: This is an execution plan, not an externally checkable statement.

## Unresolved contradictions

1. [high] Pearson, Cambridge and Pipplet are generic, English-focused competitors.
   Problem: Pearson and Cambridge are English-centered, but Pipplet and Allingua are multilingual and Luxembourg-linked. The blanket market framing does not survive contradiction search.
   Sources: pearson_versant, cambridge_workplace_exams, cambridge_skills_test_business, allingua_about, pipplet_luxembourgish

2. [medium] Nobody does a Luxembourg-specific trilingual language audit.
   Problem: The absolute uniqueness claim is too strong. Luxembourg-based multilingual assessment and Luxembourgish organizational testing already exist, even if no exact clone of the proposed package was found.
   Sources: allingua_about, pipplet_luxembourgish

## Legacy manual review carryover

1. assessment-methodology - Before launch, define the CEFR rubric and whether the audit is psychometric enough to stand up to buyer scrutiny.
2. privacy-design - Employee-level reporting should be reviewed for data protection and internal HR policy fit.

## Provenance failures

1. Zero-source external claim - 78% of employers use language tests.

No dangling source ids detected.

## Fields demoted to unknown by default

1. jurisdiction_scope
2. target_audience_summary
3. Any field synthesized from contradicted claims
4. Claims with zero source ids
5. Any internal hypothesis currently shown as if it were fact
6. Any external claim with zero source ids

## Required next checks

1. Find a primary public source for the 78% figure or delete the number.
2. Collect a public product page if the team wants Luxembourg scope to be shown as a verified dashboard field.
3. Write the CEFR rubric and psychometric method before exposing per-employee diagnostics externally.

## Reviewer notes

- Safe dashboard surface is intentionally tiny: verification summary and hard blockers only.
- The rerun is useful because it falsified the uniqueness story and blocked weak scope inference.
