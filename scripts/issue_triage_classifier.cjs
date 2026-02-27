#!/usr/bin/env node

"use strict";

const TYPE_LABEL_BY_TAG = Object.freeze({
  bug: "type: bug",
  security: "type: security",
  refactor: "type: refactor",
  chore: "type: chore",
  feature: "type: feature",
  enhancement: "type: feature",
});

const AREA_LABEL_BY_TAG = Object.freeze({
  auth: "area: auth",
  board: "area: board",
  contacts: "area: contacts",
  contact: "area: contacts",
  summary: "area: summary",
  storage: "area: storage",
  ui: "area: ui",
  tooling: "area: tooling",
  accessibility: "area: ui",
  a11y: "area: ui",
});

/**
 * Classifies labels for an issue based on title/body template fields and
 * conservative fallback heuristics.
 *
 * Rules:
 * - explicit title tags have highest priority
 * - template fields (`Priority`, `Area`) are preferred over free-text matching
 * - broad body keyword matching is intentionally avoided to reduce false positives
 *
 * @param {{title?:string, body?:string, existingLabels?:string[]}} issueData - Issue payload subset.
 * @returns {string[]} Labels to add (already excludes existing labels).
 */
function classifyIssue(issueData = {}) {
  const title = typeof issueData.title === "string" ? issueData.title : "";
  const body = typeof issueData.body === "string" ? issueData.body : "";
  const existingLabels = Array.isArray(issueData.existingLabels)
    ? issueData.existingLabels
    : [];

  const existingSet = new Set(existingLabels);
  const labels = new Set(["needs-triage", "status: backlog"]);

  const hasTypeLabel = [...existingSet].some((label) =>
    label.startsWith("type: ")
  );
  const hasPriorityLabel = [...existingSet].some((label) =>
    label.startsWith("priority: ")
  );
  const hasAreaLabel = [...existingSet].some((label) =>
    label.startsWith("area: ")
  );

  if (!hasPriorityLabel) {
    const priority = extractPriority(title, body);
    if (priority) {
      labels.add(`priority: ${priority}`);
    }
  }

  if (!hasTypeLabel) {
    const typeLabel = classifyType(title, body);
    if (typeLabel) {
      labels.add(typeLabel);
    }
  }

  if (!hasAreaLabel) {
    const areaLabel = classifyArea(title, body);
    if (areaLabel) {
      labels.add(areaLabel);
    }
  }

  return [...labels].filter((label) => !existingSet.has(label));
}

/**
 * Extracts normalized priority token.
 *
 * @param {string} title - Issue title.
 * @param {string} body - Issue body.
 * @returns {string|null} `p0..p3` or null.
 */
function extractPriority(title, body) {
  const titleMatch = title.match(/\[(p[0-3])\]/i);
  if (titleMatch) {
    return titleMatch[1].toLowerCase();
  }

  const priorityField = extractTemplateFieldValue(body, "Priority");
  if (priorityField) {
    const fieldMatch = priorityField.match(/\b(p[0-3])\b/i);
    if (fieldMatch) {
      return fieldMatch[1].toLowerCase();
    }
  }

  const genericMatch = `${title}\n${body}`.match(/\b(p[0-3])\b/i);
  if (genericMatch) {
    return genericMatch[1].toLowerCase();
  }

  return null;
}

/**
 * Resolves issue type label from explicit tags and narrow signals.
 *
 * @param {string} title - Issue title.
 * @param {string} body - Issue body.
 * @returns {string|null}
 */
function classifyType(title, body) {
  const titleTags = extractBracketTags(title);

  for (const tag of titleTags) {
    const typeFromTag = TYPE_LABEL_BY_TAG[tag];
    if (typeFromTag) {
      return typeFromTag;
    }
  }

  if (hasTemplateHeading(body, "Proposed Refactor")) {
    return "type: refactor";
  }
  if (hasTemplateHeading(body, "Steps To Reproduce")) {
    return "type: bug";
  }
  if (
    hasTemplateHeading(body, "Risk / Impact") &&
    hasTemplateHeading(body, "Proposed Mitigation")
  ) {
    return "type: security";
  }
  if (hasTemplateHeading(body, "Engineering Value")) {
    return "type: chore";
  }

  const lowerTitle = title.toLowerCase();
  if (
    /\b(security|xss|csrf|sqli|sql injection|rce|ssrf|auth bypass|privilege escalation|token leak|credential leak|secret leak)\b/i.test(
      lowerTitle
    )
  ) {
    return "type: security";
  }
  if (/\b(bug|regression|crash|broken|fails?)\b/i.test(lowerTitle)) {
    return "type: bug";
  }
  if (/\b(refactor|cleanup|technical debt)\b/i.test(lowerTitle)) {
    return "type: refactor";
  }
  if (/\b(chore|ci|workflow|tooling|maintenance|docs?)\b/i.test(lowerTitle)) {
    return "type: chore";
  }
  if (/\b(feature|enhancement)\b/i.test(lowerTitle)) {
    return "type: feature";
  }

  return null;
}

