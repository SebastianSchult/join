#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");

const HTML_FILES = fs
  .readdirSync(process.cwd())
  .filter((fileName) => fileName.endsWith(".html"))
  .sort();

const findings = [];

for (const htmlFile of HTML_FILES) {
  const absolutePath = path.resolve(process.cwd(), htmlFile);
  const htmlSource = fs.readFileSync(absolutePath, "utf8");

  const anchorTagPattern = /<a\b[^>]*>/gi;
  let match;

  while ((match = anchorTagPattern.exec(htmlSource)) !== null) {
    const tag = match[0];
    const targetValue = readAttributeValue(tag, "target");
    if (!targetValue || targetValue.toLowerCase() !== "_blank") {
      continue;
    }

    const relValue = readAttributeValue(tag, "rel") || "";
    const relTokens = relValue
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    const missingTokens = [];

    if (!relTokens.includes("noopener")) {
      missingTokens.push("noopener");
    }
    if (!relTokens.includes("noreferrer")) {
      missingTokens.push("noreferrer");
    }

    if (missingTokens.length === 0) {
      continue;
    }

    findings.push({
      file: htmlFile,
      line: getLineNumber(htmlSource, match.index),
      missingTokens,
      tag,
    });
  }
}

if (findings.length > 0) {
  console.error(
    `External-link guardrail failed: ${findings.length} target=\"_blank\" anchor(s) missing rel tokens.`
  );
  findings.forEach((finding) => {
    console.error(
      `- ${finding.file}:${finding.line} missing [${finding.missingTokens.join(
        ", "
      )}] -> ${finding.tag}`
    );
  });
  process.exit(1);
}

console.log(
  "External-link guardrail passed: all target=\"_blank\" anchors include rel=\"noopener noreferrer\"."
);

/**
 * Returns an HTML attribute value from a tag string.
 *
 * @param {string} tagSource - Raw HTML tag source.
 * @param {string} attributeName - HTML attribute name.
 * @returns {string|null}
 */
function readAttributeValue(tagSource, attributeName) {
  const pattern = new RegExp(
    `\\b${attributeName}\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))`,
    "i"
  );
  const attributeMatch = tagSource.match(pattern);
  if (!attributeMatch) {
    return null;
  }
  return attributeMatch[1] || attributeMatch[2] || attributeMatch[3] || "";
}

/**
 * Returns the 1-based line number for a string index.
 *
 * @param {string} source - Source string.
 * @param {number} index - Character index.
 * @returns {number}
 */
function getLineNumber(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}
