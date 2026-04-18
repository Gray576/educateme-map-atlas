#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const runArg = process.argv[2] || "research-runs/2026-04-18-all-24";
const RUN_DIR = path.isAbsolute(runArg) ? runArg : path.join(ROOT, runArg);
const BENCHMARK_DIR = path.join(RUN_DIR, "benchmark");
const responsesArg = process.argv[3] || path.join(BENCHMARK_DIR, "responses.jsonl");
const adjudicationArg = process.argv[4] || path.join(BENCHMARK_DIR, "adjudication.csv");

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unique(values) {
  return [...new Set(values)];
}

async function readJsonMaybe(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
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

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && insideQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

async function readCsvMaybe(filePath) {
  try {
    const raw = await readFile(filePath, "utf8");
    const lines = raw
      .split("\n")
      .map((line) => line.trimEnd())
      .filter(Boolean);
    if (lines.length === 0) return [];
    const headers = parseCsvLine(lines[0]);
    return lines.slice(1).map((line) => {
      const values = parseCsvLine(line);
      return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    });
  } catch {
    return null;
  }
}

function mean(numbers) {
  if (numbers.length === 0) return null;
  return Number((numbers.reduce((sum, value) => sum + value, 0) / numbers.length).toFixed(3));
}

function toNumeric(value) {
  if (value === "" || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function main() {
  const taskDoc = await readJsonMaybe(path.join(BENCHMARK_DIR, "tasks.json"));
  if (!taskDoc?.tasks || !Array.isArray(taskDoc.tasks)) {
    throw new Error(`Benchmark tasks not found in ${BENCHMARK_DIR}`);
  }

  const tasks = taskDoc.tasks;
  const taskIds = new Set(tasks.map((task) => task.task_id));
  const responses = (await readJsonlMaybe(responsesArg)) || [];
  const adjudicationRows = (await readCsvMaybe(adjudicationArg)) || [];

  const responseErrors = [];
  const validVerdicts = new Set(["supported", "contradicted", "insufficient_evidence"]);
  const responseMap = new Map();

  for (const response of responses) {
    if (!isRecord(response)) {
      responseErrors.push("Response file contains a non-object row");
      continue;
    }
    if (!response.task_id || !taskIds.has(response.task_id)) {
      responseErrors.push(`Unknown task_id in responses: ${response.task_id || "<missing>"}`);
      continue;
    }
    responseMap.set(response.task_id, response);
  }

  const answeredResponses = [...responseMap.values()];
  const coverage = answeredResponses.length;
  const validVerdictCount = answeredResponses.filter((response) => validVerdicts.has(response.verdict)).length;
  const withCitations = answeredResponses.filter((response) => Array.isArray(response.citations) && response.citations.length > 0).length;
  const withQuotes = answeredResponses.filter((response) =>
    Array.isArray(response.citations) && response.citations.some((citation) => citation?.quote_text)
  ).length;
  const withConfidence = answeredResponses.filter((response) => typeof response.confidence_band === "string" && response.confidence_band.length > 0).length;
  const avgCitationsPerResponse = mean(
    answeredResponses.map((response) => (Array.isArray(response.citations) ? response.citations.length : 0))
  );

  const filledAdjudication = adjudicationRows.filter((row) =>
    [
      row.verdict_correct_0_1,
      row.citation_precision_0_1,
      row.quote_grounding_0_1,
      row.source_tier_ok_0_1,
      row.answer_complete_0_1,
      row.confidence_calibration_0_1,
    ].some((value) => value !== "")
  );

  const adjudicationMetrics = {
    verdict_accuracy: mean(filledAdjudication.map((row) => toNumeric(row.verdict_correct_0_1)).filter((value) => value !== null)),
    citation_precision: mean(filledAdjudication.map((row) => toNumeric(row.citation_precision_0_1)).filter((value) => value !== null)),
    quote_grounding: mean(filledAdjudication.map((row) => toNumeric(row.quote_grounding_0_1)).filter((value) => value !== null)),
    source_tier_compliance: mean(filledAdjudication.map((row) => toNumeric(row.source_tier_ok_0_1)).filter((value) => value !== null)),
    answer_completeness: mean(filledAdjudication.map((row) => toNumeric(row.answer_complete_0_1)).filter((value) => value !== null)),
    confidence_calibration: mean(
      filledAdjudication.map((row) => toNumeric(row.confidence_calibration_0_1)).filter((value) => value !== null)
    ),
  };

  const report = {
    schema_version: "research_v2_benchmark_score_report_v1",
    generated_at: new Date().toISOString(),
    run_id: path.basename(RUN_DIR),
    response_path: responsesArg,
    adjudication_path: adjudicationArg,
    structural: {
      task_count: tasks.length,
      answered_task_count: coverage,
      coverage_ratio: Number((coverage / tasks.length).toFixed(3)),
      valid_verdict_count: validVerdictCount,
      valid_verdict_ratio: coverage === 0 ? 0 : Number((validVerdictCount / coverage).toFixed(3)),
      responses_with_citations: withCitations,
      responses_with_quotes: withQuotes,
      responses_with_confidence: withConfidence,
      avg_citations_per_response: avgCitationsPerResponse,
      response_errors: unique(responseErrors),
    },
    adjudicated: {
      filled_rows: filledAdjudication.length,
      metrics: adjudicationMetrics,
    },
  };

  const reportPath = path.join(BENCHMARK_DIR, "score-report.json");
  const summaryPath = path.join(BENCHMARK_DIR, "score-summary.md");

  const summaryLines = [
    `# Benchmark Score Summary - ${report.run_id}`,
    "",
    `Generated at: ${report.generated_at}`,
    `Responses: ${responsesArg}`,
    `Adjudication: ${adjudicationArg}`,
    "",
    "## Structural coverage",
    "",
    `- Tasks: ${report.structural.task_count}`,
    `- Answered tasks: ${report.structural.answered_task_count}`,
    `- Coverage ratio: ${report.structural.coverage_ratio}`,
    `- Valid verdict ratio: ${report.structural.valid_verdict_ratio}`,
    `- Responses with citations: ${report.structural.responses_with_citations}`,
    `- Responses with quotes: ${report.structural.responses_with_quotes}`,
    `- Responses with confidence: ${report.structural.responses_with_confidence}`,
    `- Average citations per response: ${report.structural.avg_citations_per_response ?? "n/a"}`,
    "",
    "## Adjudicated metrics",
    "",
    filledAdjudication.length === 0
      ? "- No adjudicated rows yet. Structural coverage exists, but no quantitative quality verdict can be made."
      : `- Filled adjudication rows: ${filledAdjudication.length}`,
    ...(filledAdjudication.length > 0
      ? [
          `- Verdict accuracy: ${adjudicationMetrics.verdict_accuracy}`,
          `- Citation precision: ${adjudicationMetrics.citation_precision}`,
          `- Quote grounding: ${adjudicationMetrics.quote_grounding}`,
          `- Source tier compliance: ${adjudicationMetrics.source_tier_compliance}`,
          `- Answer completeness: ${adjudicationMetrics.answer_completeness}`,
          `- Confidence calibration: ${adjudicationMetrics.confidence_calibration}`,
        ]
      : []),
    "",
    "## Response errors",
    "",
    ...(report.structural.response_errors.length > 0
      ? report.structural.response_errors.map((error, index) => `${index + 1}. ${error}`)
      : ["No structural response errors detected."]),
  ];

  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(summaryPath, `${summaryLines.join("\n")}\n`);

  console.log(`Benchmark score report written to ${reportPath}`);
  console.log(`Benchmark score summary written to ${summaryPath}`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
