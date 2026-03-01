#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const GUARDRAIL_RULES = Object.freeze({
  "no-undef": "error",
  "no-redeclare": "error",
});
const FLAT_FALLBACK_RULES = Object.freeze({
  "no-redeclare": "error",
});

async function main() {
  const pageBundles = collectPageBundles();
  if (pageBundles.missingScripts.length > 0) {
    console.error("Missing local scripts referenced in HTML pages:");
    for (const entry of pageBundles.missingScripts) {
      console.error(`- ${entry}`);
    }
    process.exit(1);
  }

  const eslintModule = tryLoadEslint();
  if (eslintModule) {
    await runEslintGuardrail(eslintModule, pageBundles.bundles);
    return;
  }

  runFallbackRedeclareGuardrail(pageBundles.bundles);
}

function collectPageBundles() {
  const pageFiles = fs
    .readdirSync(process.cwd())
    .filter((file) => file.endsWith(".html"))
    .sort();

  const bundles = [];
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

    bundles.push({
      pageFile,
      bundleSource: bundleParts.join("\n"),
      virtualFilePath: path.resolve(
        process.cwd(),
        ".lint-page-bundles",
        `${path.basename(pageFile, ".html")}.bundle.js`
      ),
    });
  }

  return { bundles, missingScripts };
}

async function runEslintGuardrail(eslintModule, bundles) {
  let eslintForFormatting;
  let lintResults;

  try {
    const legacyEslint = await createLegacyEslint(eslintModule);
    eslintForFormatting = legacyEslint;
    lintResults = await lintBundlesWithEslint(legacyEslint, bundles);
  } catch (error) {
    if (!isLegacyConfigCompatibilityError(error)) {
      throw error;
    }

    console.warn(
      "Legacy ESLint config mode is not supported in this runtime. Retrying with flat-config guardrail mode."
    );
    const flatEslint = createFlatConfigEslint(eslintModule, {
      rules: FLAT_FALLBACK_RULES,
    });
    eslintForFormatting = flatEslint;
    lintResults = await lintBundlesWithEslint(flatEslint, bundles);
    console.warn(
      "Flat-config fallback enforces no-redeclare only to avoid false-positive no-undef reports in legacy global-script bundles."
    );
  }

  const formatter = await eslintForFormatting.loadFormatter("stylish");
  const output = formatter.format(lintResults);
  if (output.trim()) {
    console.log(output);
  }

  const errorCount = lintResults.reduce(
    (sum, result) => sum + (result.errorCount || 0),
    0
  );
  if (errorCount > 0) {
    process.exit(1);
  }

  console.log("ESLint page-bundle guardrail passed.");
}

async function lintBundlesWithEslint(eslint, bundles) {
  const lintResults = [];

  for (const bundle of bundles) {
    const pageResults = await eslint.lintText(bundle.bundleSource, {
      filePath: bundle.virtualFilePath,
    });
    lintResults.push(...pageResults);
  }

  return lintResults;
}

async function createLegacyEslint(eslintModule) {
  const eslintrcPath = path.resolve(process.cwd(), ".eslintrc.cjs");
  const LegacyESLintClass = await resolveLegacyEslintClass(eslintModule);

  const legacyOptions = {
    useEslintrc: true,
    ignore: false,
    overrideConfig: {
      rules: GUARDRAIL_RULES,
    },
  };

  if (fs.existsSync(eslintrcPath)) {
    legacyOptions.overrideConfigFile = eslintrcPath;
  }

  return new LegacyESLintClass(legacyOptions);
}

async function resolveLegacyEslintClass(eslintModule) {
  const riskyLegacyClass = resolveLegacyEslintClassFromRiskyExports();
  if (riskyLegacyClass) {
    return riskyLegacyClass;
  }

  if (typeof eslintModule.loadESLint === "function") {
    return eslintModule.loadESLint({ useFlatConfig: false });
  }

  if (typeof eslintModule.ESLint === "function") {
    return eslintModule.ESLint;
  }

  throw new Error("Could not resolve an ESLint class from the installed eslint module.");
}

function resolveLegacyEslintClassFromRiskyExports() {
  try {
    const eslintAtYourOwnRisk = require("eslint/use-at-your-own-risk");
    if (typeof eslintAtYourOwnRisk.LegacyESLint === "function") {
      return eslintAtYourOwnRisk.LegacyESLint;
    }
  } catch (_error) {
    return null;
  }
  return null;
}

