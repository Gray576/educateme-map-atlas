# SEMrush Screenshot Review

Reviewed from `/Users/sergey/Desktop/educateme-map/hands` on 2026-04-19.

## Scope

- `101` PNG screenshots with OCR extracted into `/Users/sergey/Desktop/educateme-map/hands/ocr`
- `2` HTML files, but they were mostly SEMrush shell/SPA wrappers and not reliable numeric artifacts
- Screenshot mix is broad enough for a first commercial review:
  - `Organic Rankings`
  - `Organic Search Positions`
  - `Domain Overview`
  - `Competitors Table`
  - `Keyword Overview`

## Reliability Notes

- The screenshots are useful. They contain real visible metrics and keyword rows.
- OCR is imperfect. Some domains are misread, for example `houseoftraining.|u` instead of `houseoftraining.lu`.
- There are overlaps and duplicates across countries and domains. That is not a problem for insight extraction, but it means this set is better for directional review than for exact spreadsheet-grade import without manual cleanup.
- The HTML files should not be used as evidence for metrics. The PNGs are the real source here.

## Database Interpretation Rule

SEMrush here was used primarily through `database / country`, not through a separate language selector.

So the rule is:

- `db=LU` = local Luxembourg evidence, even when the query text is `FR`, `DE`, `LB`, or `EN`
- `db=FR` = France evidence
- `db=DE` = Germany evidence
- `db=US` / other large markets = reference-market evidence

This means:

- multilingual queries inside `db=LU` describe the local Luxembourg market
- screenshots from `db=FR`, `db=DE`, or `db=US` remain useful for adjacent market reading, phrasing, and keyword expansion, but they do not directly prove Luxembourg demand

## What Is Actually In The Set

### Luxembourg language / exam market

The strongest local cluster in the screenshot set is the Luxembourg language and Sproochtest market.

Representative artifacts:

- [prolingua.lu rankings](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gbhk.png)
- [houseoftraining.lu overview](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gcea.png)
- [inll.lu overview](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gdkp.png)
- [educateme.lu overview](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gdof.png)
- [educateme.lu positions](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gdxq.png)
- [luxlanguages.lu rankings](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-ggyc.png)
- [luxlessons.lu positions](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gmwu.png)
- [sproochentest.etic.lu positions](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gheo.png)

Key signals:

- `inll.lu` is the largest local authority domain in this cluster:
  - authority score around `36`
  - organic traffic around `26.9K`
  - paid traffic `0`
  - ref domains around `668`
- `houseoftraining.lu` also has a large footprint:
  - authority score around `33`
  - organic traffic around `7K`
  - paid traffic around `373`
  - ref domains around `774`
- `prolingua.lu` shows a meaningful Luxembourg footprint:
  - around `213` LU keywords
  - around `1.8K` traffic
  - around `$1.2K` traffic cost
- `educateme.lu` is much smaller than the main incumbents:
  - authority score around `10`
  - organic traffic around `417`
  - ref domains around `81`

This matters because the old cards often treated this category as lighter-weight or less visibly contested than it actually is.

### Educateme already ranks for real route keywords

`educateme.lu` is not starting from zero. The position screenshots show meaningful current rankings on route-driven and demand-relevant keywords:

- `sproochentest`
- `learn luxembourgish online`
- `luxembourgish online course`
- `learn luxembourgish`
- `sproochentest luxembourg`
- `language courses luxembourg`
- `sproochentest examples`
- `luxembourg national language`
- `learn luxembourgish language`

Representative artifact:

- [educateme.lu organic positions](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gdxq.png)
- [educateme.lu long-tail positions](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gedt.png)

Implication:

- For `L1`, `A9`, `L5`, and parts of `A6`, there is already visible SEO traction on route terms and learning-intent terms.
- This is stronger than a generic “we could maybe do SEO here” claim. It supports a concrete `channel_fit` argument.
- Because these screenshots were taken from `db=LU`, this is local evidence, not imported adjacent-market signal.

### Competitor keyword patterns are route-driven, not generic

The Luxembourg cluster is dominated by route and exam phrases rather than abstract “learn language” narratives.

Examples from competitor position screenshots:

- `sproochentest`
- `sproochentest luxembourg`
- `sproochentest lëtzebuergesch`
- `luxembourgish online course`
- `learn luxembourgish`
- `sprachschule luxemburg`
- `language school luxembourg`
- `french courses luxembourg`
- `cours intensifs luxembourgeois`

