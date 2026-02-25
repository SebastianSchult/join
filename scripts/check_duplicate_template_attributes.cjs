#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const files = [];
const roots = ["js", "assets/templates"];

for (const root of roots) {
  collectJsFiles(root);
}
files.push("script.js");

const violations = [];
const tagRegex = /<(?!\/|!)([A-Za-z][\w:-]*)(?=[\s/>])([^<>]*)>/g;

for (const file of files) {
  if (!fs.existsSync(file)) continue;

  const source = fs.readFileSync(file, "utf8");
  let match;

  while ((match = tagRegex.exec(source)) !== null) {
    const attributeText = match[2] || "";
    const names = parseAttributeNames(attributeText);
    const counts = new Map();

    for (const name of names) {
      counts.set(name, (counts.get(name) || 0) + 1);
    }

    const duplicates = [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([name]) => name);

    if (duplicates.length > 0) {
      const lineNumber = source.slice(0, match.index).split(/\r?\n/).length;
      const compactTag = match[0].replace(/\s+/g, " ").trim();
      violations.push(
        `${file}:${lineNumber} duplicate attribute(s): ${duplicates.join(
          ", "
        )} | ${compactTag}`
      );
    }
  }

  tagRegex.lastIndex = 0;
}

if (violations.length > 0) {
  console.error("Duplicate inline HTML attributes found:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Duplicate attribute guardrail passed.");

function collectJsFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectJsFiles(fullPath);
    } else if (entry.isFile() && fullPath.endsWith(".js")) {
      files.push(fullPath);
    }
  }
}

function parseAttributeNames(attributeText) {
  const names = [];
  let i = 0;

  while (i < attributeText.length) {
    while (i < attributeText.length && /\s/.test(attributeText[i])) i++;
    if (i >= attributeText.length) break;

    if (attributeText[i] === "/") {
      i++;
      continue;
    }

    const start = i;
    while (i < attributeText.length && !/[\s=/>]/.test(attributeText[i])) {
      i++;
    }

    if (i === start) {
      i++;
      continue;
    }

    names.push(attributeText.slice(start, i).toLowerCase());

    while (i < attributeText.length && /\s/.test(attributeText[i])) i++;

    if (i < attributeText.length && attributeText[i] === "=") {
      i++;
      while (i < attributeText.length && /\s/.test(attributeText[i])) i++;

      if (
        i < attributeText.length &&
        (attributeText[i] === '"' || attributeText[i] === "'")
      ) {
        const quote = attributeText[i];
        i++;
        while (i < attributeText.length && attributeText[i] !== quote) i++;
        if (i < attributeText.length && attributeText[i] === quote) i++;
      } else {
        while (i < attributeText.length && !/[\s>]/.test(attributeText[i])) i++;
      }
    }
  }

  return names;
}
