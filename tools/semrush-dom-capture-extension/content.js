/* global NodeFilter, URL, chrome, document, navigator, setTimeout, window */

const NETWORK_EVENT_NAME = "semrush-dom-capture:network";
const NETWORK_LIMIT = 120;
const DOM_FRAGMENT_LIMIT = 60;
const LINK_LIMIT = 50;
const TABLE_LIMIT = 8;
const TEXT_LIMIT = 12000;
const HTML_FRAGMENT_LIMIT = 140000;

if (!window.__semrushDomCaptureLoaded) {
  window.__semrushDomCaptureLoaded = true;

  injectPageBridge();
  initializeRuntimeState();
  wireMessageHandlers();
  wirePageTrigger();
}

function injectPageBridge() {
  if (document.documentElement.dataset.semrushDomCaptureBridge === "loaded") {
    return;
  }

  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("page-bridge.js");
  script.dataset.semrushDomCaptureBridge = "true";
  script.async = false;
  document.documentElement.dataset.semrushDomCaptureBridge = "loaded";
  (document.documentElement || document.head || document.body).appendChild(script);
  script.remove();
}

function initializeRuntimeState() {
  window.__semrushDomCaptureState = {
    armedAt: new Date().toISOString(),
    network: [],
  };

  window.addEventListener(NETWORK_EVENT_NAME, (event) => {
    const entry = event.detail;

    if (!entry) {
      return;
    }

    const current = window.__semrushDomCaptureState.network;
    current.push(entry);

    if (current.length > NETWORK_LIMIT) {
      current.splice(0, current.length - NETWORK_LIMIT);
    }
  });
}

function wireMessageHandlers() {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "performCapture") {
      return undefined;
    }

    void performCapture(message)
      .then((summary) => sendResponse({ ok: true, summary }))
      .catch((error) =>
        sendResponse({ ok: false, error: String(error?.message || error) })
      );

    return true;
  });
}

function wirePageTrigger() {
  window.addEventListener("message", (event) => {
    if (event.source !== window) {
      return;
    }

    if (event.data?.type !== "semrush-dom-capture:trigger") {
      return;
    }

    void performCapture({
      autoDownload: event.data.autoDownload !== false,
      reason: event.data.reason || "page-trigger",
    }).catch((error) => {
      console.error("semrush-dom-capture trigger failed", error);
    });
  });
}

async function performCapture({ autoDownload = true, reason = "manual" } = {}) {
  await waitForPageReady();

  const page = getPageMetadata();
  const stops = getScrollStops(page.reportType);
  const segments = [];

  for (const stop of stops) {
    await scrollToStop(stop);
    segments.push(await captureSegment(stop.name));
  }

  const payload = {
    meta: {
      capturedAt: new Date().toISOString(),
      reason,
      page,
      userAgent: navigator.userAgent,
      networkEntriesCaptured: window.__semrushDomCaptureState.network.length,
      networkCollectorArmedAt: window.__semrushDomCaptureState.armedAt,
    },
    segments,
    structuredBlocks: extractStructuredBlocks(page.reportType),
    documentSnapshot: {
      html: document.documentElement.outerHTML,
      title: document.title,
      location: window.location.href,
      headings: collectHeadings(document),
      tables: collectTables(document, false),
    },
    network: [...window.__semrushDomCaptureState.network],
  };

  const filename = buildCaptureFilename(page);

  if (autoDownload) {
    await chrome.runtime.sendMessage({
      type: "downloadCapture",
      filename,
      payload,
    });
  }

  const summary = {
    filename,
    capturedAt: payload.meta.capturedAt,
    page,
    segmentCount: segments.length,
    networkEntriesCaptured: payload.network.length,
    documentTableCount: payload.documentSnapshot.tables.length,
    notes: payload.network.length
      ? "Network payloads captured"
      : "No network payloads captured; reload capture may be needed",
  };

  await chrome.runtime.sendMessage({
    type: "storeCaptureSummary",
    summary,
  });

  return summary;
}

async function waitForPageReady() {
  const maxAttempts = 60;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (document.readyState === "complete" && document.body) {
      break;
    }

    await sleep(500);
  }

  await sleep(700);
}

