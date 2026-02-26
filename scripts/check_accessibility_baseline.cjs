#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const HTML_FILES = [
  "index.html",
  "signUp.html",
  "summary.html",
  "board.html",
  "addTask.html",
  "contacts.html",
  "help.html",
  "privacy.html",
  "legal_notice.html",
  "privacy_external.html",
  "legal_notice_external.html",
];

const TEMPLATE_FILES = [
  "assets/templates/templates_shared.js",
  "assets/templates/templates_navigation_auth.js",
  "assets/templates/templates_board.js",
  "assets/templates/templates_addtask.js",
  "js/contacts_render.js",
];

const INTERACTION_ATTRIBUTE_PATTERN =
  /\b(data-action|data-submit-action|data-keyup-action|data-dblclick-action|data-hover-action|data-leave-action)\b/i;
const NON_SEMANTIC_INTERACTIVE_PATTERN =
  /<(div|span|img|p|li|h[1-6])\b[^>]*\b(data-action|data-submit-action|data-keyup-action|data-dblclick-action|data-hover-action|data-leave-action)\b[^>]*>/gi;

const findings = [];

function readFileSafe(relativeFilePath) {
  const absolutePath = path.resolve(relativeFilePath);
  if (!fs.existsSync(absolutePath)) {
    findings.push({
      severity: "critical",
      filePath: relativeFilePath,
      line: 1,
      message: "File is missing and could not be audited.",
    });
    return null;
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function getLineNumber(content, index) {
  return content.slice(0, index).split("\n").length;
}

function hasAccessibleNameOnButton(attributes) {
  return /\baria-label\s*=\s*["'][^"']+["']/i.test(attributes)
    || /\baria-labelledby\s*=\s*["'][^"']+["']/i.test(attributes)
    || /\btitle\s*=\s*["'][^"']+["']/i.test(attributes);
}

function extractAttribute(tagMarkup, attributeName) {
  const attributePattern = new RegExp(
    `\\b${attributeName}\\s*=\\s*["']([^"']+)["']`,
    "i"
  );
  const match = tagMarkup.match(attributePattern);
  return match ? match[1] : "";
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function auditNonSemanticInteractiveElements(filePath, content) {
  let match;
  NON_SEMANTIC_INTERACTIVE_PATTERN.lastIndex = 0;
  while ((match = NON_SEMANTIC_INTERACTIVE_PATTERN.exec(content)) !== null) {
    findings.push({
      severity: "critical",
      filePath,
      line: getLineNumber(content, match.index),
      message: `Non-semantic interactive element <${match[1]}> uses delegated interaction attributes.`,
    });
  }
}

function auditIconOnlyButtons(filePath, content) {
  const buttonPattern = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
  let buttonMatch;

  while ((buttonMatch = buttonPattern.exec(content)) !== null) {
    const [rawMarkup, attributes, innerMarkup] = buttonMatch;
    const hasAccessibleName = hasAccessibleNameOnButton(attributes);
    if (hasAccessibleName) {
      continue;
    }

    const visibleText = innerMarkup
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\$\{[^}]+\}/g, " dynamic-text ")
      .trim();

    if (visibleText.length > 0) {
      continue;
    }

    findings.push({
      severity: "serious",
      filePath,
      line: getLineNumber(content, buttonMatch.index),
      message:
        "Icon-only button is missing accessible naming (aria-label, aria-labelledby, or title).",
      snippet: rawMarkup.slice(0, 120).replace(/\s+/g, " "),
    });
  }
}

function auditHtmlIncludesAccessibilityStyles(filePath, content) {
  if (!/href=["'][^"']*accessibility\.css["']/i.test(content)) {
    findings.push({
      severity: "serious",
      filePath,
      line: 1,
      message: "Page does not include assets/css/accessibility.css.",
    });
  }
}

function auditHtmlInputLabels(filePath, content) {
  const inputPattern = /<input\b[^>]*>/gi;
  let inputMatch;

  while ((inputMatch = inputPattern.exec(content)) !== null) {
    const inputTag = inputMatch[0];
    const inputType = extractAttribute(inputTag, "type").toLowerCase() || "text";
    const ignoredTypes = new Set([
      "hidden",
      "button",
      "submit",
      "reset",
      "image",
      "file",
    ]);

    if (ignoredTypes.has(inputType)) {
      continue;
    }

    const hasAriaLabel =
      /\baria-label\s*=\s*["'][^"']+["']/i.test(inputTag)
      || /\baria-labelledby\s*=\s*["'][^"']+["']/i.test(inputTag);
    if (hasAriaLabel) {
      continue;
    }

    const id = extractAttribute(inputTag, "id");
    if (!id) {
      findings.push({
        severity: "serious",
        filePath,
        line: getLineNumber(content, inputMatch.index),
        message: "Form input is missing both id and accessible name.",
      });
      continue;
    }

    const labelPattern = new RegExp(
      `<label\\b[^>]*\\bfor=["']${escapeRegExp(id)}["']`,
      "i"
    );
    if (labelPattern.test(content)) {
      continue;
    }

    findings.push({
      severity: "serious",
      filePath,
      line: getLineNumber(content, inputMatch.index),
      message: `Input #${id} has no associated label and no aria-label.`,
    });
  }
}

function auditFile(filePath, options = {}) {
  const content = readFileSafe(filePath);
  if (content == null) {
    return;
  }

  auditNonSemanticInteractiveElements(filePath, content);
  auditIconOnlyButtons(filePath, content);

  if (options.isHtml) {
    auditHtmlIncludesAccessibilityStyles(filePath, content);
    auditHtmlInputLabels(filePath, content);
  }
}

for (const htmlFile of HTML_FILES) {
  auditFile(htmlFile, { isHtml: true });
}

for (const templateFile of TEMPLATE_FILES) {
  auditFile(templateFile, { isHtml: false });
}

const criticalFindings = findings.filter((entry) => entry.severity === "critical");
const seriousFindings = findings.filter((entry) => entry.severity === "serious");

if (findings.length === 0) {
  console.log("Accessibility audit passed: no critical/serious findings.");
  process.exit(0);
}

console.error(
  `Accessibility audit failed: ${criticalFindings.length} critical, ${seriousFindings.length} serious findings.`
);
for (const finding of findings) {
  const baseMessage = `[${finding.severity}] ${finding.filePath}:${finding.line} ${finding.message}`;
  if (finding.snippet) {
    console.error(`${baseMessage}\n  -> ${finding.snippet}`);
  } else {
    console.error(baseMessage);
  }
}

process.exit(1);