Representative artifacts:

- [inlingua positions](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gltk.png)
- [inlingua long-tail positions](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-glvh.png)
- [luxlessons positions](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gmwu.png)

Implication:

- Our keyword universe for Luxembourg products should skew more toward route queries and specific learning outcomes, and less toward vague product-title phrases.
- This supports rewriting SEMrush seed packs for `L1`, `A9`, `L5`, `L3`, `L4`, and `A7`.

## OET / Exam Prep Cluster

Representative artifacts:

- [oet.com rankings](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gepq.png)
- [oet.com positions](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gewo.png)

Key signals:

- `oet.com` has a strong branded exam ecosystem:
  - US around `3.8K` keywords
  - CA around `653`
  - LU almost zero
- High-signal queries include:
  - `oet`
  - `oet sample test`
  - `oet result`
  - `occupational english test sample`
  - `oet practice test`
  - `oet exam sample test`

Implication:

- For `C1`, `L6`, and `L7`, the market is real and keyword-rich, but the visible demand is mostly global exam demand, not Luxembourg-local demand.
- This helps in two ways:
  - It validates keyword strategy for content and acquisition.
  - It does **not** by itself prove local commercial pull in Luxembourg.

## German / General Exam / Language Authority Cluster

Representative artifacts:

- [telc rankings](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gfck.png)
- [telc positions](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gkky.png)
- [goethe rankings](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gfga.png)
- [cambridge rankings](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gfmv.png)
- [pearson rankings](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gfzh.png)

Key signals:

- `telc.net`:
  - DE around `38.1K` keywords
  - AT around `3K`
  - US around `2.3K`
- `goethe.de`:
  - DE around `183.9K`
  - AT around `18.1K`
  - US around `37.9K`
- `cambridgeenglish.org`:
  - US around `106.9K`
  - ES around `82.7K`
  - AT around `2.9K`
- `pearson.com`:
  - US around `1.4M`
  - UK around `214.9K`
  - AT around `1.3K`

Important nuance:

- These domains are excellent for discovering keyword families and exam intent patterns.
- They are poor direct proxies for Luxembourg-specific market size.

Implication:

- For `B1`, `A7`, `A8`, `L3`, and `L4`, these domains help define high-intent query structures and exam-prep buyer language.
- They should influence keyword buckets and copy hypotheses, not direct local revenue assumptions.
- Where the screenshots came from `db=DE` or other non-LU databases, they belong in the adjacent-evidence layer, not the local-Luxembourg proof layer.

## Compliance / Finance / Corporate Training Cluster

Representative artifacts:

- [houseoftraining.lu overview](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gcea.png)
- [pwc.lu rankings](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-ggga.png)
- [competitor table 1](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gasz.png)
- [competitor table 2](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gayk.png)
- [competitor table 3](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-gbcd.png)

Key signals:

- `houseoftraining.lu` and `pwc.lu` are real organic actors in Luxembourg corporate/compliance training.
- Overlap tables surfaced several additional relevant domains:
  - `lifelong-learning.lu`
  - `acams.org`
  - `attf.lu`
  - `infpc.lu`
  - `ifsb.lu`
  - `cc.lu`
  - `cnfpc.lu`
  - `performances.fr`
  - `efe.fr`
  - `m2iformation.fr`
  - `cegos.fr`
  - `eif.gov.ae`

Implication:

- For `A5`, `A10`, `A4`, `A1`, `A2`, `A3`, and `B3`, the competitor field in our cards is currently too narrow.
- We now have a stronger map of training incumbents, adjacent training aggregators, and overlap competitors.
- This is useful for both:
  - `verified_competitors` expansion candidates
  - `commercial_validation.keyword_buckets.competitor_route`
- Luxembourg incumbents and overlaps from `db=LU` count as local evidence. French domains such as `cegos.fr` or `efe.fr` should be treated as adjacent references, not as direct Luxembourg-demand proof.

## Healthcare / Institutional Adjacent Signals

Representative artifact:

- [charite.de rankings](/Users/sergey/Desktop/educateme-map/hands/SCR-20260419-ghxw.png)

Key signals:

- `charite.de` has a large German footprint but only a small Luxembourg footprint.
- This makes it more useful as an adjacent authority/domain-discovery artifact than as a direct competitor for our Luxembourg-facing healthcare products.

Implication:

- For `B2`, `B5`, and `B6`, large institutional healthcare domains should be treated as route/context references, not assumed demand proxies.