function getPageMetadata() {
  const url = new URL(window.location.href);
  const pathname = url.pathname;
  const db = url.searchParams.get("db") || null;
  const query = url.searchParams.get("q") || null;
  const searchType = url.searchParams.get("searchType") || null;

  let reportType = "unknown";

  if (pathname.includes("/analytics/keywordoverview")) {
    reportType = "keyword-overview";
  } else if (pathname.includes("/analytics/overview")) {
    reportType = searchType === "domain" ? "domain-overview" : "overview";
  } else if (pathname.includes("/analytics/organic/positions")) {
    reportType = "organic-positions";
  } else if (pathname.includes("/analytics/organic/competitors")) {
    reportType = "organic-competitors";
  }

  return {
    title: document.title,
    url: window.location.href,
    pathname,
    database: db,
    query,
    searchType,
    reportType,
  };
}

function getScrollStops(reportType) {
  if (reportType === "keyword-overview") {
    return [
      { name: "top", y: 0, settleMs: 350 },
      {
        name: "metrics",
        y: 700,
        settleMs: 2600,
        selectors: [
          '[data-path="overview.keyword_summary_widgets"]',
          '[data-testid="global-volume-widget"]',
          '[data-testid="keyword-ideas-widget"]',
        ],
      },
      {
        name: "table",
        y: 1500,
        settleMs: 3600,
        postScrollYOffset: 360,
        selectors: [
          '[data-testid="keyword-ideas-widget"]',
          '[data-testid="serp-analysis-widget"]',
        ],
      },
    ];
  }

  if (reportType === "domain-overview") {
    return [
      { name: "top", y: 0, settleMs: 350 },
      {
        name: "metrics",
        y: 650,
        settleMs: 2600,
        selectors: [
          '[data-at="keywords_by_intent"]',
          '[data-at="do-organic-keywords"]',
          '[data-at="do-organic-competitors"]',
        ],
      },
      {
        name: "table",
        y: 1450,
        settleMs: 3800,
        postScrollYOffset: 420,
        selectors: [
          '[data-at="do-organic-keywords"]',
          '[data-at="do-organic-competitors"]',
          '[data-at="backlinks"]',
        ],
      },
    ];
  }

  if (reportType === "organic-positions") {
    return [
      { name: "top", y: 0, settleMs: 350 },
      {
        name: "metrics",
        y: 650,
        settleMs: 2600,
        selectors: [
          '[data-at="positions-table-widget"]',
          '[data-at="at-positions"]',
        ],
      },
      {
        name: "table",
        y: 1200,
        settleMs: 4200,
        postScrollYOffset: 520,
        selectors: ['[data-at="positions-table-widget"]'],
      },
    ];
  }

  return [
    { name: "top", y: 0, settleMs: 350 },
    { name: "metrics", y: 700, settleMs: 2600 },
    { name: "table", y: 1500, settleMs: 3600, postScrollYOffset: 360 },
  ];
}

async function scrollToStop(stop) {
  if (stop.name === "top") {
    scrollPageTo(0);
    await waitForScrollSettle();
    await sleep(stop.settleMs || 1800);
    return;
  }

  const target = findScrollTarget(stop);

  if (target) {
    target.scrollIntoView({
      block: "start",
      inline: "nearest",
      behavior: "auto",
    });
    await sleep(400);

    const headerOffset = 120;
    scrollPageTo(Math.max(0, getPageY(target) - headerOffset));
    await waitForTargetInViewport(target);

    if (stop.postScrollYOffset) {
      scrollPageTo(window.scrollY + stop.postScrollYOffset);
      await waitForScrollSettle();
    }

    await sleep(stop.settleMs || 2600);
    return;
  }

  scrollPageTo(stop.y || 0);
  await waitForScrollSettle();
  if (stop.postScrollYOffset) {
    scrollPageTo(window.scrollY + stop.postScrollYOffset);
    await waitForScrollSettle();
  }
  await sleep(stop.settleMs || 2600);
}

function findScrollTarget(stop) {
  for (const selector of stop.selectors || []) {
    const element = document.querySelector(selector);

    if (element && isVisible(element)) {
      return element;
    }
  }

  return null;
}

