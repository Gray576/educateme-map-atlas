#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const WORKSPACE_ROOT = "/Users/sergey/Desktop/educateme-map";
const INPUT_PATH = path.join(
  WORKSPACE_ROOT,
  "research-runs/2026-04-18-all-24/semrush-corpus/country-keywords/lu/all-domain-keywords.json"
);
const OUTPUT_DIR = path.join(
  WORKSPACE_ROOT,
  "research-runs/2026-04-18-all-24/semrush-corpus/country-keywords/lu"
);

const allKeywords = JSON.parse(await fs.readFile(INPUT_PATH, "utf8"));
const shortlist = buildShortlist(allKeywords);

await fs.mkdir(OUTPUT_DIR, { recursive: true });

const jsonPath = path.join(OUTPUT_DIR, "lu-shortlist.json");
const csvPath = path.join(OUTPUT_DIR, "lu-shortlist.csv");
const memoPath = path.join(OUTPUT_DIR, "lu-shortlist.md");

await fs.writeFile(jsonPath, JSON.stringify(shortlist, null, 2));
await fs.writeFile(csvPath, buildCsv(shortlist));
await fs.writeFile(memoPath, buildMemo(shortlist));

console.log(`Shortlist rows: ${shortlist.length}`);
console.log(`JSON: ${jsonPath}`);
console.log(`CSV: ${csvPath}`);
console.log(`Memo: ${memoPath}`);

