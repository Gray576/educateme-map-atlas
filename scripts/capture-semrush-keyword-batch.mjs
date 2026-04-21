#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const WORKSPACE_ROOT = "/Users/sergey/Desktop/educateme-map";
const DEFAULT_DOWNLOAD_DIR = path.join(WORKSPACE_ROOT, "tools");
const DEFAULT_KEYWORDS_FILE = path.join(
  WORKSPACE_ROOT,
  "research-runs/2026-04-18-all-24/semrush-corpus/config/lu-keyword-overview-seeds.json"
);
const DEFAULT_BATCH_DIR = path.join(
  WORKSPACE_ROOT,
  "research-runs/2026-04-18-all-24/semrush-corpus/batches"
);

const options = parseArgs(process.argv.slice(2));
const db = (options.db || "lu").toLowerCase();
const keywordsFile = path.resolve(options.keywordsFile || DEFAULT_KEYWORDS_FILE);
const downloadDir = path.resolve(options.downloadDir || DEFAULT_DOWNLOAD_DIR);

const rawKeywords = JSON.parse(await fs.readFile(keywordsFile, "utf8"));
const keywords = rawKeywords.map((item) => String(item).trim()).filter(Boolean);

if (!keywords.length) {
  console.error("No keywords to capture.");
  process.exit(1);
}

await fs.mkdir(DEFAULT_BATCH_DIR, { recursive: true });

const startedAt = new Date().toISOString();
const batch = {
  meta: {
    startedAt,
    database: db,
    keywordsFile,
    downloadDir,
    keywordCount: keywords.length,
    tabPolicy: "reuse-active-tab",
    reports: ["keyword-overview"],
  },
  entries: [],
};

for (const keyword of keywords) {
  const reportType = "keyword-overview";
  const url = buildKeywordOverviewUrl(db, keyword);
  const beforeFiles = await listMatchingFiles(downloadDir, db, keyword, reportType);

  await navigateActiveChromeTab(url);
  await waitForChromePage(url);
  await sleep(jitter(900, 1600));

  const triggerStartedAt = new Date().toISOString();
  await triggerCapture(reportType, keyword);
  const filePath = await waitForNewCapture(
    downloadDir,
    db,
    keyword,
    reportType,
    beforeFiles
  );

  batch.entries.push({
    keyword,
    reportType,
    url,
    triggerStartedAt,
    filePath,
    status: "captured",
  });

  await sleep(jitter(1000, 1800));
}

batch.meta.completedAt = new Date().toISOString();

const batchPath = path.join(
  DEFAULT_BATCH_DIR,
  `keyword-batch__${db}__${startedAt.replace(/[:.]/g, "-")}.json`
);

await fs.writeFile(batchPath, JSON.stringify(batch, null, 2));

console.log(`Captured files: ${batch.entries.length}`);
console.log(`Batch manifest: ${batchPath}`);

function parseArgs(args) {
  const parsed = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--db") {
      parsed.db = args[++index];
    } else if (arg === "--keywords-file") {
      parsed.keywordsFile = args[++index];
    } else if (arg === "--download-dir") {
      parsed.downloadDir = args[++index];
    }
  }

  return parsed;
}

function buildKeywordOverviewUrl(database, keyword) {
  return `https://www.semrush.com/analytics/keywordoverview/?db=${database}&q=${encodeURIComponent(keyword)}`;
}

async function navigateActiveChromeTab(url) {
  const script = [
    'tell application "Google Chrome"',
    '  if (count of windows) = 0 then error "Chrome window not found"',
    '  tell active tab of front window',
    `    set URL to "${escapeAppleScriptString(url)}"`,
    "  end tell",
    "end tell",
  ];

  await execAppleScript(script);
}

async function waitForChromePage(expectedUrl) {
  const maxAttempts = 40;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const result = await execAppleScript([
      'tell application "Google Chrome"',
      "  tell active tab of front window",
      '    execute javascript "JSON.stringify({href: location.href, readyState: document.readyState})"',
      "  end tell",
      "end tell",
    ]);

    const parsed = safeJsonParse(result.trim());

    if (
      parsed &&
      parsed.readyState === "complete" &&
      typeof parsed.href === "string" &&
      parsed.href.startsWith(expectedUrl.split("&")[0])
    ) {
      return;
    }

    await sleep(1000);
  }

  throw new Error(`Timed out waiting for page: ${expectedUrl}`);
}

async function triggerCapture(reportType, keyword) {
  const reason = `batch-${reportType}-${slugify(keyword)}`;
  const js = `window.postMessage({type:'semrush-dom-capture:trigger', autoDownload:true, reason:${JSON.stringify(
    reason
  )}}, '*'); 'ok';`;

  await execAppleScript([
    'tell application "Google Chrome"',
    "  tell active tab of front window",
    `    execute javascript ${toAppleScriptString(js)}`,
    "  end tell",
    "end tell",
  ]);
}

async function waitForNewCapture(downloadDirPath, database, keyword, reportType, beforeFiles) {
  const maxAttempts = 45;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const files = await listMatchingFiles(downloadDirPath, database, keyword, reportType);
    const newFiles = files.filter((file) => !beforeFiles.includes(file));

    if (newFiles.length) {
      return newFiles[newFiles.length - 1];
    }

    await sleep(1000);
  }

  throw new Error(`No capture downloaded for ${keyword} (${reportType})`);
}

async function listMatchingFiles(downloadDirPath, database, keyword, reportType) {
  const slug = slugify(keyword);
  const prefix = `semrush-capture__${database}__${slug}__${reportType}__`;
  const entries = await fs.readdir(downloadDirPath);

  return entries
    .filter((entry) => entry.startsWith(prefix) && entry.endsWith(".json"))
    .map((entry) => path.join(downloadDirPath, entry))
    .sort();
}

async function execAppleScript(lines) {
  const flattened = Array.isArray(lines) ? lines : [String(lines)];
  const args = flattened.flatMap((line) => ["-e", line]);

  let lastError = null;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const { stdout } = await execFileAsync("osascript", args);
      return stdout;
    } catch (error) {
      lastError = error;
      const stderr = String(error?.stderr || "");
      const message = String(error?.message || "");
      const retryable =
        stderr.includes("(-1712)") ||
        message.includes("(-1712)") ||
        stderr.toLowerCase().includes("timed out");

      if (!retryable || attempt === 3) {
        throw error;
      }

      await sleep(1500 + attempt * 1000);
    }
  }

  throw lastError || new Error("AppleScript execution failed");
}

function escapeAppleScriptString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function toAppleScriptString(value) {
  return `"${escapeAppleScriptString(value)}"`;
}

function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 80);
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function jitter(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