function scrollPageTo(y) {
  const targetY = Math.max(0, Math.round(y));

  if (document.scrollingElement) {
    document.scrollingElement.scrollTo(0, targetY);
  }

  window.scrollTo(0, targetY);
}

function getPageY(element) {
  const rect = element.getBoundingClientRect();
  return rect.top + window.scrollY;
}

async function waitForScrollSettle() {
  let previousY = -1;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const currentY = Math.round(window.scrollY);

    if (currentY === previousY) {
      return;
    }

    previousY = currentY;
    await sleep(180);
  }
}

async function waitForTargetInViewport(target) {
  for (let attempt = 0; attempt < 18; attempt += 1) {
    if (intersectsViewport(target)) {
      await sleep(250);
      return;
    }

    await sleep(180);
  }
}

async function captureSegment(name) {
  return {
    name,
    scrollY: Math.round(window.scrollY),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    visibleHeadings: collectHeadings(document).slice(0, 20),
    visibleText: collectVisibleText(),
    visibleTables: collectTables(document, true),
    visibleLinks: collectLinks(),
    visibleDomFragments: collectVisibleDomFragments(),
  };
}

function extractStructuredBlocks(reportType) {
  const pageText = getNormalizedText(document.body);

  if (reportType === "domain-overview") {
    return {
      domainSummary: extractDomainOverviewSummary(),
      keywordsByIntent: extractIntentRows(),
      organicCompetitors: extractDomainOverviewCompetitors(),
      topOrganicKeywords: extractDomainOverviewTopKeywords(),
      backlinksSummary: extractBacklinksSummaryBlock(),
      topAnchors: extractBacklinksTable("Top Anchors"),
      referringDomains: extractBacklinksTable("Referring Domains"),
      indexedPages: extractIndexedPagesBlock(),
      diagnostics: {
        foundTopOrganicKeywords: Boolean(
          document.querySelector('[data-at="do-organic-keywords"]')
        ),
        foundOrganicCompetitors: Boolean(
          document.querySelector('[data-at="do-organic-competitors"]')
        ),
        foundBacklinks: Boolean(document.querySelector('[data-at="backlinks"]')),
      },
    };
  }

  if (reportType === "organic-positions") {
    const topRankingRows = extractOrganicPositionRows();

    return {
      domainRankingSummary: {
        keywords: getElementText(document.querySelector('[data-at="at-positions"]')),
        traffic: getElementText(document.querySelector('[data-at="summary-traffic"]')),
        trafficCost: getElementText(
          document.querySelector('[data-at="summary-traffic-cost"]')
        ),
      },
      topRankingRows,
      diagnostics: {
        foundPositionsTable: Boolean(
          document.querySelector('[data-at="positions-table-widget"]')
        ),
        extractedRows: topRankingRows.length,
      },
    };
  }

  if (reportType === "keyword-overview") {
    return {
      keywordSummary: extractKeywordOverviewSummary(pageText),
      keywordVariations: extractKeywordIdeaRows('[data-testid="keyword-ideas-widget"]'),
      questions: extractKeywordIdeaRows('[data-testid="questions-widget"]'),
      serpLeaders: extractSerpAnalysisRows(),
      diagnostics: {
        foundKeywordIdeas: Boolean(
          document.querySelector('[data-testid="keyword-ideas-widget"]')
        ),
        foundQuestions: Boolean(document.querySelector('[data-testid="questions-widget"]')),
        foundSerpAnalysis: Boolean(
          document.querySelector('[data-testid="serp-analysis-widget"]')
        ),
      },
    };
  }

  return {};
}

function collectVisibleText() {
  const parts = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const value = node.nodeValue?.replace(/\s+/g, " ").trim();

    if (!value) {
      continue;
    }

    const parent = node.parentElement;

    if (!parent || !isVisible(parent) || !intersectsViewport(parent)) {
      continue;
    }

    parts.push(value);

    if (parts.join("\n").length >= TEXT_LIMIT) {
      break;
    }
  }

  return parts.join("\n").slice(0, TEXT_LIMIT);
}

