# GitHub Automation

This project uses GitHub Actions for issue triage, PR status sync, quality checks, and deployment.

## Action pinning policy

- All third-party and official marketplace actions are pinned to immutable commit SHAs in workflow files.
- Inline comments next to each pinned SHA reference the original release/tag for readability.
- Do not switch back to floating references like `@v4` or `@main`.

## Workflows

### 1) Issue triage

- File: `.github/workflows/issue-triage.yml`
- Trigger: `issues` (`opened`, `edited`, `reopened`)
- What it does:
  - Ensures standard labels exist (`type:*`, `priority:*`, `area:*`, `status:*`).
  - Adds labels based on issue title/body.
  - Optionally adds issue to a GitHub Project.

Required for project add:

- Repository variable: `GH_PROJECT_URL`
- Repository secret: `PROJECT_TOKEN`

### 2) PR issue status sync

- File: `.github/workflows/pr-issue-status.yml`
- Trigger: `pull_request` (`opened`, `reopened`, `ready_for_review`, `synchronize`, `closed`)
- What it does:
  - Resolves linked issue numbers (closing refs, branch prefix like `123-...`, PR body `#123`).
  - Moves issue status in project:
    - PR open/reopen/sync/ready: `Review`
    - PR merged: `Done`
  - Syncs issue labels (`status: review`, `status: done`).

Required:

- Repository variable: `GH_PROJECT_URL`
- Repository secret: `PROJECT_TOKEN`

### 3) PR tests

- File: `.github/workflows/pr-tests.yml`
- Trigger: `push`, `pull_request`
- Jobs:
  - `js-guardrails`
    - deterministic dependency install (`npm ci`)
    - JS syntax checks
    - template duplicate-attribute guardrail
    - inline event guardrail
    - UI token alignment guardrail
    - page-bundle lint guardrail
    - semantic accessibility baseline guardrail (`npm run a11y:audit`)
  - `css-guardrails`
    - deterministic dependency install (`npm ci`)
    - CSS syntax and maintainability checks
  - `accessibility-baseline`
    - deterministic dependency install (`npm ci`)
    - Lighthouse accessibility baseline via `npm run a11y:ci`
    - uploads `.lighthouseci` artifacts

## Lockfile and install policy

- `package-lock.json` is part of the repository and must be committed.
- Node-based CI jobs use `npm ci` (not `npm install`) for reproducible dependency resolution.
- CI scripts should execute tooling from committed `devDependencies` instead of fetching tools ad-hoc via `npx --yes`.
- Add/update dependencies with explicit versions (`npm install <pkg>@<version> ...`) so version intent is reviewable in PRs.
- Dependency updates must include both `package.json` and `package-lock.json` changes in the same PR.

## Dependency automation (Dependabot)

- File: `.github/dependabot.yml`
- Ecosystems:
  - `npm` (root package)
  - `github-actions` (workflow actions)
- Schedule: weekly
- Dependabot PRs are labeled as `type: chore` and `area: tooling`.

### Review and merge checklist for Dependabot PRs

1. Confirm PR scope is dependency-only (no unrelated application code changes).
2. For npm updates, verify `package.json` and `package-lock.json` are both present in the diff.
3. Run PR checks and merge only when CI is green.
4. For GitHub Actions updates, keep actions pinned to full commit SHAs (no fallback to floating tags like `@v4`).
5. If a major update changes behavior or CI stability, split/hold that PR and handle it in a dedicated follow-up ticket.

### 4) Deploy on main

- File: `.github/workflows/deploy-on-main.yml`
- Trigger: `push` on `main`
- Modes:
  - SSH + rsync
  - FTPS primary with FTP fallback
- Also generates `js/config.js` at deploy-time from repository secrets.

## Setup checklist

Path:

- `Settings` -> `Secrets and variables` -> `Actions`

### Variables

- `GH_PROJECT_URL`
  - Example: `https://github.com/users/<USER>/projects/<NUMBER>`

### Secrets (project automation)

- `PROJECT_TOKEN`
  - Personal access token with project/repository access needed for project item updates.

### Secrets (deploy - choose one mode)

SSH mode:

- `DEPLOY_SSH_HOST`
- `DEPLOY_SSH_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_PATH`
- optional: `DEPLOY_SSH_PORT`, `DEPLOY_POST_COMMAND`

FTP mode:

- `DEPLOY_FTP_SERVER`
- `DEPLOY_FTP_USER`
- `DEPLOY_FTP_PASSWORD`
- `DEPLOY_FTP_DIR`
- optional: `DEPLOY_FTP_PORT`

### Secrets (runtime config generation in deploy)

- `JOIN_APP_STORAGE_TOKEN` (required)
- `JOIN_APP_BASE_URL` (required)
- `JOIN_APP_FIREBASE_TASKS_ID` (required)
- `JOIN_APP_FIREBASE_USERS_ID` (required)
- `JOIN_APP_COOKIEBOT_ID` (required)
- `JOIN_APP_STORAGE_URL` (optional, default provided)
- `JOIN_APP_COOKIEBOT_BLOCKING_MODE` (optional, default `auto`)

## Branch and PR convention

- Branch name starts with issue number: `<issue>-short-description`
  - Example: `45-p1accessibility-accessibility-baseline-audit-and-critical-wcag-fixes`
- Include `Closes #<issue>` in PR description.
- Open PR from feature branch to `main`.

This keeps issue linking deterministic for `pr-issue-status.yml`.

## Updating pinned action SHAs

When you intentionally upgrade an action:

1. Pick a target release tag from the action repository (example: `v4.2.2`).
2. Resolve the tag to a commit SHA.
3. Replace `uses:` in workflow files with the full 40-char SHA.
4. Keep the version comment next to it (example: `# v4.2.2`).
5. Run PR checks before merge.

Reference commands (requires internet and `jq`):

```bash
# Lightweight tag (common)
curl -sL https://api.github.com/repos/actions/checkout/git/ref/tags/v4 \
  | jq -r '.object.sha'

# Annotated tag (if .object.type == "tag", resolve one level deeper)
TAG_SHA="$(curl -sL https://api.github.com/repos/actions/checkout/git/ref/tags/v4 | jq -r '.object.sha')"
curl -sL "https://api.github.com/repos/actions/checkout/git/tags/${TAG_SHA}" \
  | jq -r '.object.sha'
```

## Troubleshooting

- Project updates not happening:
  - Verify `GH_PROJECT_URL` format and project access for `PROJECT_TOKEN`.
  - Ensure project has a `Status` single-select field.
- Deployment fails:
  - Check which mode was selected in workflow logs (`ssh`, `ftp`, `none`).
  - Re-validate server/credentials/path secrets.
- Runtime config generation fails:
  - Missing required `JOIN_APP_*` secrets are shown in logs.
