#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const files = [];
const roots = [
  { dir: "js", extensions: [".js"] },
  { dir: "assets/templates", extensions: [".js", ".html"] },
];

for (const root of roots) {
  collectFiles(root.dir, root.extensions);
}

files.push("script.js");
collectRootHtmlFiles(".");

const violations = [];
const tagRegex = /<(?!\/|!)([A-Za-z][\w:-]*)(?=[\s/>])([^<>]*)>/g;
const inlineEventAttributePattern = /^on[a-z][\w:-]*$/i;

for (const file of files) {
  if (!fs.existsSync(file)) continue;

  const source = fs.readFileSync(file, "utf8");
  let match;

  while ((match = tagRegex.exec(source)) !== null) {
    const attributeText = match[2] || "";
    const names = parseAttributeNames(attributeText);
    const inlineEventAttributes = names.filter((name) =>
      inlineEventAttributePattern.test(name)
    );

    if (inlineEventAttributes.length > 0) {
      const lineNumber = source.slice(0, match.index).split(/\r?\n/).length;
      const compactTag = match[0].replace(/\s+/g, " ").trim();
      violations.push(
        `${file}:${lineNumber} inline event attribute(s): ${inlineEventAttributes.join(
          ", "
        )} | ${compactTag}`
      );
    }
  }

  tagRegex.lastIndex = 0;
}

if (violations.length > 0) {
  console.error("Inline event attributes are not allowed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Inline event attribute guardrail passed.");

function collectFiles(dir, extensions) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, extensions);
    } else if (
      entry.isFile() &&
      extensions.some((extension) => fullPath.endsWith(extension))
    ) {
      files.push(fullPath);
    }
  }
}

function collectRootHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(path.join(dir, entry.name));
    }
  });
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
