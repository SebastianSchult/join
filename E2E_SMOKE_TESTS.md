# E2E Smoke Tests

This repository includes lightweight Playwright smoke tests for critical user journeys.

## Scope

Covered journeys (`/e2e/smoke.spec.js`):

1. Login + redirect to summary
2. Summary load (key counters)
3. Add-task basic create flow
4. Contacts create/edit/delete happy path
5. Board render + card open/close

## Local run

1. Install dependencies deterministically:

```bash
npm ci
```

2. Install Playwright browser runtime:

```bash
npx playwright install --with-deps chromium
```

3. Run smoke tests:

```bash
npm run e2e:smoke
```

## CI integration

- Workflow: `.github/workflows/pr-tests.yml`
- Job: `e2e-smoke`
- Artifacts on every run:
  - `playwright-report`
  - `test-results` (traces/videos/screenshots on failure)

## Determinism and maintenance approach

- Tests use a local Firebase mock (`/e2e/support/firebase-mock.js`) and do not depend on live backend state.
- Third-party CDN/Cookiebot assets are stubbed for stable, offline-capable execution.
- Smoke tests no longer require a committed/local `js/config.js`; the test runtime injects a deterministic fallback `JOIN_APP_CONFIG` when that file is missing (CI-safe).
- Prefer stable selectors (`data-action`, form ids, explicit element ids) over style/CSS-path selectors.
- If a user journey changes intentionally, update:
  1. the affected test case in `/e2e/smoke.spec.js`,
  2. mock seed/state behavior in `/e2e/support/firebase-mock.js`,
  3. this document if journey scope changes.

## Failure-to-journey mapping

- `login + redirect` => auth/credential validation or redirect regression
- `summary load` => summary initialization/data load regression
- `add-task basic create flow` => task creation form/persistence regression
- `contacts create/edit/delete happy path` => contacts mutation flow regression
- `board render + card open/close` => board rendering/card dialog regression