function createFlatConfigEslint(eslintModule, options = {}) {
  const { ESLint } = eslintModule;
  if (typeof ESLint !== "function") {
    throw new Error("Could not resolve ESLint flat-config class.");
  }

  const selectedRules = options.rules || GUARDRAIL_RULES;

  return new ESLint({
    ignore: false,
    overrideConfigFile: true,
    overrideConfig: {
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "script",
        globals: loadBrowserGlobalsForFlatConfig(),
      },
      rules: selectedRules,
    },
  });
}

function loadBrowserGlobalsForFlatConfig() {
  const projectGlobals = {
    Viewer: "readonly",
    Cookiebot: "readonly",
  };

  try {
    const globalsPackage = require("globals");
    return {
      ...normalizeFlatGlobals(globalsPackage.browser || {}),
      ...projectGlobals,
    };
  } catch (_error) {
    return {
      window: "readonly",
      document: "readonly",
      navigator: "readonly",
      localStorage: "readonly",
      sessionStorage: "readonly",
      fetch: "readonly",
      URL: "readonly",
      URLSearchParams: "readonly",
      FormData: "readonly",
      Headers: "readonly",
      Request: "readonly",
      Response: "readonly",
      console: "readonly",
      setTimeout: "readonly",
      clearTimeout: "readonly",
      setInterval: "readonly",
      clearInterval: "readonly",
      atob: "readonly",
      btoa: "readonly",
      Event: "readonly",
      CustomEvent: "readonly",
      ...projectGlobals,
    };
  }
}

function normalizeFlatGlobals(globalsMap) {
  const normalized = {};
  Object.entries(globalsMap).forEach(([name, access]) => {
    normalized[name] = access === true || access === "writable" ? "writable" : "readonly";
  });
  return normalized;
}

function isLegacyConfigCompatibilityError(error) {
  if (!error) {
    return false;
  }

  if (error.code === "ESLINT_INVALID_OPTIONS") {
    return true;
  }

  const message = typeof error.message === "string" ? error.message : "";
  if (
    message.includes("Unknown options: useEslintrc") ||
    message.includes("eslintrc format rather than flat config format")
  ) {
    return true;
  }

  const cause = error.cause;
  const causeMessage =
    cause && typeof cause.message === "string" ? cause.message : "";
  if (causeMessage.includes("eslintrc format rather than flat config format")) {
    return true;
  }

  return false;
}

function runFallbackRedeclareGuardrail(bundles) {
  const findings = [];

  for (const bundle of bundles) {
    const sanitizedSource = stripComments(bundle.bundleSource);
    const declarations = collectTopLevelDeclarations(sanitizedSource);
    const seenByName = new Map();

    for (const declaration of declarations) {
      if (!seenByName.has(declaration.name)) {
        seenByName.set(declaration.name, declaration);
        continue;
      }

      const first = seenByName.get(declaration.name);
      findings.push({
        pageFile: bundle.pageFile,
        name: declaration.name,
        firstLine: first.line,
        duplicateLine: declaration.line,
      });
    }
  }

  if (findings.length > 0) {
    console.error(
      `Fallback page-bundle guardrail failed: duplicate declarations detected (${findings.length}).`
    );
    for (const finding of findings) {
      console.error(
        `- ${finding.pageFile}: '${finding.name}' first declared at line ${finding.firstLine}, redeclared at line ${finding.duplicateLine}`
      );
    }
    process.exit(1);
  }

  console.log(
    "Fallback page-bundle guardrail passed (ESLint unavailable; duplicate declaration check only)."
  );
}

function collectTopLevelDeclarations(source) {
  const declarations = [];

  collectRegexDeclarations(
    source,
    /\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g,
    declarations
  );
  collectRegexDeclarations(
    source,
    /\bclass\s+([A-Za-z_$][\w$]*)\s*/g,
    declarations
  );

  return declarations;
}

function collectRegexDeclarations(source, pattern, target) {
  let match;
  while ((match = pattern.exec(source)) !== null) {
    target.push({
      name: match[1],
      line: getLineNumber(source, match.index),
    });
  }
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (match) => " ".repeat(match.length))
    .replace(/\/\/[^\n]*/g, (match) => " ".repeat(match.length));
}

function getLineNumber(source, index) {
  return source.slice(0, index).split("\n").length;
}

function tryLoadEslint() {
  try {
    return require("eslint");
  } catch (_error) {
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
  console.error("Failed to run page-bundle guardrail:", error);
  process.exit(1);
});
