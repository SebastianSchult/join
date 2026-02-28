# Issue Drafts (8 Tickets)

These drafts are ready to be copied into GitHub issues.

How to use:
1. Open `New issue` in the repo.
2. Select the matching template (`Security`, `Bug`, `Refactor`, `Chore`).
3. Copy `Title:` from the draft into the issue title.
4. Copy everything below `Body:` into the issue body.
5. Submit issue. The workflow will add labels and project assignment automatically.

CLI options:
- With GitHub CLI: `./scripts/create_github_issues_from_drafts.sh SebastianSchult/join`
- With curl + token:
  1. `export GITHUB_TOKEN=ghp_xxx`
  2. `./scripts/create_github_issues_from_drafts_curl.sh SebastianSchult/join`

Draft files:
- `01-p0-security-remove-client-secrets.md`
- `02-p0-security-password-handling.md`
- `03-p1-bug-summary-mobile-greeting.md`
- `04-p1-bug-firebase-null-error-handling.md`
- `05-p1-bug-storage-fetch-wrapper.md`
- `06-p2-refactor-decouple-login-signup.md`
- `07-p2-refactor-remove-implicit-globals.md`
- `08-p3-chore-clean-debug-logs-and-ci-check.md`
