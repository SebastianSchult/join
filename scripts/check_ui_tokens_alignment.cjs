#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const TOKEN_FILE = path.resolve(process.cwd(), "assets/css/ui-tokens.css");

const CORE_BREAKPOINT_TOKENS = Object.freeze({
  mobileMax: "--ui-bp-mobile-max",
  mobileMin: "--ui-bp-mobile-min",
  navigationTabletMax: "--ui-bp-navigation-tablet-max",
  phoneMax: "--ui-bp-phone-max",
  contentNarrowMax: "--ui-bp-content-narrow-max",
  boardColumnsMax: "--ui-bp-board-columns-max",
});

const MAX_ALLOWED_BREAKPOINT_VARIANTS = 30;

const violations = [];

if (!fs.existsSync(TOKEN_FILE)) {
  console.error(`Missing token file: ${TOKEN_FILE}`);
  process.exit(1);
}

const tokenSource = fs.readFileSync(TOKEN_FILE, "utf8");
const breakpointTokens = readBreakpointTokens(tokenSource);
const tokenValues = readCoreBreakpointValues(breakpointTokens);
const approvedBreakpointValues = new Set(Object.values(breakpointTokens));

if (approvedBreakpointValues.size === 0) {
  violations.push("No '--ui-bp-*' breakpoint tokens found in assets/css/ui-tokens.css.");
}

const referencedStylesheets = collectReferencedStylesheets();
const discoveredBreakpointValues = collectStylesheetBreakpointValues(
  referencedStylesheets,
  approvedBreakpointValues
);

if (discoveredBreakpointValues.size > MAX_ALLOWED_BREAKPOINT_VARIANTS) {
  violations.push(
    `Too many breakpoint variants in referenced stylesheets (${discoveredBreakpointValues.size}). ` +
      `Limit is ${MAX_ALLOWED_BREAKPOINT_VARIANTS}.`
  );
}

assertBreakpointFallbacks(tokenValues);
assertJsBreakpointUsage();
assertTokenizedSpacingUsage();