function buildShortlist(rows) {
  const shortlisted = [];
  const seen = new Set();

  for (const row of rows) {
    const lane = classifyLane(row.keyword);

    if (!lane) {
      continue;
    }

    if (shouldExclude(row.keyword)) {
      continue;
    }

    const score = scoreRow(row, lane);

    if (score == null) {
      continue;
    }

    shortlisted.push({
      keyword: row.keyword,
      lane,
      priority: priorityFromScore(score),
      score,
      domainsCount: row.domainsCount,
      domains: row.domains,
      bestPosition: row.bestPosition,
      maxVolume: row.maxVolume,
      minKd: row.minKd,
      intents: row.intents,
      topUrls: row.topUrls,
      reasonToKeep: reasonToKeep(row, lane),
    });
  }

  const byLane = new Map();

  for (const row of shortlisted.sort(compareRows)) {
    const list = byLane.get(row.lane) || [];
    list.push(row);
    byLane.set(row.lane, list);
  }

  const laneCaps = {
    luxembourgish_route: 14,
    continuing_education: 12,
    french_language: 10,
    general_language: 10,
    exam_route: 8,
    english_german_adjacent: 8,
  };

  const output = [];

  for (const [lane, rowsForLane] of byLane.entries()) {
    const cap = laneCaps[lane] || 8;

    for (const row of rowsForLane.slice(0, cap)) {
      const key = `${lane}::${row.keyword.toLowerCase()}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      output.push(row);
    }
  }

  return output.sort(compareRows);
}

function classifyLane(keyword) {
  const text = String(keyword || "").toLowerCase();

  if (
    /(sproochentest|luxembourgeois|luxembourgish|lëtzebuergesch|letzebuergesch|learn luxembourgish|apprendre luxembourgeois|cours luxembourgeois|inl |inll )/.test(
      text
    )
  ) {
    return "luxembourgish_route";
  }

  if (
    /(formation continue|cours du soir|formation professionnelle|formation luxembourg|formation lu|lifelong learning|apprentissage adulte|formations continue|formations continues|service de la formation des adultes)/.test(
      text
    )
  ) {
    return "continuing_education";
  }

  if (
    /(french|français|francais|cours de français|cours de francais|institut francais|alliance française|alliance francaise)/.test(
      text
    )
  ) {
    return "french_language";
  }

  if (
    /(language courses|courses in luxembourg|language school|cours de langue|language courses luxembourg|langue luxembourg|cours$|cours en ligne luxembourg|centre de langues)/.test(
      text
    )
  ) {
    return "general_language";
  }

  if (/(exam|examen|preuve|nationalité luxembourgeoise|vivre ensemble)/.test(text)) {
    return "exam_route";
  }

  if (
    /(anglais|english|allemand|german|cours d anglais|cours anglais|cours allemand|english schools)/.test(
      text
    )
  ) {
    return "english_german_adjacent";
  }

  return null;
}

function shouldExclude(keyword) {
  const text = String(keyword || "").toLowerCase();

  return [
    /^house of training$/,
    /^pwc$/,
    /^pwc /,
    /^prolingua$/,
    /^prolingue$/,
    /^inll$/,
    /^inl$/,
    /^myinl/,
    /^my inl/,
    /^18 698$/,
    /^education$/,
    /^marketing digital$/,
    /^université/,
    /^luxembourg stock exchange$/,
    /^workiva$/,
    /^wealth management$/,
    /^audit$/,
    /^insurance$/,
    /^real estate investment luxembourg$/,
  ].some((pattern) => pattern.test(text));
}

function scoreRow(row, lane) {
  const domains = row.domainsCount || 0;
  const volume = row.maxVolume || 0;
  const bestPosition = row.bestPosition ?? 999;
  const kd = row.minKd ?? 999;

  if (domains < 2) {
    return null;
  }

  if (lane === "luxembourgish_route") {
    if (volume < 30 && bestPosition > 10) {
      return null;
    }
  } else if (lane === "continuing_education") {
    if (volume < 30) {
      return null;
    }
  } else {
    if (volume < 20 && bestPosition > 10) {
      return null;
    }
  }

  return domains * 100000 + volume * 10 - Math.min(bestPosition, 100) * 20 - Math.min(kd, 100);
}

function priorityFromScore(score) {
  if (score >= 600000) {
    return "P1";
  }
  if (score >= 300000) {
    return "P2";
  }
  return "P3";
}

function reasonToKeep(row, lane) {
  const parts = [];

  parts.push(`${row.domainsCount} domains`);

  if (row.maxVolume != null) {
    parts.push(`vol ${row.maxVolume}`);
  }

  if (row.bestPosition != null) {
    parts.push(`best pos ${row.bestPosition}`);
  }

  if (lane === "luxembourgish_route") {
    parts.push("direct local route signal");
  } else if (lane === "continuing_education") {
    parts.push("discovery / continuing-ed lane");
  } else if (lane === "french_language") {
    parts.push("local French demand");
  } else if (lane === "general_language") {
    parts.push("category-level language demand");
  } else if (lane === "exam_route") {
    parts.push("official / route adjacency");
  } else if (lane === "english_german_adjacent") {
    parts.push("adjacent language demand");
  }

  return parts.join(" · ");
}

function compareRows(left, right) {
  return (
    comparePriority(left.priority, right.priority) ||
    (right.domainsCount || 0) - (left.domainsCount || 0) ||
    (right.maxVolume || 0) - (left.maxVolume || 0) ||
    (left.bestPosition ?? 999) - (right.bestPosition ?? 999) ||
    left.keyword.localeCompare(right.keyword)
  );
}

function comparePriority(left, right) {
  const rank = { P1: 0, P2: 1, P3: 2 };
  return (rank[left] ?? 9) - (rank[right] ?? 9);
}

function buildCsv(rows) {
  const header = [
    "keyword",
    "lane",
    "priority",
    "domains_count",
    "best_position",
    "max_volume",
    "min_kd",
    "domains",
    "reason_to_keep",
  ];

  const lines = [header.join(",")];

  for (const row of rows) {
    lines.push(
      [
        csvValue(row.keyword),
        csvValue(row.lane),
        csvValue(row.priority),
        csvValue(row.domainsCount),
        csvValue(row.bestPosition),
        csvValue(row.maxVolume),
        csvValue(row.minKd),
        csvValue(row.domains.join(" | ")),
        csvValue(row.reasonToKeep),
      ].join(",")
    );
  }

  return `${lines.join("\n")}\n`;
}

function buildMemo(rows) {
  const lanes = groupBy(rows, (row) => row.lane);
  const summary = [...lanes.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([lane, items]) => `- \`${lane}\`: ${items.length}`)
    .join("\n");

  const top = rows
    .slice(0, 20)
    .map(
      (row) =>
        `- \`${row.keyword}\` — ${row.priority}, ${row.domainsCount} domains, vol ${row.maxVolume ?? "n/a"}, best pos ${row.bestPosition ?? "n/a"}`
    )
    .join("\n");

  return `# LU Keyword Shortlist\n\nTotal shortlist rows: \`${rows.length}\`\n\n## By lane\n${summary}\n\n## Top rows\n${top}\n\n## How to use\n- Start with \`P1\` rows for page-level or cluster-level follow-up.\n- Treat \`P2\` rows as supporting clusters or comparison terms.\n- Treat \`P3\` rows as optional adjacency or message-mining terms.\n- Do not treat this shortlist as final GTM truth; it is the working queue for deeper per-keyword review.\n`;
}

function groupBy(items, keyFn) {
  const grouped = new Map();

  for (const item of items) {
    const key = keyFn(item);
    const list = grouped.get(key) || [];
    list.push(item);
    grouped.set(key, list);
  }

  return grouped;
}

function csvValue(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}
