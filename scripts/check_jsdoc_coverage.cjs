#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");

const MODE_VALUES = new Set(["warn", "fail-on-regression"]);
const DEFAULT_MODE = "warn";
const BASELINE_FILE_PATH = normalizePath(
  process.env.JSDOC_GUARDRAIL_BASELINE || "scripts/jsdoc_guardrail_baseline.json"
);
const UPDATE_BASELINE = process.argv.includes("--update-baseline");

const RUNTIME_TARGETS = Object.freeze([
  { type: "file", value: "script.js" },
  { type: "dir", value: "js" },
]);

const EXCLUDED_FILES = new Set(["js/config.js", "js/config.example.js"]);

const mode = String(process.env.JSDOC_GUARDRAIL_MODE || DEFAULT_MODE)
  .trim()
  .toLowerCase();

if (!MODE_VALUES.has(mode)) {
  console.error(
    `Unsupported JSDOC_GUARDRAIL_MODE '${mode}'. Expected one of: ${Array.from(
      MODE_VALUES
    ).join(", ")}`
  );
  process.exit(1);
}

const runtimeFiles = collectRuntimeFiles().sort();
const report = buildReport(runtimeFiles);

printReport(report);

if (UPDATE_BASELINE) {
  writeBaseline(report);
}

if (mode === "warn") {
  console.log(
    "JSDoc guardrail is running in warning mode. Set JSDOC_GUARDRAIL_MODE=fail-on-regression to enforce baseline checks."
  );
  process.exit(0);
}

const baseline = loadBaselineOrFail();
const regressions = detectRegressions(report, baseline);

if (regressions.length > 0) {
  console.error(
    `JSDoc guardrail failed: ${regressions.length} documentation regression(s) detected.`
  );
  for (const regression of regressions) {
    console.error(`- ${regression}`);
  }
  process.exit(1);
}

console.log("JSDoc fail-on-regression guardrail passed.");

function collectRuntimeFiles() {
  const files = new Set();

  for (const target of RUNTIME_TARGETS) {
    if (target.type === "file") {
      const absolutePath = path.resolve(process.cwd(), target.value);
      if (!fs.existsSync(absolutePath)) continue;
      const relativePath = normalizePath(
        path.relative(process.cwd(), absolutePath)
      );
      if (relativePath.endsWith(".js") && !EXCLUDED_FILES.has(relativePath)) {
        files.add(relativePath);
      }
      continue;
    }

    if (target.type === "dir") {
      collectDirectoryJsFiles(path.resolve(process.cwd(), target.value), files);
    }
  }

  return Array.from(files);
}

function collectDirectoryJsFiles(directoryPath, resultSet) {
  if (!fs.existsSync(directoryPath)) return;

  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      collectDirectoryJsFiles(absolutePath, resultSet);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".js")) continue;

    const relativePath = normalizePath(path.relative(process.cwd(), absolutePath));
    if (EXCLUDED_FILES.has(relativePath)) continue;
    resultSet.add(relativePath);
  }
}

function buildReport(files) {
  const fileReports = [];
  let totalFunctions = 0;
  let documentedFunctions = 0;

  for (const filePath of files) {
    const source = fs.readFileSync(filePath, "utf8");
    const lines = source.split(/\r?\n/);
    const functions = collectFunctionDeclarations(lines);
    const missing = functions.filter(
      (entry) => !hasJsDocBlockBefore(lines, entry.lineNumber - 1)
    );
    const documentedCount = functions.length - missing.length;

    totalFunctions += functions.length;
    documentedFunctions += documentedCount;

    fileReports.push({
      filePath,
      totalFunctions: functions.length,
      documentedFunctions: documentedCount,
      missingFunctions: missing.length,
      coveragePercent: toCoveragePercent(documentedCount, functions.length),
      missingDeclarations: missing,
    });
  }

  fileReports.sort((a, b) => {
    if (b.missingFunctions !== a.missingFunctions) {
      return b.missingFunctions - a.missingFunctions;
    }
    return a.filePath.localeCompare(b.filePath);
  });

  return {
    generatedAt: new Date().toISOString(),
    mode,
    totalFiles: fileReports.length,
    totalFunctions,
    documentedFunctions,
    missingFunctions: totalFunctions - documentedFunctions,
    coveragePercent: toCoveragePercent(documentedFunctions, totalFunctions),
    files: fileReports,
  };
}

function collectFunctionDeclarations(lines) {
  const declarations = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];

    let match = line.match(/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/);
    if (match) {
      declarations.push({
        name: match[1],
        lineNumber: lineIndex + 1,
      });
      continue;
    }

    match = line.match(
      /^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/
    );
    if (match) {
      declarations.push({
        name: match[1],
        lineNumber: lineIndex + 1,
      });
      continue;
    }

    match = line.match(
      /^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?[A-Za-z_$][\w$]*\s*=>/
    );
    if (match) {
      declarations.push({
        name: match[1],
        lineNumber: lineIndex + 1,
      });
      continue;
    }

    match = line.match(
      /^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?function\s*\(/
    );
    if (match) {
      declarations.push({
        name: match[1],
        lineNumber: lineIndex + 1,
      });
    }
  }

  return declarations;
}