if (violations.length > 0) {
  console.error("UI token alignment check failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("UI token alignment guardrail passed.");

function readBreakpointTokens(source) {
  const tokens = {};
  const regex = /(--ui-bp-[a-z0-9-]+)\s*:\s*(\d+)px\s*;/gi;
  let match;

  while ((match = regex.exec(source)) !== null) {
    tokens[match[1]] = Number(match[2]);
  }

  return tokens;
}

function readCoreBreakpointValues(tokens) {
  const values = {};

  for (const [key, tokenName] of Object.entries(CORE_BREAKPOINT_TOKENS)) {
    const value = tokens[tokenName];
    if (!Number.isFinite(value)) {
      violations.push(`Missing breakpoint token '${tokenName}' in ui-tokens.css.`);
      continue;
    }
    values[key] = value;
  }

  return values;
}

function collectReferencedStylesheets() {
  const htmlFiles = fs
    .readdirSync(process.cwd())
    .filter((file) => file.endsWith(".html"))
    .sort();

  const stylesheets = new Set();

  for (const htmlFile of htmlFiles) {
    const absoluteHtmlPath = path.resolve(process.cwd(), htmlFile);
    const source = fs.readFileSync(absoluteHtmlPath, "utf8");
    const linkRegex = /<link\b[^>]*>/gi;
    let match;

    while ((match = linkRegex.exec(source)) !== null) {
      const linkTag = match[0];
      const hrefMatch = linkTag.match(/\bhref\s*=\s*(["'])([^"']+)\1/i);
      if (!hrefMatch) {
        continue;
      }

      const relMatch = linkTag.match(/\brel\s*=\s*(["'])([^"']+)\1/i);
      const relValue = relMatch ? relMatch[2].toLowerCase() : "";
      const hrefValue = hrefMatch[2];

      if (isRemoteSource(hrefValue)) {
        continue;
      }

      if (!relValue.includes("stylesheet") && !hrefValue.endsWith(".css")) {
        continue;
      }

      const normalizedHref = normalizeAssetSource(hrefValue);
      if (!normalizedHref.endsWith(".css")) {
        continue;
      }

      const absoluteCssPath = path.resolve(path.dirname(absoluteHtmlPath), normalizedHref);
      if (!fs.existsSync(absoluteCssPath)) {
        violations.push(`${htmlFile}: missing stylesheet '${normalizedHref}'.`);
        continue;
      }

      addCssWithImports(stylesheets, absoluteCssPath);
    }
  }

  return stylesheets;
}

function addCssWithImports(targetSet, absoluteCssPath) {
  if (targetSet.has(absoluteCssPath)) {
    return;
  }

  targetSet.add(absoluteCssPath);
  const source = fs.readFileSync(absoluteCssPath, "utf8");
  const importRegex = /@import\s+(?:url\(\s*(["']?)([^"')]+)\1\s*\)|(["'])([^"']+)\3)\s*;/gi;
  let match;

  while ((match = importRegex.exec(source)) !== null) {
    const importPath = match[2] || match[4];
    if (!importPath || isRemoteSource(importPath)) {
      continue;
    }

    const normalizedImportPath = normalizeAssetSource(importPath);
    if (!normalizedImportPath.endsWith(".css")) {
      continue;
    }

    const absoluteImportPath = path.resolve(path.dirname(absoluteCssPath), normalizedImportPath);
    if (!fs.existsSync(absoluteImportPath)) {
      violations.push(
        `${relative(absoluteCssPath)}: missing imported stylesheet '${normalizedImportPath}'.`
      );
      continue;
    }

    addCssWithImports(targetSet, absoluteImportPath);
  }
}

function collectStylesheetBreakpointValues(stylesheets, approvedValues) {
  const discoveredValues = new Set();

  for (const stylesheetPath of stylesheets) {
    const source = fs.readFileSync(stylesheetPath, "utf8");
    const mediaRegex = /@media[^\n\r{}]*\((max|min)-width\s*:\s*(\d+)px\)/gi;
    let match;

    while ((match = mediaRegex.exec(source)) !== null) {
      const kind = match[1];
      const value = Number(match[2]);
      discoveredValues.add(value);

      if (!approvedValues.has(value)) {
        violations.push(
          `${relative(stylesheetPath)} uses non-token breakpoint '${kind}-width: ${value}px'. ` +
            `Add a matching '--ui-bp-*' token before using this value.`
        );
      }
    }
  }

  return discoveredValues;
}

function assertBreakpointFallbacks(tokenValues) {
  const responsivePath = path.resolve(process.cwd(), "js/responsive-navigation.js");
  if (!fs.existsSync(responsivePath)) {
    violations.push(
      "Missing js/responsive-navigation.js for breakpoint fallback checks."
    );
    return;
  }

  const source = fs.readFileSync(responsivePath, "utf8");
  for (const [key, value] of Object.entries({
    mobileMax: tokenValues.mobileMax,
    navigationTabletMax: tokenValues.navigationTabletMax,
    phoneMax: tokenValues.phoneMax,
    contentNarrowMax: tokenValues.contentNarrowMax,
    boardColumnsMax: tokenValues.boardColumnsMax,
  })) {
    if (!Number.isFinite(value)) {
      continue;
    }
    const regex = new RegExp(`\\b${key}\\s*:\\s*${value}\\b`);
    if (!regex.test(source)) {
      violations.push(
        `js/responsive-navigation.js fallback '${key}' must match token value ${value}px.`
      );
    }
  }
}

function assertJsBreakpointUsage() {
  const summaryPath = path.resolve(process.cwd(), "js/summary.js");
  const boardPaths = [
    path.resolve(process.cwd(), "js/board.js"),
    path.resolve(process.cwd(), "js/board_rendering.js"),
  ];

  ensureFileMatches(
    summaryPath,
    /getUiBreakpointValue\(['"]navigationTabletMax['"]\)/,
    "js/summary.js should read 'navigationTabletMax' via getUiBreakpointValue(...)."
  );
  ensureAnyFileMatches(
    boardPaths,
    /getUiBreakpointValue\(['"]boardColumnsMax['"]\)/,
    "Board runtime should read 'boardColumnsMax' via getUiBreakpointValue(...)."
  );
}

function assertTokenizedSpacingUsage() {
  const addTaskPath = path.resolve(process.cwd(), "assets/css/addTask.base.css");
  ensureFileMatches(
    addTaskPath,
    /--addTaskGap-8:\s*var\(--ui-space-xs\);/,
    "assets/css/addTask.base.css should map --addTaskGap-8 to --ui-space-xs."
  );
  ensureFileMatches(
    addTaskPath,
    /--addTaskGap-12:\s*var\(--ui-space-sm-md\);/,
    "assets/css/addTask.base.css should map --addTaskGap-12 to --ui-space-sm-md."
  );
  ensureFileMatches(
    addTaskPath,
    /--addTaskGap-24:\s*var\(--ui-space-lg\);/,
    "assets/css/addTask.base.css should map --addTaskGap-24 to --ui-space-lg."
  );
}

function ensureFileMatches(filePath, regex, message) {
  if (!fs.existsSync(filePath)) {
    violations.push(`Missing file for token check: ${relative(filePath)}.`);
    return;
  }

  const source = fs.readFileSync(filePath, "utf8");
  if (!regex.test(source)) {
    violations.push(message);
  }
}

function ensureAnyFileMatches(filePaths, regex, message) {
  const existingPaths = filePaths.filter((filePath) => fs.existsSync(filePath));
  if (existingPaths.length === 0) {
    violations.push(`Missing files for token check: ${filePaths.map(relative).join(", ")}.`);
    return;
  }

  const hasMatch = existingPaths.some((filePath) => {
    const source = fs.readFileSync(filePath, "utf8");
    return regex.test(source);
  });

  if (!hasMatch) {
    violations.push(message);
  }
}

function isRemoteSource(value) {
  return /^(https?:)?\/\//i.test(value);
}

function normalizeAssetSource(value) {
  return value.split("?")[0].split("#")[0].replace(/^\.\//, "").replace(/^\//, "");
}

function relative(filePath) {
  return path.relative(process.cwd(), filePath) || filePath;
}
