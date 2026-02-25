# Accessibility Checks

This repository includes an automated Lighthouse accessibility baseline in CI.
It also includes a semantic audit guardrail for critical/serious WCAG blockers.

## CI job

Workflow: `.github/workflows/pr-tests.yml`

Job: `accessibility-baseline`

Pages checked:

- `index.html`
- `summary.html`
- `board.html`
- `contacts.html`
- `addTask.html`

Gate:

- `categories:accessibility >= 0.50`

If the score is below the threshold on any checked page, the job fails.
CI also prints a short page-level summary (PASS/FAIL + top failing audits) in the workflow logs.

## Semantic accessibility guardrail

Workflow: `.github/workflows/pr-tests.yml`

Job: `js-guardrails`

Step: `Guardrail check for semantic accessibility baseline`

Command:

- `npm run a11y:audit`

Severity model:

- `critical`: non-semantic interactive elements (for example `img`/`div` with action attributes).
- `serious`: missing accessible names for icon-only buttons, missing labels for form inputs, or missing accessibility stylesheet include.

If any `critical` or `serious` finding exists, CI fails.

## Run locally

```bash
npm install
npm run a11y:ci
npm run a11y:report
npm run a11y:audit
```

Requirements:

- Node.js 20+
- Chrome/Chromium available on your machine
- `python3` available (used to serve local static files during the check)

## How to interpret output

- Lighthouse prints one result per page URL.
- The accessibility category score is shown for each page.
- `npm run a11y:report` prints page-level PASS/FAIL against the configured threshold.
- `npm run a11y:audit` prints severity-tagged findings and file/line references.
- Failing assertions list the page and threshold mismatch.
- CI uploads `.lighthouseci` artifacts for deeper inspection when needed.