function extractDomainOverviewSummary() {
  return {
    authorityScore: cleanDomainSummaryMetric(
      getElementText(document.querySelector('[data-at="do-summary-as"]')),
      "Authority Score"
    ),
    organicTraffic: cleanDomainSummaryMetric(
      getElementText(document.querySelector('[data-at="do-summary-ot"]')),
      "Organic traffic"
    ),
    organicKeywords: cleanDomainSummaryMetric(
      getElementText(document.querySelector('[data-at="do-summary-ok"]')),
      "Organic keywords"
    ),
    trafficShare: cleanDomainSummaryMetric(
      getElementText(document.querySelector('[data-at="do-summary-ts"]')),
      "Traffic share"
    ),
    paidTraffic: cleanDomainSummaryMetric(
      getElementText(document.querySelector('[data-at="do-summary-pt"]')),
      "Paid traffic"
    ),
    paidKeywords: cleanDomainSummaryMetric(
      getElementText(document.querySelector('[data-at="do-summary-pk"]')),
      "Paid keywords"
    ),
    referringDomains: cleanDomainSummaryMetric(
      getElementText(document.querySelector('[data-at="do-summary-ref_domains"]')),
      "Ref.Domains"
    ),
    backlinks: cleanDomainSummaryMetric(
      getElementText(document.querySelector('[data-at="do-summary-bl"]')),
      "Backlinks"
    ),
  };
}

function extractIntentRows() {
  const section = document.querySelector('[data-at="keywords_by_intent"]');

  if (!section) {
    return [];
  }

  const labels = [...section.querySelectorAll('[data-at="intent-label"]')]
    .map((element) => getElementText(element))
    .filter(Boolean);
  const values = [...section.querySelectorAll('[data-at="intent-value"]')]
    .map((element) => getElementText(element))
    .filter(Boolean);

  if (!labels.length || !values.length) {
    return [];
  }

  const rows = [];

  for (let index = 0; index < Math.min(labels.length, values.length); index += 1) {
    const rawValue = values[index] || null;
    rows.push({
      intent: labels[index] || null,
      value: cleanIntentValue(rawValue, labels[index]),
      rawValue,
    });
  }

  return rows;
}

function extractDomainOverviewCompetitors() {
  const currentDomain = normalizeDomain(window.location.search ? new URL(window.location.href).searchParams.get("q") : null);
  const competitors = [
    ...document.querySelectorAll('[data-at="top-competitors-table"] [data-at="competitor"]'),
    ...document.querySelectorAll('[data-at="organic-competitor-chart"] [data-at="competitor"]'),
    ...document.querySelectorAll('[data-at="competitor"]'),
  ]
    .map((element) => getElementText(element))
    .filter(looksLikeDomainName)
    .filter((domain) => normalizeDomain(domain) !== currentDomain);

  return dedupeSimple(competitors).map((domain) => ({ domain })).slice(0, 20);
}

function extractDomainOverviewTopKeywords() {
  const rows = [];
  const links = [
    ...document.querySelectorAll(
      '[data-at="do-organic-keywords"] a[href*="/analytics/keywordoverview/"]'
    ),
    ...document.querySelectorAll('a[data-at="display-keyword"]'),
  ];

  for (const link of links) {
    const keyword = getElementText(link);

    if (!keyword) {
      continue;
    }

    const row = findClosestRow(link);
    const rowText = row
      ? getRowCellTexts(row).join(" | ")
      : getKeywordContextText(link, keyword);

    rows.push({
      keyword,
      rowText,
    });
  }

  return dedupeByKey(rows, (item) => item.keyword).slice(0, 20);
}

function extractBacklinksSummaryBlock() {
  const section = document.querySelector('[data-at="backlinks"]');
  return {
    text: getNormalizedText(section).slice(0, 3000),
  };
}

function extractBacklinksTable(title) {
  const section = findSectionByTitle(title);

  if (!section) {
    return [];
  }

  const rows = [];

  for (const row of section.querySelectorAll('[role="row"], tr')) {
    const cells = getRowCellTexts(row);

    if (cells.length >= 2) {
      rows.push(cells);
    }
  }

  return rows.slice(0, 20);
}

