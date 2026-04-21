# Germany Market Collection Plan

This plan covers only the `DE` database work that still matters after the Luxembourg pass.

It has two separate goals:

1. `Germany-local evidence`
2. `cross-border Luxembourg-intent evidence`

Do not merge them.

## Scope

Germany is relevant for this project in two different ways:

- some product hypotheses need true Germany-local evidence
- some Luxembourg-relevant users may search from Germany for Luxembourg outcomes

Those are different evidence classes and must stay separate.

## Evidence model

### 1. `germany_local`

Use when:

- capture is in `db=DE`
- the query does **not** explicitly target Luxembourg

Use for:

- `B1`
- `B2`
- `B3`

This is valid Germany-native market evidence.

### 2. `cross_border_luxembourg_intent`

Use when:

- capture is in `db=DE`
- the query explicitly targets Luxembourg

Allowed Luxembourg markers:

- `luxembourg`
- `luxemburg`
- `luxembourgish`
- `luxemburgisch`
- `letzebuergesch`
- `lëtzebuergesch`
- `sproochentest`

Use this only to support Luxembourg products.

## Priority order

Run Germany collection in this order:

1. `B1`
2. `B2`
3. `B3`
4. optional `DE cross-border Luxembourg-intent` refresh for Luxembourg cards

This keeps the remaining scorecard gaps on the critical path.

## Product clusters

### Cluster A: German exam / Pflege

Products:

- `B1` German for Nurses (B1->B2 Pflege Sprint)

Primary question:

- is there enough Germany-side non-branded demand around nursing German and exam readiness to support a specialized offer?

Recommended source domains:

- `telc.net`
- `goethe.de`
- `pflege.de`
- `deutschakademie.de`
- `berlitz.com`
- `speexx.com`

Anchor keywords:

- `telc b1 prüfung`
- `telc b2 prüfung`
- `deutsch pflege`
- `deutsch für pflegekräfte`
- `berufsdeutsch pflege`

Problem / proxy keywords:

- `sprachprüfung pflege`
- `deutsch test pflege`
- `b2 deutsch pflege`
- `anerkennung pflege deutsch`
- `deutsch lernen krankenhaus`

Success condition:

- visible non-branded demand survives beyond generic exam traffic
- nursing / healthcare phrasing is real, not just generic language-test noise

### Cluster B: Medical French in Germany market

Products:

- `B2` Medical French for Nurses

Primary question:

- does German search behavior show a real Germany-native need for job-linked medical French, or is this product still too synthetic?

Recommended source domains:

- `berlitz.com`
- `speexx.com`
- `lingoda.com`
- any clearly relevant healthcare-language provider that appears in SERP

Anchor keywords:

- `französisch für pflegekräfte`
- `medizinisches französisch`
- `französisch im krankenhaus`
- `französisch pflege`
- `berufsfranzösisch pflege`

Problem / proxy keywords:

- `arbeiten in luxemburg französisch`
- `französisch für medizin`
- `pflege luxemburg sprache`
- `französisch für gesundheitsberufe`

Success condition:

- either direct Germany-native demand exists
- or a strong proxy cluster exists around healthcare work and French requirements

Failure condition:

- only generic “learn French” traffic appears
- no healthcare/job-linked phrasing survives

### Cluster C: AI literacy in Germany-adjacent market

Products:

- `B3` AI Literacy (EU-wide remote)

Primary question:

- is there Germany-side demand for AI literacy training that is strong enough to support a broader EU-remote offer?

Recommended source domains:

- `haufe-akademie.de`
- `manager-seminare.de`
- `bitkom-akademie.de`
- `tuev` training properties if they appear in SERP

Anchor keywords:

- `ki schulung`
- `ki kompetenz schulung`
- `ki literacy`
- `ai literacy training`
- `ai act schulung`

Problem / proxy keywords:

- `ki verordnung schulung`
- `ki compliance schulung`
- `mitarbeiter ki schulen`
- `artikel 4 ki verordnung`

Success condition:

- non-branded training demand is visible
- AI Act / literacy / staff-training phrasing exists as a real cluster

Failure condition:

- only broad AI-learning noise appears
- no staff-training or compliance-oriented lane survives

## Germany cross-border Luxembourg-intent

Use this only after `B1/B2/B3` are closed.

This is not Germany product evidence.
It is support evidence for Luxembourg products.

Recommended queries:

- `luxemburgisch kurs`
- `luxemburgisch online kurs`
- `luxemburgisch lernen`
- `sproochentest`
- `sproochentest luxemburg`
- `weiterbildung luxemburg`

Use for:

- message mining
- commuter-side behavior
- missed-opportunity discovery

Do not score these as `germany_local`.

## Capture protocol

Use the same deterministic protocol:

1. one existing tab
2. one database only: `DE`
3. one report type at a time
4. capture `top`
5. capture `metrics`
6. capture `table`

Do not move to the next product until the current product’s Germany slice is complete.

## Minimal first pass

If time is limited, do this only:

1. `B1`
   - `telc b1 prüfung`
   - `telc b2 prüfung`
   - `deutsch pflege`
2. `B2`
   - `französisch für pflegekräfte`
   - `medizinisches französisch`
   - `arbeiten in luxemburg französisch`
3. `B3`
   - `ki schulung`
   - `ai act schulung`
   - `ki kompetenz schulung`

This is enough to decide whether Germany gives:

- direct adjacent demand
- proxy-only adjacent demand
- or weak adjacent demand

## Output expectation

After the Germany pass, each of `B1`, `B2`, `B3` should have:

- `evidence_database = DE`
- `scope_class = adjacent_generic`
- anchor capture counts
- query volume sum
- one short verdict:
  - `direct adjacent demand exists`
  - `proxy-only adjacent demand`
  - `weak adjacent demand`

## Starting domain pack

Reusable seed files:

- [de-domain-pack.json](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/config/de-domain-pack.json)
- [de-domain-pack.md](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/config/de-domain-pack.md)
