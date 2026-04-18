#!/usr/bin/env node

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const runArg = process.argv[2] || "research-runs/2026-04-18-all-24";
const RUN_DIR = path.isAbsolute(runArg) ? runArg : path.join(ROOT, runArg);
const MAX_CONCURRENCY = 4;
const FETCH_TIMEOUT_MS = 20000;

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "within",
  "under",
  "they",
  "them",
  "their",
  "your",
  "have",
  "has",
  "will",
  "must",
  "need",
  "needs",
  "what",
  "when",
  "where",
  "which",
  "there",
  "about",
  "would",
  "could",
  "should",
  "through",
  "these",
  "those",
  "only",
  "already",
  "still",
  "being",
  "into",
  "much",
  "more",
  "than",
  "then",
  "also",
  "such",
  "each",
  "both",
  "does",
  "doesn",
  "is",
  "are",
  "was",
  "were",
  "can",
  "not",
  "all",
  "any",
  "our",
  "its",
  "public",
  "product",
  "claim",
  "training",
  "course",
  "program",
  "workshop",
  "luxembourg",
]);

async function readJsonMaybe(filePath) {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function readJsonlMaybe(filePath) {
  try {
    const raw = await readFile(filePath, "utf8");
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return null;
  }
}

async function loadClaims(productDir) {
  const final = await readJsonMaybe(path.join(productDir, "claim-ledger.json"));
  if (Array.isArray(final?.claims)) return final.claims;

  const seed = await readJsonMaybe(path.join(productDir, "claim-ledger.seed.json"));
  if (Array.isArray(seed?.claims)) return seed.claims;

  return [];
}

async function loadSources(productDir) {
  const final = await readJsonMaybe(path.join(productDir, "source-ledger.json"));
  if (Array.isArray(final?.sources)) return final.sources;

  const finalJsonl = await readJsonlMaybe(path.join(productDir, "source-ledger.jsonl"));
  if (Array.isArray(finalJsonl)) return finalJsonl;

  const seed = await readJsonMaybe(path.join(productDir, "source-ledger.seed.json"));
  if (Array.isArray(seed?.sources)) return seed.sources;

  return [];
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function htmlToText(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function keywordize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !STOPWORDS.has(token));
}

function deriveSearchTerms(source, relatedClaims) {
  const frequencies = new Map();
  const rawTerms = [
    ...keywordize(source.title),
    ...relatedClaims.flatMap((claim) => keywordize(claim.claim_text)),
    ...relatedClaims.flatMap((claim) => keywordize(claim.notes || "")),
  ];

  for (const term of rawTerms) {
    frequencies.set(term, (frequencies.get(term) || 0) + 1);
  }

  return [...frequencies.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 12)
    .map(([term]) => term);
}

function extractSnippets(text, terms) {
  const snippets = [];
  const lower = text.toLowerCase();

  for (const term of terms) {
    let startIndex = 0;
    let matches = 0;

    while (matches < 2) {
      const found = lower.indexOf(term, startIndex);
      if (found === -1) break;
      const sliceStart = Math.max(0, found - 160);
      const sliceEnd = Math.min(text.length, found + term.length + 160);
      const snippet = text.slice(sliceStart, sliceEnd).trim();
      if (snippet.length >= 40) {
        snippets.push({
          quote_text: snippet,
          matched_term: term,
        });
      }
      startIndex = found + term.length;
      matches += 1;
    }
  }

  const deduped = [];
  const seen = new Set();
  for (const snippet of snippets) {
    const key = snippet.quote_text.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(snippet);
    }
  }
  return deduped.slice(0, 8);
}

function sourceContentType(response) {
  return response.headers.get("content-type") || "";
}

function supportedContentType(contentType) {
  return (
    contentType.includes("text/html") ||
    contentType.includes("application/xhtml+xml") ||
    contentType.includes("text/plain")
  );
}

async function fetchSourceText(url) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; ResearchV2QuoteFetcher/1.0)",
      accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
    },
  });

  const contentType = sourceContentType(response);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      contentType,
      error: `HTTP ${response.status}`,
    };
  }

  if (!supportedContentType(contentType)) {
    return {
      ok: false,
      status: response.status,
      contentType,
      error: `Unsupported content-type: ${contentType || "unknown"}`,
    };
  }

  const raw = await response.text();
  const text = contentType.includes("text/plain") ? raw.replace(/\s+/g, " ").trim() : htmlToText(raw);

  if (!text) {
    return {
      ok: false,
      status: response.status,
      contentType,
      error: "Empty text after extraction",
    };
  }

  return {
    ok: true,
    status: response.status,
    contentType,
    text,
  };
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const current = cursor;
      cursor += 1;
      results[current] = await mapper(items[current], current);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