function extractIndexedPagesBlock() {
  const section =
    findSectionByTitle("Indexed Pages") || findSectionByTitle("Top Pages");

  if (!section) {
    return [];
  }

  const pages = [];

  for (const link of section.querySelectorAll('a[href^="http"], a[data-at="external-link"]')) {
    const href = link.href;

    if (!href || href.includes("semrush.com")) {
      continue;
    }

    pages.push({
      title: getElementText(link),
      url: href,
    });
  }

  return dedupeByKey(pages, (item) => item.url).slice(0, 20);
}

function cleanDomainSummaryMetric(value, label) {
  const text = String(value || "").replace(/\s+/g, " ").trim();

  if (!text) {
    return null;
  }

  let cleaned = text;

  if (label) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned.replace(new RegExp(`^${escaped}\\s*`, "i"), "");
  }

  cleaned = cleaned
    .replace(/Press "Tab" to enable graphical charts accessibility module\.?/gi, "")
    .replace(/\b(Fine|Good|Excellent|Poor)\b/gi, "")
    .replace(/^([0-9.,]+(?:K|M)?)(Fine|Good|Excellent|Poor|Average)$/i, "$1")
    .trim();

  return cleaned || null;
}

function cleanIntentValue(value, label) {
  const text = String(value || "").replace(/\s+/g, " ").trim();

  if (!text) {
    return null;
  }

  if (!label) {
    return text;
  }

  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`^${escaped}\\s*`, "i"), "").trim() || null;
}

