#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const target = process.argv[2];

if (!target) {
  console.error("Usage: node scripts/inspect-semrush-capture.mjs /path/to/capture.json");
  process.exit(1);
}

const raw = await fs.readFile(target, "utf8");
const payload = JSON.parse(raw);

const network = Array.isArray(payload.network) ? payload.network : [];
const segments = Array.isArray(payload.segments) ? payload.segments : [];

const topEndpoints = summarizeEndpoints(network);

console.log(`File: ${path.basename(target)}`);
console.log(`Report: ${payload.meta?.page?.reportType || "unknown"}`);
console.log(`DB: ${payload.meta?.page?.database || "unknown"}`);
console.log(`Query: ${payload.meta?.page?.query || "n/a"}`);
console.log(`Captured at: ${payload.meta?.capturedAt || "n/a"}`);
console.log(`Segments: ${segments.length}`);
console.log(`Network entries: ${network.length}`);
console.log(`Document tables: ${payload.documentSnapshot?.tables?.length || 0}`);
console.log("");

console.log("Segment summary:");
for (const segment of segments) {
  console.log(
    `- ${segment.name}: tables=${segment.visibleTables?.length || 0}, links=${segment.visibleLinks?.length || 0}, textChars=${segment.visibleText?.length || 0}, domFragments=${segment.visibleDomFragments?.length || 0}`
  );
}

console.log("");
console.log("Top network endpoints:");
for (const endpoint of topEndpoints.slice(0, 15)) {
  console.log(
    `- ${endpoint.count}x ${endpoint.method} ${endpoint.originPath} [${endpoint.contentTypes.join(", ")}]`
  );
}

console.log("");
console.log("Likely JSON endpoints:");
for (const item of network.filter((entry) => /json/i.test(entry.contentType || "")).slice(0, 20)) {
  console.log(`- ${item.method} ${item.url}`);
}

function summarizeEndpoints(entries) {
  const map = new Map();

  for (const entry of entries) {
    const url = safeUrl(entry.url);
    const key = `${entry.method || "GET"} ${url.originPath}`;
    const current = map.get(key) || {
      count: 0,
      method: entry.method || "GET",
      originPath: url.originPath,
      contentTypes: new Set(),
    };

    current.count += 1;

    if (entry.contentType) {
      current.contentTypes.add(entry.contentType);
    }

    map.set(key, current);
  }

  return [...map.values()]
    .map((item) => ({
      ...item,
      contentTypes: [...item.contentTypes],
    }))
    .sort((a, b) => b.count - a.count);
}

function safeUrl(value) {
  try {
    const parsed = new URL(value);
    return {
      originPath: `${parsed.origin}${parsed.pathname}`,
    };
  } catch {
    return {
      originPath: value || "(invalid URL)",
    };
  }
}
