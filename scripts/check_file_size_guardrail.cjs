#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");

const RULES = Object.freeze([
  {
    id: "js",
    label: "JavaScript",
    extensions: new Set([".js"]),
    warningLines: 300,
    errorLines: 400,
    include: [
      { type: "dir", value: "js" },
      { type: "dir", value: "assets/templates" },
      { type: "file", value: "script.js" },
    ],
    exceptions: Object.freeze({
      "assets/templates/html_templates.js": Object.freeze({
        maxLines: 650,
        reason:
          "Legacy shared template bundle; scheduled for decomposition into focused template modules.",
      }),
    }),
  },
  {
    id: "css",
    label: "CSS",
    extensions: new Set([".css"]),
    warningLines: 800,
    errorLines: 1000,
    include: [
      { type: "dir", value: "assets/css" },
      { type: "file", value: "style.css" },
    ],
    exceptions: Object.freeze({
      "assets/css/contacts.css": Object.freeze({
        maxLines: 1200,
        reason:
          "Legacy contacts stylesheet; scheduled for modular CSS split by component/responsibility.",
      }),
    }),
  },
]);

const findings = {
  warnings: [],
  errors: [],
};

for (const rule of RULES) {
  const files = collectRuleFiles(rule);
  for (const filePath of files) {
    const source = fs.readFileSync(filePath, "utf8");
    const lineCount = source.split(/\r?\n/).length;
    const exception = rule.exceptions[filePath];
    const maxLines = exception ? exception.maxLines : rule.errorLines;

    if (lineCount > maxLines) {
      findings.errors.push({
        rule,
        filePath,
        lineCount,
        maxLines,
        exception,
      });
      continue;
    }

    if (lineCount > rule.warningLines) {
      findings.warnings.push({
        rule,
        filePath,
        lineCount,
        maxLines,
        exception,
      });
    }
  }
}

if (findings.warnings.length > 0) {
  console.warn(
    `File-size guardrail warnings (${findings.warnings.length}) - consider splitting large files:`
  );
  for (const warning of findings.warnings) {
    console.warn(
      formatFinding("warning", warning, {
        label: `>${warning.rule.warningLines}`,
      })
    );
  }
}

if (findings.errors.length > 0) {
  console.error(
    `File-size guardrail failed: ${findings.errors.length} file(s) exceed configured hard limits.`
  );
  for (const error of findings.errors) {
    console.error(
      formatFinding("error", error, {
        label: `>${error.maxLines}`,
      })
    );
  }
  process.exit(1);
}

if (findings.warnings.length > 0) {
  console.log("File-size guardrail passed with warnings.");
} else {
  console.log("File-size guardrail passed.");
}

function collectRuleFiles(rule) {
  const result = new Set();

  for (const target of rule.include) {
    if (target.type === "file") {
      const absolutePath = path.resolve(process.cwd(), target.value);
      if (!fs.existsSync(absolutePath)) continue;
      const relativePath = normalizePath(path.relative(process.cwd(), absolutePath));
      if (rule.extensions.has(path.extname(relativePath))) {
        result.add(relativePath);
      }
      continue;
    }

    if (target.type === "dir") {
      const absoluteDir = path.resolve(process.cwd(), target.value);
      collectDirectoryFiles(absoluteDir, rule.extensions, result);
    }
  }

  return Array.from(result).sort();
}

function collectDirectoryFiles(dirPath, extensions, result) {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collectDirectoryFiles(fullPath, extensions, result);
      continue;
    }

    if (!entry.isFile()) continue;

    const relativePath = normalizePath(path.relative(process.cwd(), fullPath));
    if (!extensions.has(path.extname(relativePath))) continue;
    result.add(relativePath);
  }
}

function formatFinding(level, finding, threshold) {
  const parts = [
    `[${finding.rule.id.toUpperCase()}][${level}] ${finding.filePath}: ${finding.lineCount} lines`,
    `(warn>${finding.rule.warningLines}, hard>${finding.maxLines})`,
  ];

  if (finding.exception) {
    parts.push(`exception: ${finding.exception.reason}`);
  }

  if (threshold && threshold.label) {
    parts.push(`trigger: ${threshold.label}`);
  }

  return `- ${parts.join(" ")}`;
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}
