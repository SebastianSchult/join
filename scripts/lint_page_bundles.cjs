#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

async function main() {
  const eslintModule = tryLoadEslint();
  if (!eslintModule) {
    console.error(
      "ESLint is not installed. Run `npm install` (or `npm install --no-save eslint@^8.57.1`) first."
    );
    process.exit(1);
  }

  const { ESLint } = eslintModule;
  const pageFiles = fs
    .readdirSync(process.cwd())
    .filter((file) => file.endsWith(".html"))
    .sort();

  const eslint = new ESLint({
    useEslintrc: true,
    ignore: false,
  });

  const lintResults = [];
  const missingScripts = [];

  for (const pageFile of pageFiles) {
    const htmlPath = path.resolve(process.cwd(), pageFile);
    const htmlContent = fs.readFileSync(htmlPath, "utf8");
    const scriptSources = extractScriptSources(htmlContent);

    const bundleParts = [];

    for (const source of scriptSources) {
      if (isRemoteScript(source)) {
        continue;
      }

      const normalizedSource = normalizeScriptSource(source);
      if (!normalizedSource.endsWith(".js")) {
        continue;
      }

      const absoluteScriptPath = path.resolve(path.dirname(htmlPath), normalizedSource);
      if (!fs.existsSync(absoluteScriptPath)) {
        if (normalizedSource === "js/config.js") {
          bundleParts.push("window.JOIN_APP_CONFIG = window.JOIN_APP_CONFIG || {};\n");
          continue;
        }

        missingScripts.push(`${pageFile}: missing local script '${normalizedSource}'`);
        continue;
      }

      const scriptContent = fs.readFileSync(absoluteScriptPath, "utf8");
      bundleParts.push(`/* ---- ${normalizedSource} ---- */\n${scriptContent}\n`);
    }

    if (bundleParts.length === 0) {
      continue;
    }

    const bundleSource = bundleParts.join("\n");
    const virtualFilePath = path.resolve(
      process.cwd(),
      ".lint-page-bundles",
      `${path.basename(pageFile, ".html")}.bundle.js`
    );

    const pageResults = await eslint.lintText(bundleSource, {
      filePath: virtualFilePath,
    });

    lintResults.push(...pageResults);
  }

  if (missingScripts.length > 0) {
    console.error("Missing local scripts referenced in HTML pages:");
    for (const entry of missingScripts) {
      console.error(`- ${entry}`);
    }
    process.exit(1);
  }

  const formatter = await eslint.loadFormatter("stylish");
  const output = formatter.format(lintResults);
  if (output.trim()) {
    console.log(output);
  }

  const errorCount = lintResults.reduce((sum, result) => sum + result.errorCount, 0);
  if (errorCount > 0) {
    process.exit(1);
  }

  console.log("ESLint page-bundle guardrail passed.");
}

function tryLoadEslint() {
  try {
    return require("eslint");
  } catch (error) {
    return null;
  }
}

function extractScriptSources(htmlContent) {
  const scriptRegex =
    /<script\b[^>]*\bsrc\s*=\s*(["'])([^"']+)\1[^>]*><\/script>/gi;
  const sources = [];
  let match;

  while ((match = scriptRegex.exec(htmlContent)) !== null) {
    sources.push(match[2]);
  }

  return sources;
}

function isRemoteScript(src) {
  return /^(https?:)?\/\//i.test(src);
}

function normalizeScriptSource(src) {
  return src.split("?")[0].replace(/^\.\//, "").replace(/^\//, "");
}

main().catch((error) => {
  console.error("Failed to run ESLint page-bundle guardrail:", error);
  process.exit(1);
});
