#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
let versionArg = null;
let dryRun = false;

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--dry-run") {
    dryRun = true;
    continue;
  }
  if (arg === "--version") {
    versionArg = args[i + 1] || null;
    i += 1;
    continue;
  }
}

const rawVersion = versionArg || process.env.ASSET_VERSION || "";
const assetVersion = normalizeAssetVersion(rawVersion);

if (!assetVersion) {
  console.error(
    "Missing asset version. Pass --version <value> or set ASSET_VERSION."
  );
  process.exit(1);
}

const rootDir = process.cwd();
const htmlFiles = fs
  .readdirSync(rootDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html"))
  .map((entry) => entry.name)
  .sort();

let totalRewrites = 0;
let changedFiles = 0;

for (const htmlFile of htmlFiles) {
  const htmlPath = path.join(rootDir, htmlFile);
  const original = fs.readFileSync(htmlPath, "utf8");

  let rewritesInFile = 0;
  const updated = original.replace(
    /(<(?:script|link)\b[^>]*?\b(?:src|href)=["'])([^"']+)(["'])/gi,
    (fullMatch, prefix, url, suffix) => {
      const rewrittenUrl = withAssetVersion(url, assetVersion);
      if (rewrittenUrl === url) {
        return fullMatch;
      }
      rewritesInFile += 1;
      return `${prefix}${rewrittenUrl}${suffix}`;
    }
  );

  if (rewritesInFile === 0) {
    continue;
  }

  changedFiles += 1;
  totalRewrites += rewritesInFile;

  if (!dryRun) {
    fs.writeFileSync(htmlPath, updated, "utf8");
  }

  console.log(
    `${dryRun ? "[dry-run] " : ""}${htmlFile}: updated ${rewritesInFile} asset reference(s).`
  );
}

console.log(
  `${dryRun ? "[dry-run] " : ""}Done. Files changed: ${changedFiles}, references updated: ${totalRewrites}, version: ${assetVersion}`
);

function normalizeAssetVersion(value) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const safe = trimmed.replace(/[^A-Za-z0-9._-]/g, "");
  if (!safe) {
    return "";
  }

  return safe.length > 20 ? safe.slice(0, 20) : safe;
}

function withAssetVersion(url, version) {
  if (!isLocalStaticAsset(url)) {
    return url;
  }

  const hashIndex = url.indexOf("#");
  const hashPart = hashIndex >= 0 ? url.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;

  const queryIndex = withoutHash.indexOf("?");
  const assetPath = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const queryPart = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : "";

  const params = new URLSearchParams(queryPart);
  params.delete("v");
  params.set("v", version);

  return `${assetPath}?${params.toString()}${hashPart}`;
}

function isLocalStaticAsset(url) {
  if (typeof url !== "string") {
    return false;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return false;
  }

  if (trimmed.startsWith("#")) {
    return false;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return false;
  }

  if (trimmed.startsWith("//")) {
    return false;
  }

  const pathPart = trimmed.split("?")[0].split("#")[0].toLowerCase();
  return pathPart.endsWith(".js") || pathPart.endsWith(".css");
}