function hasJsDocBlockBefore(lines, functionLineIndexZeroBased) {
  let lineIndex = functionLineIndexZeroBased - 1;

  while (lineIndex >= 0 && lines[lineIndex].trim() === "") {
    lineIndex -= 1;
  }

  if (lineIndex < 0) return false;
  if (!lines[lineIndex].includes("*/")) return false;

  while (lineIndex >= 0) {
    const line = lines[lineIndex];
    if (line.includes("/**")) {
      return true;
    }
    if (line.includes("/*") && !line.includes("/**")) {
      return false;
    }
    lineIndex -= 1;
  }

  return false;
}

function toCoveragePercent(documented, total) {
  if (total === 0) return 100;
  return Math.round((documented / total) * 100);
}

function printReport(report) {
  console.log(
    `JSDoc coverage summary: ${report.documentedFunctions}/${report.totalFunctions} functions documented (${report.coveragePercent}%).`
  );

  const filesWithMissing = report.files.filter((file) => file.missingFunctions > 0);
  if (filesWithMissing.length === 0) {
    console.log("All scanned runtime functions have JSDoc coverage.");
    return;
  }

  console.warn(
    `Files with missing JSDoc declarations: ${filesWithMissing.length}/${report.totalFiles}`
  );
  for (const fileReport of filesWithMissing) {
    console.warn(
      `- ${fileReport.filePath}: missing ${fileReport.missingFunctions}/${fileReport.totalFunctions} (coverage ${fileReport.coveragePercent}%)`
    );
    for (const declaration of fileReport.missingDeclarations) {
      console.warn(`  - ${declaration.name} (line ${declaration.lineNumber})`);
    }
  }
}

function writeBaseline(report) {
  const baselinePayload = {
    generatedAt: report.generatedAt,
    totalFiles: report.totalFiles,
    totalFunctions: report.totalFunctions,
    documentedFunctions: report.documentedFunctions,
    missingFunctions: report.missingFunctions,
    coveragePercent: report.coveragePercent,
    files: Object.fromEntries(
      report.files.map((fileReport) => [
        fileReport.filePath,
        {
          totalFunctions: fileReport.totalFunctions,
          documentedFunctions: fileReport.documentedFunctions,
          missingFunctions: fileReport.missingFunctions,
          coveragePercent: fileReport.coveragePercent,
        },
      ])
    ),
  };

  const outputPath = path.resolve(process.cwd(), BASELINE_FILE_PATH);
  fs.writeFileSync(`${outputPath}`, JSON.stringify(baselinePayload, null, 2) + "\n");
  console.log(`Updated JSDoc baseline: ${BASELINE_FILE_PATH}`);
}

function loadBaselineOrFail() {
  const absolutePath = path.resolve(process.cwd(), BASELINE_FILE_PATH);
  if (!fs.existsSync(absolutePath)) {
    console.error(
      `JSDoc baseline file not found: ${BASELINE_FILE_PATH}. Run 'npm run lint:jsdoc:update-baseline' first.`
    );
    process.exit(1);
  }

  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    console.error(`Could not parse baseline file ${BASELINE_FILE_PATH}:`, error);
    process.exit(1);
  }
}

function detectRegressions(report, baseline) {
  const regressions = [];

  if (
    typeof baseline.missingFunctions === "number" &&
    report.missingFunctions > baseline.missingFunctions
  ) {
    regressions.push(
      `overall missing declarations increased (${baseline.missingFunctions} -> ${report.missingFunctions})`
    );
  }

  if (
    typeof baseline.coveragePercent === "number" &&
    report.coveragePercent < baseline.coveragePercent
  ) {
    regressions.push(
      `overall coverage decreased (${baseline.coveragePercent}% -> ${report.coveragePercent}%)`
    );
  }

  const baselineFiles = baseline.files && typeof baseline.files === "object"
    ? baseline.files
    : {};

  for (const fileReport of report.files) {
    const baselineFile = baselineFiles[fileReport.filePath];
    if (!baselineFile) {
      if (fileReport.missingFunctions > 0) {
        regressions.push(
          `${fileReport.filePath} is new in scope and has ${fileReport.missingFunctions} missing declarations`
        );
      }
      continue;
    }

    if (
      typeof baselineFile.missingFunctions === "number" &&
      fileReport.missingFunctions > baselineFile.missingFunctions
    ) {
      regressions.push(
        `${fileReport.filePath} missing declarations increased (${baselineFile.missingFunctions} -> ${fileReport.missingFunctions})`
      );
    }
  }

  return regressions;
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}
