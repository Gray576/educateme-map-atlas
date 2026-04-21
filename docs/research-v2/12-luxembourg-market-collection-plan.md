# Luxembourg Product Market Collection Plan

This plan covers only products that should be evaluated against the Luxembourg market.

It does **not** cover:

- generic `DE/FR` adjacent products
- global/reference products such as OET
- licensing/pipeline products where search is not yet the main evidence layer

## Scope

These products are in scope:

- `L1` Sproochtest Preparation
- `A9` Integration Bundle (Sproochtest+)
- `L5` Luxembourgish for Business
- `A6` Expat Onboarding "Luxembourg Ready"
- `L3` French for Work & Business
- `A7` Professional French (sector-specific)
- `L4` Custom Corporate Language Programs
- `L2` Lëtz Care - Medical Luxembourgish
- `A8` B2B Language Proficiency Audit
- `A5` MiFID II Compliance Training
- `A10` CSRD/ESG Compliance Training
- `A4` AI for Finance & Compliance
- `A1` AI Literacy Workshop
- `A2` AI Productivity Day
- `A3` Prompt Engineering Workshop

## Evidence model

Use three levels only.

### 1. Local Luxembourg evidence

Captured in `db=LU`.

This is the strongest search-market signal for Luxembourg products.

### 2. Cross-border Luxembourg-intent evidence

Captured in `db=FR` or `db=DE`, but the query still clearly targets Luxembourg.

Allowed markers:

- `luxembourg`
- `luxembourgeois`
- `luxembourgish`
- `letzebuergesch`
- `lëtzebuergesch`
- `sproochentest`

This matters because many people who work in Luxembourg search from France or Germany.

### 3. Generic adjacent evidence

Captured in `db=FR` or `db=DE`, but without clear Luxembourg intent.

Use this only for:

- message mining
- proxy discovery
- category framing

Do **not** count it as Luxembourg market proof.

## Collection principle

For each cluster:

1. Start with whole-market source domains.
2. Extract relevant keyword families from those domains.
3. Split them into:
   - `direct`
   - `problem`
   - `proxy / route`
4. Validate the product against those keyword families.

This is better than looking only for exact product pages.

## Cluster plan

### Cluster A: Luxembourgish route and nationality

Products:

- `L1`
- `A9`
- `L5`
- `L2`

Primary question:

- Is there enough route-driven Luxembourgish demand to justify prep, business, and specialized language offers?

LU source domains:

- `educateme.lu`
- `inll.lu`
- `prolingua.lu`
- `luxlanguages.lu`
- `inlingua.lu`
- `luxlessons.lu`
- `sproochentest.etic.lu`
- `moienasbl.lu`
- `lifelong-learning.lu`
- `unipop.lu`

LU anchor keywords:

- `sproochentest`
- `sproochentest luxembourg`
- `cours luxembourgeois`
- `cours de luxembourgeois`
- `learn luxembourgish online`
- `luxembourgish online course`
- `apprendre luxembourgeois`

Problem / proxy keywords:

- `sproochentest examples`
- `inscription sproochentest`
- `remboursement sproochentest`
- `cours luxembourgeois en ligne`
- `cours intensifs luxembourgeois`

Cross-border Luxembourg-intent keywords for `FR/DE`:

- `cours de luxembourgeois`
- `cours de luxembourgeois en ligne`
- `cours luxembourgeois`
- `learn luxembourgish online`
- `luxembourgish online course`
- `sproochentest`
- `sproochentest luxembourg`
- `sproochentest examples`

Success condition:

- strong non-branded keyword family exists
- multiple incumbents rank on route terms
- our anchor terms overlap with live market language

### Cluster B: Integration and adult-education discovery

Products:

- `A6`

Primary question:

- Is there search-visible demand around Luxembourg onboarding, integration, evening courses, and continuing education that can support an onboarding product?

LU source domains:

- `infpc.lu`
- `lifelong-learning.lu`
- `moienasbl.lu`
- `unipop.lu`
- `inll.lu`
- `educateme.lu`

LU anchor keywords:

- `cours du soir luxembourg`
- `formation continue luxembourg`
- `formation professionnelle luxembourg`
- `service de la formation des adultes`
- `learn luxembourgish online`

Problem / proxy keywords:

- `cours en ligne luxembourg`
- `cours luxembourgeois en ligne`
- `cours intensifs luxembourgeois`
- `adult education luxembourg`

Cross-border Luxembourg-intent keywords for `FR/DE`:

- `formation continue luxembourg`
- `cours du soir luxembourg`
- `cours de luxembourgeois`
- `learn luxembourgish online`

Success condition:

- visible discovery infrastructure exists
- route/proxy layer is strong enough to support onboarding demand
- not necessarily direct employer proof yet, but category entry route is real

### Cluster C: French and general language training in Luxembourg

Products:

- `L3`
- `A7`
- `L4`
- `A8`

Primary question:

- Is there enough Luxembourg-local language-course demand, and can it support B2B or mixed B2B2C offers?

