#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const WORKSPACE_ROOT = "/Users/sergey/Desktop/educateme-map";
const DEFAULT_SOURCE_DIR = "/Users/sergey/Downloads";
const DEFAULT_TARGET_DIR = path.join(WORKSPACE_ROOT, "tools");

const args = process.argv.slice(2);
const shouldNormalize = args.includes("--normalize");
const sourceDir = resolveArgValue("--source") || DEFAULT_SOURCE_DIR;
const targetDir = resolveArgValue("--target") || DEFAULT_TARGET_DIR;

await fs.mkdir(targetDir, { recursive: true });

const names = (await fs.readdir(sourceDir))
  .filter((name) => /^semrush-capture__.+\.json$/i.test(name))
  .sort();

if (!names.length) {
  console.log(`No SEMrush capture JSON files found in ${sourceDir}`);
  process.exit(0);
}

const imported = [];

for (const name of names) {
  const sourcePath = path.join(sourceDir, name);
  const targetPath = path.join(targetDir, name);
  const sourceStat = await fs.stat(sourcePath);
  const targetStat = await safeStat(targetPath);

  if (
    targetStat &&
    targetStat.size === sourceStat.size &&
    targetStat.mtimeMs >= sourceStat.mtimeMs
  ) {
    continue;
  }

  await fs.copyFile(sourcePath, targetPath);
  await fs.utimes(targetPath, sourceStat.atime, sourceStat.mtime);
  imported.push(targetPath);
}

if (!imported.length) {
  console.log("No new or updated SEMrush capture files to import.");
} else {
  console.log(`Imported ${imported.length} file(s):`);
  for (const filePath of imported) {
    console.log(filePath);
  }
}

if (shouldNormalize && imported.length) {
  await runNodeScript(
    path.join(WORKSPACE_ROOT, "scripts/normalize-semrush-capture.mjs"),
    imported
  );
}

function resolveArgValue(flag) {
  const index = args.indexOf(flag);
  if (index === -1) return null;
  return args[index + 1] || null;
}

async function safeStat(filePath) {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

function runNodeScript(scriptPath, scriptArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...scriptArgs], {
      cwd: WORKSPACE_ROOT,
      stdio: "inherit",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Script failed with exit code ${code}`));
    });

    child.on("error", reject);
  });
}