/**
 * Resolves issue area label from template fields and title-focused signals.
 *
 * @param {string} title - Issue title.
 * @param {string} body - Issue body.
 * @returns {string|null}
 */
function classifyArea(title, body) {
  const areaFieldValue = extractTemplateFieldValue(body, "Area");
  if (areaFieldValue) {
    const areaFromField = mapAreaValue(areaFieldValue);
    if (areaFromField) {
      return areaFromField;
    }
  }

  const titleTags = extractBracketTags(title);
  for (const tag of titleTags) {
    const areaFromTag = AREA_LABEL_BY_TAG[tag];
    if (areaFromTag) {
      return areaFromTag;
    }
  }

  const lowerTitle = title.toLowerCase();
  if (/\b(auth|login|signup|session|remember me)\b/i.test(lowerTitle)) {
    return "area: auth";
  }
  if (/\b(board|kanban|subtask|drag\/drop|drag)\b/i.test(lowerTitle)) {
    return "area: board";
  }
  if (/\b(contacts?)\b/i.test(lowerTitle)) {
    return "area: contacts";
  }
  if (/\b(summary|dashboard|greeting)\b/i.test(lowerTitle)) {
    return "area: summary";
  }
  if (/\b(storage|firebase|database|api|fetch)\b/i.test(lowerTitle)) {
    return "area: storage";
  }
  if (/\b(tooling|workflow|ci|pipeline|lint|github)\b/i.test(lowerTitle)) {
    return "area: tooling";
  }
  if (/\b(ui|css|layout|responsive|accessibility|a11y|ux)\b/i.test(lowerTitle)) {
    return "area: ui";
  }

  return null;
}

/**
 * Extracts value lines below a markdown `### <label>` heading.
 *
 * @param {string} body - Issue markdown body.
 * @param {string} fieldName - Heading label.
 * @returns {string|null}
 */
function extractTemplateFieldValue(body, fieldName) {
  if (typeof body !== "string" || body.trim() === "") {
    return null;
  }

  const lines = body.split(/\r?\n/);
  const headingRegex = new RegExp(`^###\\s*${escapeRegExp(fieldName)}\\s*$`, "i");

  for (let index = 0; index < lines.length; index++) {
    if (!headingRegex.test(lines[index].trim())) {
      continue;
    }

    const valueLines = [];
    for (let cursor = index + 1; cursor < lines.length; cursor++) {
      const line = lines[cursor];
      const trimmed = line.trim();

      if (/^###\s+/.test(trimmed)) {
        break;
      }
      if (!trimmed || /^_?no response_?$/i.test(trimmed)) {
        continue;
      }

      valueLines.push(trimmed.replace(/^-+\s*/, ""));
    }

    if (valueLines.length > 0) {
      return valueLines.join(" ").trim();
    }

    return null;
  }

  return null;
}

/**
 * Checks whether a markdown heading exists.
 *
 * @param {string} body - Issue markdown body.
 * @param {string} heading - Heading text.
 * @returns {boolean}
 */
function hasTemplateHeading(body, heading) {
  if (typeof body !== "string" || body.trim() === "") {
    return false;
  }
  const headingRegex = new RegExp(`^###\\s*${escapeRegExp(heading)}\\s*$`, "im");
  return headingRegex.test(body);
}

/**
 * Converts a free-form area value to area label.
 *
 * @param {string} value - Area field value.
 * @returns {string|null}
 */
function mapAreaValue(value) {
  const normalized = value.toLowerCase();

  if (normalized.includes("auth")) return "area: auth";
  if (normalized.includes("board")) return "area: board";
  if (normalized.includes("contact")) return "area: contacts";
  if (normalized.includes("summary")) return "area: summary";
  if (
    normalized.includes("storage") ||
    normalized.includes("firebase") ||
    normalized.includes("api")
  ) {
    return "area: storage";
  }
  if (
    normalized.includes("tool") ||
    normalized.includes("ci") ||
    normalized.includes("workflow")
  ) {
    return "area: tooling";
  }
  if (
    normalized.includes("ui") ||
    normalized.includes("css") ||
    normalized.includes("accessibility") ||
    normalized.includes("a11y")
  ) {
    return "area: ui";
  }

  return null;
}

/**
 * Extracts lowercased bracket tags from title (e.g. [P1][Bug][UI]).
 *
 * @param {string} title - Issue title.
 * @returns {string[]}
 */
function extractBracketTags(title) {
  if (typeof title !== "string" || title.trim() === "") {
    return [];
  }

  const tags = [];
  const pattern = /\[([^\]]+)\]/g;
  let match;
  while ((match = pattern.exec(title)) !== null) {
    tags.push(match[1].trim().toLowerCase());
  }
  return tags;
}

/**
 * Escapes regex metacharacters.
 *
 * @param {string} value - Raw string.
 * @returns {string}
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
  classifyIssue,
  classifyType,
  classifyArea,
  extractPriority,
  extractTemplateFieldValue,
};
