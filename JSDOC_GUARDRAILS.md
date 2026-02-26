# JSDoc Guardrails

This document defines how JSDoc coverage is measured and enforced in CI.

## Scope

The guardrail script scans runtime JavaScript files:

- `script.js`
- all `js/**/*.js` files except:
  - `js/config.js`
  - `js/config.example.js`

Current detection scope is top-level function declarations only (global/page runtime functions).

## Commands

Run coverage check locally:

```bash
npm run lint:jsdoc
```

Regenerate baseline after intentional documentation improvements:

```bash
npm run lint:jsdoc:update-baseline
```

## Modes

The script supports two modes via `JSDOC_GUARDRAIL_MODE`:

- `warn` (default):
  - prints missing JSDoc per file/function
  - exits with success
- `fail-on-regression`:
  - compares current report against baseline in `scripts/jsdoc_guardrail_baseline.json`
  - fails if documentation regresses

Example:

```bash
JSDOC_GUARDRAIL_MODE=fail-on-regression npm run lint:jsdoc
```

## Regression Policy

In `fail-on-regression` mode, CI fails when one of these happens:

- overall missing declaration count increases
- overall coverage percent decreases
- a tracked file has more missing declarations than baseline
- a newly scanned file starts with missing declarations

## CI Integration

PR CI runs the guardrail in warning mode first:

- workflow: `.github/workflows/pr-tests.yml`
- step: `Guardrail check for JSDoc coverage baseline (warning mode)`

The policy is intentionally staged:

1. warning mode while coverage debt is still being reduced
2. switch to `fail-on-regression` after baseline stabilization

