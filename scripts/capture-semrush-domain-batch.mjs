#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const WORKSPACE_ROOT = "/Users/sergey/Desktop/educateme-map";
const DEFAULT_DOWNLOAD_DIR = path.join(WORKSPACE_ROOT, "tools");
const DEFAULT_DOMAINS_FILE = path.join(
  WORKSPACE_ROOT,
  "research-runs/2026-04-18-all-24/semrush-corpus/config/lu-domain-seeds.json"
);
const DEFAULT_BATCH_DIR = path.join(
  WORKSPACE_ROOT,
  "research-runs/2026-04-18-all-24/semrush-corpus/batches"
);

const options = parseArgs(process.argv.slice(2));

const db = (options.db || "lu").toLowerCase();
const domainsFile = path.resolve(options.domainsFile || DEFAULT_DOMAINS_FILE);
const downloadDir = path.resolve(options.downloadDir || DEFAULT_DOWNLOAD_DIR);

const rawDomains = JSON.parse(await fs.readFile(domainsFile, "utf8"));
const domains = rawDomains.map((item) => String(item).trim()).filter(Boolean);

if (!domains.length) {
  console.error("No domains to capture.");
  process.exit(1);
}

await fs.mkdir(DEFAULT_BATCH_DIR, { recursive: true });

const startedAt = new Date().toISOString();
const batch = {
  meta: {
    startedAt,
    database: db,
    domainsFile,
    downloadDir,
    domainCount: domains.length,
    tabPolicy: "reuse-active-tab",
    reports: ["domain-overview", "organic-positions"],
  },
  entries: [],
};

for (const domain of domains) {
  for (const reportType of ["domain-overview", "organic-positions"]) {
    const url = buildReportUrl(db, domain, reportType);
    const beforeFiles = await listMatchingFiles(downloadDir, db, domain, reportType);

    await navigateActiveChromeTab(url);
    await waitForChromePage(url);
    await sleep(jitter(900, 1500));

    const triggerStartedAt = new Date().toISOString();
    await triggerCapture(reportType, domain);
    const filePath = await waitForNewCapture(
      downloadDir,
      db,
      domain,
      reportType,
      beforeFiles
    );

    batch.entries.push({
      domain,
      reportType,
      url,
      triggerStartedAt,
      filePath,
      status: "captured",
    });

    await sleep(jitter(900, 1800));
  }
}

batch.meta.completedAt = new Date().toISOString();

const batchPath = path.join(
  DEFAULT_BATCH_DIR,
  `domain-batch__${db}__${startedAt.replace(/[:.]/g, "-")}.json`
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
    } else if (arg === "--domains-file") {
      parsed.domainsFile = args[++index];
    } else if (arg === "--download-dir") {
      parsed.downloadDir = args[++index];
    }
  }

  return parsed;
}

function buildReportUrl(database, domain, reportType) {
  if (reportType === "domain-overview") {
    return `https://www.semrush.com/analytics/overview/?searchType=domain&db=${database}&q=${encodeURIComponent(domain)}`;
  }

  if (reportType === "organic-positions") {
    return `https://www.semrush.com/analytics/organic/positions/?db=${database}&q=${encodeURIComponent(domain)}&searchType=domain`;
  }

  throw new Error(`Unsupported report type: ${reportType}`);
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

async function triggerCapture(reportType, domain) {
  const reason = `batch-${reportType}-${slugify(domain)}`;
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

async function waitForNewCapture(downloadDirPath, database, domain, reportType, beforeFiles) {
  const maxAttempts = 45;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const files = await listMatchingFiles(downloadDirPath, database, domain, reportType);
    const newFiles = files.filter((file) => !beforeFiles.includes(file));

    if (newFiles.length) {
      return newFiles[newFiles.length - 1];
    }

    await sleep(1000);
  }

  throw new Error(`No capture downloaded for ${domain} (${reportType})`);
}

async function listMatchingFiles(downloadDirPath, database, domain, reportType) {
  const slug = slugify(domain);
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
  const { stdout } = await execFileAsync("osascript", args);
  return stdout;
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
