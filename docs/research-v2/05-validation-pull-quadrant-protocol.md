# Validation Velocity × Demand Pull Quadrant

This document adds a second decision layer on top of the evidence-first research system.

The goal is not to replace verification.
The goal is to rank verified opportunities by:

- how fast they can be validated inside a constrained budget
- how much observable market pull already exists

This must sit on top of the v2 research pipeline, not instead of it.

## Why this quadrant is useful

Classic `Impact × Effort` is too weak this early.

At this stage:

- impact is mostly speculation
- build effort is not the right bottleneck
- the actual question is:
  - how fast can we get a real pass/kill signal?
  - how much paid or commercial pull is already visible in the market?

So the two axes are:

- `X = Validation Velocity`
- `Y = Demand Pull Intensity`

## Axis definitions

### X - Validation Velocity

Definition:

How cheaply and quickly we can get a credible pass/kill signal inside a validation budget, before building a full product.

Right side means:

- clear experiment
- binary success threshold
- low cost-to-signal
- short time-to-first-signal
- low dependence on one founder

Left side means:

- signal only appears after heavy build or custom delivery
- test needs deep operational setup
- founder involvement is hard to remove

### Y - Demand Pull Intensity

Definition:

Observed commercial pull in the target region right now.

Not TAM.
Not abstract market size.
Not pitch-deck upside.

Use observable proxies:

- search volume
- commercial intent
- CPC
- competitive density
- paid competition
- visible prices
- recurrence / repeat structure

## Scoring model

Use one underlying scorecard and collapse it into two axes.

### Base criteria and weights

| Criterion | Weight | How to measure |
|---|---:|---|
| Demand evidence | 20% | search volume, intent, paid activity, competitor presence |
| Willingness to pay | 15% | observed prices and price acceptance in category |
| CAC reality in WE | 15% | SEO difficulty, paid density, obvious channel fit |
| Retention / repeat structure | 10% | one-shot vs repeat vs recurring revenue path |
| Testability inside €5K | 15% | clean test with binary pass/fail |
| Time-to-first-€ | 10% | days until first real money, not vanity signals |
| Founder-independence | 10% | can the hypothesis be tested and run without Sasha doing everything? |
| Regulatory friction (inverse) | 5% | GDPR, cooling-off, regulated claims, certification load |

Recommended quiet add-ons:

- `Macro trajectory` 5% shadow weight
- `Channel fit` uplift inside CAC reality
- `Portfolio correlation` not as a row score, but as a portfolio constraint on wave selection

### Collapse formulas

Velocity composite:

- `Validation Velocity = Testability + Time-to-first-€ + Founder-independence`

Pull composite:

- `Demand Pull = Demand evidence + Willingness to pay + CAC reality + Retention`

Do not collapse regulatory friction into the Y axis directly.
Use it as:

- negative modifier
- or release note on the plot

## Critical design rules

### 1. Separate B2B and B2C quadrants

Do not plot B2B and B2C together.

Reason:

- B2B validation usually means customer discovery, outreach, pilot, and sales cycle
- B2C validation can often run through landing page, paid traffic, checkout, waitlist, or light pre-sell

One shared plot will systematically mis-rank B2B.

Use:

- one score model
- two visual plots:
  - `B2B quadrant`
  - `B2C quadrant`

### 2. Founder-independence is a real weight

This is not a soft note.
It directly changes priority.

If a hypothesis requires constant founder presence to validate or deliver, that is a structural penalty.

### 3. Regulatory friction is not cosmetic

In Western Europe, this can dominate the early economics.

Examples:

- mandatory route or accreditation requirements
- regulated claims
- subsidy exclusions
- cooling-off rights
- GDPR sensitivity

### 4. Channel fit matters more than abstract market size

If the market is large but we have no credible acquisition route, the pull is weaker than it looks.

So `CAC reality` must explicitly include:

- current audience access
- SEO opportunity
- partner route
- referral flywheel
- outbound feasibility

### 5. Correlation matters at portfolio level

Do not select a first wave of 3-5 ideas that all depend on:

- the same channel
- the same founder
- the same buyer
- the same price point

The scorecard ranks ideas.
The correlation matrix chooses the final portfolio.

## What must be added to the research card

These are new fields for the `commercial validation` layer.

They should not live in the evidence-first truth card.
They should live in a separate validated operator layer.

