# Germany Domain Review

Date: 2026-04-20
Database: `db=de`
Scope: Germany-native collection for `B1`, `B2`, `B3`

## Capture Status

- Captured and normalized:
  - `telc.net`
  - `goethe.de`
  - `make-it-in-germany.com`
  - `pflege.de`
  - `deutschakademie.de`
  - `speexx.com`
  - `berlitz.com`
  - `lingoda.com`
  - `sz.fau.de`
  - `heiskills.uni-heidelberg.de`
  - `haufe-akademie.de`
  - `managerseminare.de`
  - `bitkom-akademie.de`
  - `aiactacademy.de`
  - `aiact-akademie.de`
  - `ist.de`
  - `anacision.de`
  - `akademie-heidelberg.de`
  - `tuev-sued.de`
  - `tuev-nord.de`
- Captured but not normalized into a stable domain path:
  - `mhh.de`
  - raw files exist, but payload is mostly metadata-only and did not yield a usable normalized domain report

## B1 Review

### Keep

- `telc.net`
  - Strongest direct exam-intent layer.
  - Clear families: `telc b1 prüfung`, `telc b2 prüfung`, `b1 telc prüfung`, `telc b2 probeprüfung`.
- `make-it-in-germany.com`
  - Useful route/problem proxy for immigration and employment context.
  - Not a product analog, but useful for route language and healthcare migration framing.

### Benchmark Only

- `goethe.de`
  - Strong exam brand benchmark, but rankings are overwhelmingly broad brand traffic.
  - Useful as institutional reference, weak as a product-keyword source for `B1`.

### Drop From Core Follow-up

- `pflege.de`
  - Large healthcare site, but keyword set is generic care/legal/benefits content, not language or exam demand.
- `deutschakademie.de`
  - Broad German learning and grammar SEO, not nursing-specific.
- `speexx.com`
  - Mostly branded and generic HR/blog traffic.
- `berlitz.com`
  - Mostly branded language-school traffic in the captured DE slice.

## B2 Review

### Keep

- `lingoda.com`
  - Best provider-level signal in this cluster because `Lingoda Care` gives healthcare-adjacent language framing.
  - Still not a pure medical-French analog, but meaningfully closer than generic brands.

### Drop From Core Follow-up

- `berlitz.com`
  - Too brand-heavy in this slice.
- `speexx.com`
  - Too B2B-general and not medical-French specific.
- `sz.fau.de`
  - University ecosystem noise; almost entirely institutional traffic.
- `heiskills.uni-heidelberg.de`
  - University ecosystem noise; not useful for offer-level demand.
- `mhh.de`
  - Raw capture exists, but extraction yielded metadata-only output and no useful keyword family.

## B3 Review

### Keep

- `aiact-akademie.de`
  - Best niche AI Act / Article 4 evidence in the current DE set.
  - Useful families: `eu ai act art 4`, `ai act article 4`, `art 4 ki verordnung`, `eu ai act deutsch`.
- `akademie-heidelberg.de`
  - Good seminar/compliance proxy.
  - Useful families: `geldwäsche schulung`, `compliance beauftragter seminar`, `at 9 marisk`.
- `bitkom-akademie.de`
  - Useful broader digital/AI training benchmark.
  - Relevant family observed: `ki manager`.

### Watch

- `aiactacademy.de`
  - Topical exact-match niche domain, but current SEMrush footprint is effectively empty (`n/a` level domain summary).
  - Keep as niche watchlist, not as active keyword source yet.
- `anacision.de`
  - Small footprint, but some AI-adjacent phrasing exists.
  - Better as message-mining/watchlist than as primary demand source.

### Drop From Core Follow-up

- `haufe-akademie.de`
  - Too broad; rankings dominated by unrelated business/HR content.
- `managerseminare.de`
  - Too broad and management-media heavy.
- `ist.de`
  - Strong traffic, but almost entirely unrelated education categories.
- `tuev-sued.de`
  - Captured DE slice is dominated by driving-school/service flows, not training demand relevant to `B3`.
- `tuev-nord.de`
  - Same issue: strong brand and service traffic, weak relevance to the target AI training lane.

## Current Best Germany-Native Source Set

### B1

- `telc.net`
- `make-it-in-germany.com`
- `goethe.de` as benchmark only

### B2

- `lingoda.com`

### B3

- `aiact-akademie.de`
- `akademie-heidelberg.de`
- `bitkom-akademie.de`
- `aiactacademy.de` as watchlist
- `anacision.de` as watchlist

## Practical Next Step

The next collection pass should not continue with more domain-overview scraping. The next useful layer is `Keyword Overview` on top of the surviving Germany-native families:

- `B1`
  - `telc b1 prüfung`
  - `telc b2 prüfung`
  - `deutsch pflege`
- `B2`
  - use `Lingoda Care`-derived problem/offer phrases and then test direct medical-French anchors
- `B3`
  - `ki schulung`
  - `ai act schulung`
  - `ki kompetenz schulung`
  - `eu ai act art 4`
  - `art 4 ki verordnung`