function getKeywordContextText(link, keyword) {
  const candidates = [
    link.closest('[data-ui-name="Table.Row"]'),
    link.closest('[role="row"]'),
    link.closest("tr"),
    link.parentElement,
    link.closest("li"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const text = getNormalizedText(candidate);

    if (!text) {
      continue;
    }

    const cleaned = text.replace(keyword, "").trim();

    if (cleaned) {
      return cleaned;
    }
  }

  return null;
}

function extractKeywordOverviewSummary(text) {
  const summaryRoot =
    document.querySelector('[data-path="overview.keyword_summary_widgets"]') ||
    document.querySelector('[data-testid="global-volume-widget"]') ||
    document.body;
  const summaryText = getNormalizedText(summaryRoot);

  return {
    volume:
      getElementText(document.querySelector('[data-testid="volume-total"]')) ||
      getElementText(document.querySelector('[data-testid="global-volume-db-volume"]')) ||
      getMetricFromText(summaryText, "Volume"),
    keywordDifficulty: getMetricFromText(summaryText, "Keyword Difficulty"),
    globalVolume:
      getElementText(document.querySelector('[data-testid="global-volume-total"]')) ||
      getMetricFromText(summaryText, "Global Volume"),
    intent: getMetricFromText(summaryText, "Intent"),
    cpc: getMetricFromText(summaryText, "CPC"),
    competitiveDensity: getMetricFromText(summaryText, "Competitive Density"),
    results:
      getElementText(document.querySelector('[data-testid="results-in-serp-metric"]')) ||
      getMetricFromText(text, "Results"),
  };
}

function extractKeywordIdeaRows(widgetSelector) {
  const widget = document.querySelector(widgetSelector);

  if (!widget) {
    return [];
  }

  const rows = [];
  const links = widget.querySelectorAll(
    '[data-testid="suggestion-keyword"], a[data-path*=".table.keyword_cell.keyword_link"]'
  );

  for (const link of links) {
    const keyword = getElementText(link);

    if (!keyword) {
      continue;
    }

    const row = findClosestRow(link);
    const texts = row ? getRowCellTexts(row) : splitLines(getNormalizedText(link.parentElement));

    rows.push({
      keyword,
      rowText: texts.join(" | "),
      volume: findMetricInParts(texts, /^\d+(?:\.\d+)?[KM]?$/i),
    });
  }

  return dedupeByKey(rows, (item) => item.keyword).slice(0, 30);
}

function extractSerpAnalysisRows() {
  const rows = [];

  for (const row of document.querySelectorAll('[data-testid="serp-analysis-row"]')) {
    const cells = row.querySelectorAll('[role="cell"]');
    const position = getElementText(cells[0]);
    const externalUrlLink =
      row.querySelector('[data-testid="serp-table-url"] a[data-path$=".page_link"]') ||
      row.querySelector('[data-testid="serp-table-url"] a[target="_blank"]');
    const analyticsUrlLink =
      row.querySelector('[data-testid="serp-table-url"] a[data-path$=".organic_report_link"]') ||
      row.querySelector('[data-testid="serp-table-url"] a[href]');
    const domainLink = row.querySelector('.kwo-serp-table-result-cell__domain-container a');

    if (!position || !externalUrlLink) {
      continue;
    }

    rows.push({
      position,
      url: externalUrlLink.href,
      analyticsUrl: analyticsUrlLink?.href || null,
      domain: getElementText(domainLink),
      pageAuthority: getElementText(row.querySelector('[data-testid="serp-table-page-score"]')),
      refDomains: getElementText(row.querySelector('[data-testid="serp-table-ref-domains"]')),
      backlinks: getElementText(row.querySelector('[data-testid="serp-table-backlinks"]')),
      searchTraffic: getElementText(row.querySelector('[data-testid="serp-table-traffic"]')),
      urlKeywords: getElementText(row.querySelector('[data-testid="serp-table-url-keywords"]')),
    });
  }

  return rows.slice(0, 20);
}

function extractOrganicPositionRows() {
  const rows = [];
  const rowNodes = document.querySelectorAll(
    '[data-at="positions-table-widget"] [data-ui-name="Body.Row"], [role="row"][data-filled-columns]'
  );

  for (const row of rowNodes) {
    const keyword = getElementText(
      row.querySelector('[name="phrase"] [data-at="display-keyword"]')
    );
    const intents = [
      ...row.querySelectorAll('[name="intents"] [data-at^="intent-badge-"] span'),
    ]
      .map((element) => getElementText(element))
      .filter(Boolean);
    const position = getElementText(
      row.querySelector('[name="position"] [data-at="display-position"]')
    );
    const serpFeatures = getElementText(
      row.querySelector('[name="serpFeatures"] [data-at="display-sf"]')
    );
    const traffic = getElementText(
      row.querySelector('[name="traffic"] [data-at="display-number"]')
    );
    const trafficPercent = getElementText(row.querySelector('[name="trafficPercent"]'));
    const volume = getElementText(
      row.querySelector('[name="volume"] [data-at="display-number"]')
    );
    const kd = getElementText(
      row.querySelector('[name="keywordDifficulty"] [data-at="kd-value"]')
    );
    const url =
      row.querySelector('[name="url"] a[data-at="external-link"]')?.href ||
      row.querySelector('[name="url"] a[data-at="link"]')?.href ||
      null;
    const updated = getElementText(row.querySelector('[name="crawledTime"]'));

    if (!keyword || !position) {
      continue;
    }

    rows.push({
      keyword,
      intents,
      position,
      serpFeatures,
      traffic,
      trafficPercent,
      volume,
      kd,
      url,
      updated,
    });
  }

  return rows.slice(0, 50);
}

function collectTables(root, onlyVisible) {
  const tableNodes = [
    ...root.querySelectorAll("table, [role='table']"),
  ].filter((node) => (onlyVisible ? intersectsViewport(node) : true));

  return tableNodes.slice(0, TABLE_LIMIT).map((table, index) => ({
    index,
    selector: describeElement(table),
    headers: extractHeaders(table).slice(0, 20),
    rows: extractRows(table).slice(0, 20),
  }));
}

function findSectionByTitle(title) {
  const headings = [...document.querySelectorAll('[data-at="section-title"], h2, h3')];

  for (const heading of headings) {
    if (getElementText(heading) !== title) {
      continue;
    }

    return heading.closest(
      "section, [data-at], .kwo-widget-layout, .___SBox_1gmko_gg_, .___SBox_4905a-ko_"
    );
  }

  return null;
}

function findClosestRow(node) {
  return node.closest('[role="row"], tr, [data-ui-name="Body.Row"]');
}

function getRowCellTexts(row) {
  return [...row.querySelectorAll('[role="cell"], td, th')]
    .map((element) => getElementText(element))
    .filter(Boolean);
}

function getElementText(element) {
  return getNormalizedText(element);
}

function getNormalizedText(element) {
  return element?.textContent?.replace(/\s+/g, " ").trim() || "";
}

function splitLines(text) {
  return String(text || "")
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function getMetricFromText(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(text || "").match(new RegExp(`${escaped}\\s+([^\\n]+)`, "i"));
  return match ? match[1].trim() : null;
}

function looksLikeDomainName(value) {
  return /\b[a-z0-9.-]+\.[a-z]{2,}\b/i.test(value || "");
}

function normalizeDomain(value) {
  return String(value || "")
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .trim()
    .toLowerCase();
}

function dedupeSimple(items) {
  return [...new Set(items)];
}

function dedupeByKey(items, keyFn) {
  const seen = new Set();
  const output = [];

  for (const item of items) {
    const key = keyFn(item);

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(item);
  }

  return output;
}

function findMetricInParts(parts, regex) {
  for (const part of parts) {
    if (regex.test(part)) {
      return part;
    }
  }

  return null;
}

function collectLinks() {
  return [...document.querySelectorAll("a[href]")]
    .filter((anchor) => isVisible(anchor) && intersectsViewport(anchor))
    .slice(0, LINK_LIMIT)
    .map((anchor) => ({
      text: anchor.textContent?.replace(/\s+/g, " ").trim() || "",
      href: anchor.href,
      selector: describeElement(anchor),
    }));
}

function collectVisibleDomFragments() {
  const candidates = [
    ...document.querySelectorAll(
      "main, section, article, table, [role='table'], [data-test], [data-testid], h1, h2, h3, h4"
    ),
  ].filter((node) => isVisible(node) && intersectsViewport(node));

  const fragments = [];
  let totalLength = 0;

  for (const node of candidates) {
    const html = node.outerHTML?.slice(0, 12000);

    if (!html) {
      continue;
    }

    fragments.push({
      selector: describeElement(node),
      html,
    });

    totalLength += html.length;

    if (fragments.length >= DOM_FRAGMENT_LIMIT || totalLength >= HTML_FRAGMENT_LIMIT) {
      break;
    }
  }

  return fragments;
}

function collectHeadings(root) {
  return [...root.querySelectorAll("h1, h2, h3, h4")]
    .filter((heading) => isVisible(heading))
    .map((heading) => heading.textContent?.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function extractHeaders(table) {
  const headers = [
    ...table.querySelectorAll("thead th, [role='columnheader'], th"),
  ].map((cell) => cell.textContent?.replace(/\s+/g, " ").trim() || "");

  return [...new Set(headers.filter(Boolean))];
}

function extractRows(table) {
  const rows = [];
  const rowNodes = [
    ...table.querySelectorAll("tbody tr, [role='row'], tr"),
  ];

  for (const row of rowNodes) {
    const cells = [...row.querySelectorAll("td, th, [role='cell']")]
      .map((cell) => cell.textContent?.replace(/\s+/g, " ").trim() || "")
      .filter(Boolean);

    if (cells.length) {
      rows.push(cells);
    }

    if (rows.length >= 20) {
      break;
    }
  }

  return rows;
}

function isVisible(element) {
  const style = window.getComputedStyle(element);

  if (style.display === "none" || style.visibility === "hidden") {
    return false;
  }

  return element.getBoundingClientRect().height > 0 && element.getBoundingClientRect().width > 0;
}

function intersectsViewport(element) {
  const rect = element.getBoundingClientRect();
  return rect.bottom >= 0 && rect.top <= window.innerHeight;
}

function describeElement(element) {
  const parts = [element.tagName.toLowerCase()];

  if (element.id) {
    parts.push(`#${element.id}`);
  }

  if (element.classList.length) {
    parts.push(
      ...[...element.classList].slice(0, 4).map((className) => `.${className}`)
    );
  }

  if (element.getAttribute("data-test")) {
    parts.push(`[data-test="${element.getAttribute("data-test")}"]`);
  }

  if (element.getAttribute("data-testid")) {
    parts.push(`[data-testid="${element.getAttribute("data-testid")}"]`);
  }

  return parts.join("");
}

function buildCaptureFilename(page) {
  const base = [
    "semrush-capture",
    page.database || "unknown-db",
    slugify(page.query || page.title || "page"),
    page.reportType || "unknown-report",
    new Date().toISOString().replace(/[:.]/g, "-"),
  ].join("__");

  return `${base}.json`;
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 80);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