### Commercial validation fields

- `quadrant_segment`
  - `B2B` or `B2C`
- `validation_model`
  - e.g. landing + ads, pre-sell, 10 custdev + LOI, partner pilot, outbound sprint
- `binary_pass_signal`
  - exact threshold that counts as pass
- `binary_kill_signal`
  - exact threshold that counts as kill
- `estimated_cost_to_signal_eur`
- `estimated_days_to_signal`
- `estimated_days_to_first_euro`
- `founder_dependence_score`
- `regulatory_friction_score`
- `retention_structure`
- `channel_fit_notes`
- `macro_trajectory_notes`
- `portfolio_tags`
  - niche, persona, channel, price point, delivery mode

### SEMrush / market observables fields

- `semrush_market`
- `semrush_database`
- `semrush_language`
- `keyword_set_version`
- `keyword_count_total`
- `keyword_count_commercial`
- `volume_sum`
- `volume_sum_commercial`
- `avg_cpc`
- `max_cpc`
- `avg_competitive_density`
- `high_intent_keyword_count`
- `paid_competitor_count`
- `top_paid_competitors`
- `observed_price_points`
- `serp_feature_notes`
- `traffic_analytics_notes`

## SEMrush collection brief

Use official Semrush metrics, not improvised names.

Confirmed from official docs:

- `Intent`
- `Volume`
- `Trend`
- `Keyword Difficulty`
- `CPC`
- `Competitive Density`
- `SERP Features`
- `Results`

Sources:

- [Keyword Overview](https://www.semrush.com/kb/257-keyword-overview)
- [Search Volume in Semrush](https://www.semrush.com/kb/683-what-is-search-volume-in-semrush)
- [Keyword Magic Tool](https://www.semrush.com/kb/617-keyword-magic-tool-manual)
- [Advertising Research](https://www.semrush.com/features/advertising-research/)
- [Traffic Analytics](https://www.semrush.com/kb/1506-traffic-and-market-traffic-overview)

### Exact SEMrush reports to use

1. `Keyword Overview`
   - for top terms
2. `Keyword Magic Tool`
   - for expansion, filtering, and intent segmentation
3. `Advertising Research`
   - for paid competitors, paid keyword overlap, ad spend signals
4. `Traffic Analytics`
   - for domain-level sanity checks on visible competitors

### What to collect per keyword

- keyword
- market / country database
- language
- intent
- volume
- trend
- CPC
- competitive density
- KD%
- SERP features
- result count

### What to collect per competitor domain

- domain
- paid competitor status
- common paid keywords
- estimated paid traffic
- estimated ad spend
- top paid keywords
- observed ad copy themes

### Which keywords to check

Build 4 keyword buckets per product.

#### Bucket A - head terms

Core category terms:

- `oet preparation luxembourg`
- `mifid ii training luxembourg`
- `ai literacy training luxembourg`

#### Bucket B - commercial modifiers

Add modifiers:

- `course`
- `training`
- `workshop`
- `certification`
- `prep`
- `classes`
- `online`
- `for nurses`
- `for doctors`
- `for finance`
- `corporate`
- `team`
- `company`

#### Bucket C - problem-intent terms

Buyer/problem phrasing:

- `prepare nurses for oet`
- `cssf training provider`
- `luxembourg onboarding employees language`

#### Bucket D - competitor / route terms

- incumbent provider + category
- alternative route keywords
- official route / exam / provider list terms

### Keyword handling rules

- B2C:
  emphasize transactional and commercial intent terms
- B2B:
  include service/problem keywords and provider-route keywords, not just end-user search terms
- multilingual markets:
  run English, French, German, and local-language variants where relevant
- always record the exact database used

## Decision rules for the quadrant

### Promote to first wave only if

- score is high
- confidence in the score is high
- the experiment is cheap enough
- portfolio correlation is acceptable

### Do not promote automatically if

- pull looks high but regulation blocks fast testing
- validation still depends on founder-heavy delivery
- pull depends on one keyword cluster with no channel backup

## What this layer still cannot solve alone

- it does not replace customer interviews
- it does not prove willingness to pay on its own
- it can overstate pull in regulated or partner-controlled categories
- it can understate good B2B opportunities with weak search but strong outbound / partner paths

So treat the quadrant as:

- communication artifact
- prioritization aid
- not sole decision maker
