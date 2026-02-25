#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const reportDir = path.resolve(".lighthouseci");
const minScore = Number(process.env.A11Y_MIN_SCORE || "0.5");

function toPathLabel(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return `${url.pathname}${url.search}` || "/";
  } catch (_error) {
    return rawUrl || "<unknown>";
  }
}

function getFailingAudits(report) {
  const audits = Object.values(report.audits || {});
  return audits
    .filter((audit) => typeof audit.score === "number" && audit.score < 1)
    .filter((audit) => audit.scoreDisplayMode === "binary" || audit.scoreDisplayMode === "numeric")
    .sort((left, right) => left.score - right.score)
    .slice(0, 3);
}

if (!fs.existsSync(reportDir)) {
  console.log("No .lighthouseci directory found. Skipping Lighthouse summary.");
  process.exit(0);
}

const reportFiles = fs
  .readdirSync(reportDir)
  .filter((fileName) => fileName.startsWith("lhr-") && fileName.endsWith(".json"))
  .sort();

if (reportFiles.length === 0) {
  console.log("No Lighthouse JSON reports found. Skipping Lighthouse summary.");
  process.exit(0);
}

console.log(`Lighthouse accessibility summary (threshold: ${Math.round(minScore * 100)}%)`);

for (const reportFile of reportFiles) {
  const reportPath = path.join(reportDir, reportFile);
  let report;
  try {
    report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  } catch (error) {
    console.warn(`- ${reportFile}: failed to parse report JSON (${error.message})`);
    continue;
  }

  const page = toPathLabel(report.finalDisplayedUrl || report.requestedUrl);
  const category = report.categories && report.categories.accessibility;

  if (!category || typeof category.score !== "number") {
    console.warn(`- ${page}: accessibility score missing`);
    continue;
  }

  const scorePercent = Math.round(category.score * 100);
  const status = category.score >= minScore ? "PASS" : "FAIL";
  console.log(`- ${page}: ${scorePercent}% (${status})`);

  for (const audit of getFailingAudits(report)) {
    const title = audit.title || audit.id || "Untitled audit";
    const score = Math.round((audit.score || 0) * 100);
    console.log(`  -> ${title} (${score}%)`);
  }
}