async function processProduct(productDir) {
  const claims = await loadClaims(productDir);
  const sources = await loadSources(productDir);
  const productCode = path.basename(productDir).split("_")[0];
  const quoteCandidates = [];
  const sourceReports = [];

  const results = await mapLimit(sources, MAX_CONCURRENCY, async (source) => {
    const relatedClaims = claims.filter((claim) =>
      Array.isArray(claim.supporting_source_ids)
        ? claim.supporting_source_ids.includes(source.source_id)
        : Array.isArray(claim.source_ids) && claim.source_ids.includes(source.source_id)
    );

    const terms = deriveSearchTerms(source, relatedClaims);

    try {
      const fetched = await fetchSourceText(source.url);
      if (!fetched.ok) {
        return {
          source_id: source.source_id,
          title: source.title,
          url: source.url,
          status: "fetch_failed",
          http_status: fetched.status,
          content_type: fetched.contentType,
          error: fetched.error,
          matched_claim_ids: relatedClaims.map((claim) => claim.claim_id).filter(Boolean),
          terms,
          candidate_count: 0,
        };
      }

      const snippets = extractSnippets(fetched.text, terms);

      for (let index = 0; index < snippets.length; index += 1) {
        quoteCandidates.push({
          candidate_id: `${source.source_id}_cand_${String(index + 1).padStart(3, "0")}`,
          source_id: source.source_id,
          source_url: source.url,
          quote_text: snippets[index].quote_text,
          quote_type: "candidate_snippet",
          matched_terms: [snippets[index].matched_term],
          matched_claim_ids: relatedClaims.map((claim) => claim.claim_id).filter(Boolean),
          location_hint: null,
          content_type: fetched.contentType,
          extracted_at: new Date().toISOString(),
        });
      }

      return {
        source_id: source.source_id,
        title: source.title,
        url: source.url,
        status: snippets.length > 0 ? "candidate_quotes_found" : "fetched_no_matches",
        http_status: fetched.status,
        content_type: fetched.contentType,
        error: null,
        matched_claim_ids: relatedClaims.map((claim) => claim.claim_id).filter(Boolean),
        terms,
        candidate_count: snippets.length,
      };
    } catch (error) {
      return {
        source_id: source.source_id,
        title: source.title,
        url: source.url,
        status: "fetch_failed",
        http_status: null,
        content_type: null,
        error: error.message,
        matched_claim_ids: relatedClaims.map((claim) => claim.claim_id).filter(Boolean),
        terms,
        candidate_count: 0,
      };
    }
  });

  sourceReports.push(...results);

  const candidatePath = path.join(productDir, "quote-ledger.candidates.jsonl");
  const reportPath = path.join(productDir, "quote-fetch-report.json");

  await writeFile(
    candidatePath,
    quoteCandidates.length > 0 ? `${quoteCandidates.map((item) => JSON.stringify(item)).join("\n")}\n` : ""
  );
  await writeFile(
    reportPath,
    `${JSON.stringify(
      {
        schema_version: "research_v2_quote_fetch_report_v1",
        product_code: productCode,
        generated_at: new Date().toISOString(),
        source_count: sources.length,
        candidate_count: quoteCandidates.length,
        source_reports: sourceReports,
      },
      null,
      2
    )}\n`
  );

  return {
    productCode,
    productFolder: path.basename(productDir),
    sourceCount: sources.length,
    candidateCount: quoteCandidates.length,
    sourcesWithCandidates: sourceReports.filter((item) => item.status === "candidate_quotes_found").length,
    fetchFailures: sourceReports.filter((item) => item.status === "fetch_failed").length,
    unsupportedOrNoMatch: sourceReports.filter((item) => item.status !== "candidate_quotes_found" && item.status !== "fetch_failed").length,
  };
}

async function main() {
  const entries = await readdir(RUN_DIR, { withFileTypes: true });
  const productDirs = entries
    .filter((entry) => entry.isDirectory() && entry.name !== "benchmark")
    .map((entry) => path.join(RUN_DIR, entry.name))
    .sort();

  for (const productDir of productDirs) {
    await mkdir(productDir, { recursive: true });
  }

  const reports = [];
  for (const productDir of productDirs) {
    reports.push(await processProduct(productDir));
  }

  const aggregate = {
    products: reports.length,
    total_sources: reports.reduce((sum, item) => sum + item.sourceCount, 0),
    total_candidates: reports.reduce((sum, item) => sum + item.candidateCount, 0),
    total_fetch_failures: reports.reduce((sum, item) => sum + item.fetchFailures, 0),
    products_with_any_candidates: reports.filter((item) => item.candidateCount > 0).length,
  };

  const reportPath = path.join(RUN_DIR, "quote-candidate-fetch-report.json");
  const summaryPath = path.join(RUN_DIR, "quote-candidate-fetch-summary.md");

  await writeFile(
    reportPath,
    `${JSON.stringify(
      {
        schema_version: "research_v2_quote_candidate_batch_report_v1",
        generated_at: new Date().toISOString(),
        run_dir: RUN_DIR,
        aggregate,
        product_reports: reports,
      },
      null,
      2
    )}\n`
  );

  const summaryLines = [
    `# Quote Candidate Fetch Summary - ${path.basename(RUN_DIR)}`,
    "",
    `- Products: ${aggregate.products}`,
    `- Total sources attempted: ${aggregate.total_sources}`,
    `- Total quote candidates: ${aggregate.total_candidates}`,
    `- Products with any candidates: ${aggregate.products_with_any_candidates}`,
    `- Total fetch failures: ${aggregate.total_fetch_failures}`,
    "",
    "## Per product",
    "",
    ...reports.map(
      (item) =>
        `- ${item.productFolder}: ${item.candidateCount} candidates, ${item.sourcesWithCandidates} sources with candidates, ${item.fetchFailures} fetch failures`
    ),
  ];

  await writeFile(summaryPath, `${summaryLines.join("\n")}\n`);

  console.log(`Quote candidate batch report written to ${reportPath}`);
  console.log(`Quote candidate summary written to ${summaryPath}`);
  console.log(JSON.stringify(aggregate, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
