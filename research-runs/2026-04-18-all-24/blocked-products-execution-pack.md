# Blocked Products Execution Pack

Run: `2026-04-18-all-24`

## Status changes executed now

Promoted from `blocked` to `review` by narrowing release scope and keeping unsafe claims quarantined:
- `C1` — [manual review](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/C1_oet_prep_repriced/manual-review.md)
- `L6` — [manual review](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/L6_oet_nursing_preparation/manual-review.md)
- `L7` — [manual review](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/L7_oet_medical_preparation_doctors/manual-review.md)

Still require new external proof before they can move to `review`:
- `A5`
- `B2`
- `B5`
- `B6`

## Validation packets created

- `A5`: [next-validation-packet.md](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/A5_mifid_ii_compliance_training/next-validation-packet.md)
- `B2`: [next-validation-packet.md](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/B2_medical_french_for_nurses/next-validation-packet.md)
- `B5`: [next-validation-packet.md](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/B5_healthcare_recruitment_pipeline/next-validation-packet.md)
- `B6`: [next-validation-packet.md](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/B6_embedded_onboarding_for_staffing_agencies/next-validation-packet.md)

## Execution order

1. Run route-owner validation for `A5`, `B2`, `B5`, `B6`.
2. In parallel, run buyer validation for `B5` and `B6`.
3. Choose the first-country wedge for `B2` before any more research.
4. Run conversion experiments for `C1` after the route-safe rewrite.
5. Keep `L6` and `L7` in review-safe wording until premium or broad-scope claims are independently proven.
