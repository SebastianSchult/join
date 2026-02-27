#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const { classifyIssue } = require("./issue_triage_classifier.cjs");

const fixturesPath = path.resolve(
  __dirname,
  "fixtures.issue_triage_classifier.json"
);
const fixtures = JSON.parse(fs.readFileSync(fixturesPath, "utf8"));

const failures = [];

for (const fixture of fixtures) {
  const issue = fixture.issue || {};
  const actualLabels = classifyIssue(issue);
  const actualSet = new Set(actualLabels);

  const expectedIncludes = Array.isArray(fixture.expectInclude)
    ? fixture.expectInclude
    : [];
  const expectedExcludes = Array.isArray(fixture.expectExclude)
    ? fixture.expectExclude
    : [];

  const missing = expectedIncludes.filter((label) => !actualSet.has(label));
  const unexpected = expectedExcludes.filter((label) => actualSet.has(label));

  if (missing.length === 0 && unexpected.length === 0) {
    console.log(`PASS: ${fixture.name}`);
    continue;
  }

  failures.push({
    name: fixture.name,
    missing,
    unexpected,
    actual: actualLabels,
  });
}

if (failures.length > 0) {
  console.error(
    `Issue triage classifier fixture tests failed (${failures.length}).`
  );
  failures.forEach((failure) => {
    console.error(`- ${failure.name}`);
    if (failure.missing.length > 0) {
      console.error(`  missing labels: ${failure.missing.join(", ")}`);
    }
    if (failure.unexpected.length > 0) {
      console.error(`  unexpected labels: ${failure.unexpected.join(", ")}`);
    }
    console.error(`  actual labels: ${failure.actual.join(", ")}`);
  });
  process.exit(1);
}

console.log(
  `Issue triage classifier fixture tests passed (${fixtures.length} fixtures).`
);