## New Competitor Domains Worth Adding

These are the main additions surfaced by the screenshot set that are worth carrying into the research layer:

- `lifelong-learning.lu`
- `infpc.lu`
- `ifsb.lu`
- `cc.lu`
- `cnfpc.lu`
- `attf.lu`
- `acams.org`
- `cflh.lu`
- `scholanova.lu`
- `unipop.lu`
- `moienasbl.lu`
- `apprentus.lu`
- `institut-francais-luxembourg.lu`
- `performances.fr`
- `efe.fr`
- `m2iformation.fr`
- `cegos.fr`
- `eif.gov.ae`

These are not all equal. Some are direct category competitors, some are overlap competitors, and some are route/context actors. But they materially improve our competitor map.

## What This Changes In The Cards

### Safe updates we can do now

The screenshot set is strong enough to justify updates to the following non-safe-fact but commercially useful layers:

- `commercial_validation.keyword_buckets`
- `commercial_validation.competitor domains`
- `commercial_validation.market proxy notes`
- `commercial_validation.channel fit notes`
- `commercial_validation.demand evidence notes`
- `commercial_validation.collection notes`

### What it improves immediately

For Luxembourg language products:

- `L1`
- `A9`
- `L5`
- `L3`
- `L4`
- `A7`

We can now say with more confidence:

- who the visible SEO incumbents are
- which route keywords actually carry traffic
- where Educateme already has traction
- which competitor domains deserve monitoring

For exam-prep products:

- `C1`
- `L6`
- `L7`
- `B1`

We can now improve:

- keyword universe
- exam-route phrasing
- distinction between global demand and Luxembourg-local demand

For compliance / AI / finance products:

- `A5`
- `A10`
- `A4`
- `A1`
- `A2`
- `A3`
- `B3`

We can now improve:

- incumbent map
- overlap competitor map
- route/training aggregator references

### What this does **not** prove

This screenshot set does **not** by itself prove:

- willingness to pay
- CAC reality
- conversion economics
- first-sale timeline
- founder independence
- exact Luxembourg demand size for globally large categories

Those still need either:

- cleaned SEMrush exports
- paid competitor data
- buyer validation
- or internal acquisition data

## Key Insights

1. The Luxembourg language / Sproochtest market is more visibly developed than our earlier light-weight keyword seeds suggested.
2. Educateme already has real SEO footholds on route-driven queries. This is strategically important.
3. The most useful keywords are not product-title phrases. They are route queries, exam phrases, and specific learning-intent terms.
4. Large global exam brands are useful for keyword pattern mining, but weak as Luxembourg market-size proxies.
5. The compliance/corporate cluster has more overlap competitors and training intermediaries than our current cards capture.
6. Local evidence and adjacent evidence must stay separate in notes and scoring.

## Recommended Next Review Plan

Do **not** continue taking random screenshots.

The next capture pass should be targeted.

### Priority 1: Luxembourg language / Sproochtest cluster

Capture only:

- top `20` organic positions for:
  - `educateme.lu`
  - `inll.lu`
  - `prolingua.lu`
  - `luxlanguages.lu`
  - `inlingua.lu`
  - `luxlessons.lu`
- country DB: `LU`

Why:

- This is the highest-value local cluster and the one where we already see direct route-fit.

### Priority 2: Compliance / finance / AI cluster

Capture only:

- competitor overlap tables for:
  - `houseoftraining.lu`
  - `pwc.lu`
  - `lifelong-learning.lu`
- top `20` organic positions for:
  - `houseoftraining.lu`
  - `pwc.lu`
- country DB: `LU`

Why:

- This will give a cleaner picture of commercial-intent training demand and overlap actors in Luxembourg.

### Priority 3: OET / healthcare exam cluster

Capture only:

- top `20` positions for `oet.com`
- `Keyword Overview` for:
  - `oet preparation`
  - `oet practice test`
  - `oet sample test`
  - `oet nursing`
- DBs: `US`, `UK`, and only then `LU` if available

Why:

- This is useful for keyword design and product framing, but local Luxembourg demand is unlikely to be visible directly.

## Recommendation On What Happens Next

The current set is already useful enough for a first structured update to the cards.

Recommended order:

1. Use the current screenshot review to update the `commercial_validation` layer and competitor notes.
2. Clean and narrow the keyword packs around route-driven terms.
3. Only then collect another screenshot round, but targeted by cluster as described above.

That is a better use of time than continuing unsystematic screenshot capture.
