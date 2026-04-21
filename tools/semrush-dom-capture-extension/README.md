# SEMrush DOM Capture Extension

Chrome extension for collecting raw SEMrush page data without OCR.

## What it captures

- Page metadata:
  - URL
  - `db`
  - query/domain
  - report type
- Rendered page slices at three scroll stops:
  - `top`
  - `metrics`
  - `table`
- Visible tables in the viewport and in the full document
- Visible headings, links, text, and DOM fragments
- Intercepted `fetch` / `XMLHttpRequest` payloads from `seMrush.com`

## Why this exists

SEMrush screenshot capture is too fragile for repeated research. This extension downloads a raw JSON artifact from the current page so we can inspect:

- what is really in the DOM
- what arrives over the network
- which selectors and payloads are stable enough for a stricter collector later

## Load in Chrome

1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select this folder:

   `/Users/sergey/Desktop/educateme-map/tools/semrush-dom-capture-extension`

5. Refresh your open SEMrush tab once, so the content script and bridge are injected on page load.

## Recommended first test

Use one page of each type:

- `Keyword Overview`
- `Domain Overview`
- `Organic Rankings`
- `Competitors`

Then:

1. Open the target SEMrush page.
2. Click the extension icon.
3. Click `Capture current page`.
4. If you need page-load network responses, click `Reload page, then capture`.
5. A `.json` file will download locally.

## Notes

- `Capture current page` is enough for DOM inspection.
- `Reload page, then capture` is better when you want network payloads from the original page load.
- Downloaded files can be large because they include the full rendered DOM.
- This is a discovery collector, not a final production scraper.

## Next step after first capture

Run the helper script on the downloaded JSON:

```bash
node /Users/sergey/Desktop/educateme-map/scripts/inspect-semrush-capture.mjs /path/to/capture.json
```

That will show:

- report metadata
- segment names
- table counts
- top network endpoints
- likely JSON payload candidates

Normalize one or more raw captures into the split corpus:

```bash
npm run research:v2:normalize-semrush-capture -- /path/to/capture.json
```

Storage design:

- [SEMrush corpus storage](/Users/sergey/Desktop/educateme-map/docs/research-v2/10-semrush-corpus-storage.md)
