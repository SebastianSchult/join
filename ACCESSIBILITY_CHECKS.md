# Accessibility Checks

This repository includes an automated Lighthouse accessibility baseline in CI.

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

## Run locally

```bash
npm run a11y:ci
```

Requirements:

- Node.js 20+
- Chrome/Chromium available on your machine
- `python3` available (used to serve local static files during the check)

## How to interpret output

- Lighthouse prints one result per page URL.
- The accessibility category score is shown for each page.
- Failing assertions list the page and threshold mismatch.
- CI uploads `.lighthouseci` artifacts for deeper inspection when needed.
