#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const reportDir = path.resolve(".lighthouseci");
const DEFAULT_MIN_SCORE = 0.7;
const DEFAULT_TARGET_SCORE = 0.85;
const SEVERITY_HINTS = {
  critical: "Fix before merge or use a short-lived exception with issue link + expiry date.",
  serious: "Fix in this or next PR. If deferred, assign an owner and due date.",
  moderate: "Track in backlog and keep improving toward the target threshold.",
  info: "No immediate action required.",
};

function toBoundedScore(rawValue, fallbackScore) {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) {
    return fallbackScore;
  }
  return Math.min(Math.max(parsed, 0), 1);
}

const minScore = toBoundedScore(process.env.A11Y_MIN_SCORE, DEFAULT_MIN_SCORE);
const targetScore = Math.max(minScore, toBoundedScore(process.env.A11Y_TARGET_SCORE, DEFAULT_TARGET_SCORE));

function formatPercent(score) {
  return `${Math.round(score * 100)}%`;
}

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

function classifyPageSeverity(score) {
  if (score < minScore) {
    return {
      severity: "critical",
      reason: `below CI gate (${formatPercent(minScore)})`,
    };
  }
  if (score < targetScore) {
    return {
      severity: "serious",
      reason: `passes gate, but below target (${formatPercent(targetScore)})`,
    };
  }
  if (score < 1) {
    return {
      severity: "moderate",
      reason: "passes target with remaining Lighthouse findings",
    };
  }
  return {
    severity: "info",
    reason: "no Lighthouse accessibility deductions detected",
  };
}

function classifyAuditSeverity(audit) {
  if (audit.scoreDisplayMode === "binary") {
    return audit.score < 1 ? "serious" : "info";
  }

  if (audit.score <= 0.1) {
    return "critical";
  }
  if (audit.score < 0.5) {
    return "serious";
  }
  if (audit.score < 0.9) {
    return "moderate";
  }
  return "info";
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

const pageSeverityTotals = {
  critical: 0,
  serious: 0,
  moderate: 0,
  info: 0,
};
const auditSeverityTotals = {
  critical: 0,
  serious: 0,
  moderate: 0,
  info: 0,
};

console.log(
  `Lighthouse accessibility summary (gate: ${formatPercent(minScore)}, target: ${formatPercent(targetScore)})`
);

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

  const scorePercent = formatPercent(category.score);
  const status = category.score >= minScore ? "PASS" : "FAIL";
  const pageSeverity = classifyPageSeverity(category.score);
  pageSeverityTotals[pageSeverity.severity] += 1;
  console.log(`- ${page}: ${scorePercent} (${status}) [${pageSeverity.severity}] ${pageSeverity.reason}`);
  console.log(`  -> action: ${SEVERITY_HINTS[pageSeverity.severity]}`);

  for (const audit of getFailingAudits(report)) {
    const auditSeverity = classifyAuditSeverity(audit);
    auditSeverityTotals[auditSeverity] += 1;
    const title = audit.title || audit.id || "Untitled audit";
    const score = formatPercent(audit.score || 0);
    console.log(`  -> [${auditSeverity}] ${title} (${score})`);
  }
}

console.log("\nSeverity totals:");
console.log(
  `- Page status: critical=${pageSeverityTotals.critical}, serious=${pageSeverityTotals.serious}, moderate=${pageSeverityTotals.moderate}, info=${pageSeverityTotals.info}`
);
console.log(
  `- Top failing audits: critical=${auditSeverityTotals.critical}, serious=${auditSeverityTotals.serious}, moderate=${auditSeverityTotals.moderate}, info=${auditSeverityTotals.info}`
);
