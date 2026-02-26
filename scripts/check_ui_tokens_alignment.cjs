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

const violations = [];

if (!fs.existsSync(TOKEN_FILE)) {
  console.error(`Missing token file: ${TOKEN_FILE}`);
  process.exit(1);
}

const tokenSource = fs.readFileSync(TOKEN_FILE, "utf8");
const tokenValues = readBreakpointTokenValues(tokenSource);

const cssChecks = [
  { file: "assets/css/header.css", kind: "max", token: "mobileMax" },
  { file: "assets/css/navigation.css", kind: "max", token: "navigationTabletMax" },
  { file: "assets/css/navigation.css", kind: "max", token: "mobileMax" },
  { file: "assets/css/navigation.css", kind: "max", token: "phoneMax" },
  { file: "assets/css/board.css", kind: "max", token: "boardColumnsMax" },
  { file: "assets/css/board.css", kind: "max", token: "mobileMax" },
  { file: "assets/css/board.css", kind: "max", token: "phoneMax" },
  { file: "assets/css/addTask.css", kind: "max", token: "mobileMax" },
  { file: "assets/css/addTask.css", kind: "max", token: "phoneMax" },
  { file: "style.css", kind: "max", token: "mobileMax" },
  { file: "assets/css/legalNotice.css", kind: "max", token: "contentNarrowMax" },
  { file: "assets/css/privacy.css", kind: "max", token: "contentNarrowMax" },
  { file: "assets/css/contacts.css", kind: "max", token: "mobileMax" },
  { file: "assets/css/contacts.css", kind: "min", token: "mobileMin" },
];

for (const check of cssChecks) {
  const absolutePath = path.resolve(process.cwd(), check.file);
  ensureFileContainsBreakpoint(absolutePath, check.kind, tokenValues[check.token], check.token);
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

function readBreakpointTokenValues(source) {
  const values = {};
  for (const [key, tokenName] of Object.entries(CORE_BREAKPOINT_TOKENS)) {
    const match = source.match(
      new RegExp(`${escapeForRegex(tokenName)}\\s*:\\s*(\\d+)px\\s*;`)
    );
    if (!match) {
      violations.push(`Missing breakpoint token '${tokenName}' in ui-tokens.css.`);
      continue;
    }
    values[key] = Number(match[1]);
  }
  return values;
}

function ensureFileContainsBreakpoint(filePath, kind, value, tokenKey) {
  if (!Number.isFinite(value)) {
    violations.push(
      `Token '${tokenKey}' could not be resolved to a numeric pixel value.`
    );
    return;
  }
  if (!fs.existsSync(filePath)) {
    violations.push(`Missing file for token check: ${relative(filePath)}.`);
    return;
  }

  const source = fs.readFileSync(filePath, "utf8");
  const regex = new RegExp(
    `@media[^\\n\\r]*\\(${kind}-width:\\s*${value}px\\)`,
    "i"
  );
  if (!regex.test(source)) {
    violations.push(
      `${relative(filePath)} is expected to use ${kind}-width: ${value}px (token ${tokenKey}).`
    );
  }
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
  const addTaskPath = path.resolve(process.cwd(), "assets/css/addTask.css");
  ensureFileMatches(
    addTaskPath,
    /--addTaskGap-8:\s*var\(--ui-space-xs\);/,
    "assets/css/addTask.css should map --addTaskGap-8 to --ui-space-xs."
  );
  ensureFileMatches(
    addTaskPath,
    /--addTaskGap-12:\s*var\(--ui-space-sm-md\);/,
    "assets/css/addTask.css should map --addTaskGap-12 to --ui-space-sm-md."
  );
  ensureFileMatches(
    addTaskPath,
    /--addTaskGap-24:\s*var\(--ui-space-lg\);/,
    "assets/css/addTask.css should map --addTaskGap-24 to --ui-space-lg."
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

function escapeForRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function relative(filePath) {
  return path.relative(process.cwd(), filePath) || filePath;
}