LU source domains:

- `institut-francais-luxembourg.lu`
- `prolingua.lu`
- `inlingua.lu`
- `luxlanguages.lu`
- `inll.lu`
- `lifelong-learning.lu`
- `unipop.lu`

LU anchor keywords:

- `cours de français luxembourg`
- `french courses luxembourg`
- `french classes luxembourg`
- `language courses luxembourg`
- `cours de langue luxembourg`
- `language school luxembourg`

Problem / proxy keywords:

- `cours du soir luxembourg`
- `formation continue luxembourg`
- `workplace language training`

Cross-border Luxembourg-intent keywords for `FR/DE`:

- `cours de français luxembourg`
- `french courses luxembourg`
- `language courses luxembourg`
- `language school luxembourg`
- `cours de langue luxembourg`

Success condition:

- Luxembourg-specific language-course demand is visible
- institutional and private players both appear
- we can separate general category demand from sector-specific wedge claims

### Cluster D: Compliance training in Luxembourg

Products:

- `A5`
- `A10`

Primary question:

- Is there search-visible demand for Luxembourg compliance training, not just broad regulatory content?

LU source domains:

- `houseoftraining.lu`
- `pwc.lu`
- `lifelong-learning.lu`
- `infpc.lu`
- `attf.lu`
- `ifsb.lu`
- `acams.org`

LU anchor keywords:

- `formation compliance luxembourg`
- `compliance officer formation`
- `mifid training luxembourg`
- `cssf training`
- `csrd training`
- `esg training luxembourg`

Problem / proxy keywords:

- `mifid compliance training`
- `cssf circular 17/670 training`
- `double materiality training`
- `esrs training`

Cross-border Luxembourg-intent keywords for `FR/DE`:

- `mifid training luxembourg`
- `esg training luxembourg`
- `formation compliance luxembourg`
- `cssf training luxembourg`

Success condition:

- Luxembourg-targeted compliance queries exist beyond generic legal noise
- incumbent domains show commercial training presence
- search language is close enough to our offer framing

### Cluster E: AI training for Luxembourg employers

Products:

- `A4`
- `A1`
- `A2`
- `A3`

Primary question:

- Is there Luxembourg-specific search demand for AI training offers, or are we mostly extrapolating from generic/global category language?

LU source domains:

- `houseoftraining.lu`
- `academy.openai.com`
- `openai.com`
- `lifelong-learning.lu`
- `pwc.lu`

LU anchor keywords:

- `ai training luxembourg`
- `ai literacy training`
- `ai act training`
- `ai workshop luxembourg`
- `ai productivity training`
- `prompt engineering training`
- `prompt engineering workshop`
- `ai act training luxembourg`

Problem / proxy keywords:

- `ai literacy compliance`
- `ai governance training`
- `financial institutions ai training`

Cross-border Luxembourg-intent keywords for `FR/DE`:

- `ai training luxembourg`
- `ai workshop luxembourg`
- `ai act training luxembourg`

Success condition:

- if Luxembourg-qualified AI terms have non-trivial search volume, keep search as a meaningful demand layer
- if not, treat search as weak and rely more on outbound / mandate / direct-sales validation

## Sequence

### Phase 1: Finish LU product scoring

Use:

- LU domain captures
- LU keyword-overview captures
- LU opportunities
- product scorecard

Current outputs:

- [LU shortlist](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/country-keywords/lu/lu-shortlist.json)
- [LU opportunities](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/country-keywords/lu/keyword-opportunities.json)
- [product scorecard](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/product-scorecard/product-market-scorecard.v1.json)

### Phase 2: Add cross-border Luxembourg-intent

Only for Luxembourg products.

Use these seeds:

- [FR Luxembourg-intent seeds](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/config/keyword-overview-seeds__fr__luxembourg-intent.json)
- [DE Luxembourg-intent seeds](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/semrush-corpus/config/keyword-overview-seeds__de__luxembourg-intent.json)

Important:

- these are not generic adjacent seeds
- they are allowed to support Luxembourg cards only because the query still points at Luxembourg

### Phase 3: Recompute scorecard

After `FR/DE` cross-border captures are normalized:

- recompute the product scorecard
- products may improve if they gain `cross_border_luxembourg_intent` support
- do not promote them based on generic `FR/DE` demand

## What counts as success for the whole Luxembourg plan

We should be able to answer, product by product:

1. Is there local Luxembourg search-visible demand?
2. Is there cross-border Luxembourg-intent demand from France or Germany?
3. Is our product phrasing aligned with real market language?
4. Are we leaning on direct, problem, or proxy keywords?
5. Is search actually a useful acquisition/input signal for this product, or only a weak context layer?

## What not to do

- Do not mix `LU` with generic `FR/DE`.
- Do not use `US` exam/reference demand to justify Luxembourg products.
- Do not assume all competitor domain traffic is relevant to our product.
- Do not treat a keyword as local proof unless its scope is explicitly classified.
