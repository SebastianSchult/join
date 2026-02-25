# Refactor Issue Drafts

These drafts cover the concrete follow-up issues from ticket #73 (`research`) and are intended for incremental, low-risk refactor execution.

## Create this batch

With GitHub CLI:

```bash
./scripts/create_github_issues_from_drafts.sh SebastianSchult/join .github/issue-drafts-refactor
```

With curl + token:

```bash
export GITHUB_TOKEN=ghp_xxx
./scripts/create_github_issues_from_drafts_curl.sh SebastianSchult/join .github/issue-drafts-refactor
unset GITHUB_TOKEN
```

## Draft files

- `01-p1-refactor-split-script-js-into-focused-runtime-modules.md`
- `02-p2-refactor-isolate-and-version-compatibility-fallbacks.md`
- `03-p1-refactor-decompose-contact-popups-by-responsibility.md`
- `04-p1-refactor-decompose-addtask-js-into-domain-and-ui-modules.md`
- `05-p1-refactor-split-board-js-rendering-state-and-media.md`
- `06-p2-refactor-modularize-storage-layer-transport-adapter-errors.md`
- `07-p2-refactor-split-helper-js-into-focused-utility-modules.md`
- `08-p2-chore-add-file-size-guardrail-for-js-and-css.md`
- `09-p2-chore-define-engineering-standards-for-docs-and-ownership.md`
- `10-p2-refactor-modularize-css-board-and-addtask-architecture.md`
- `11-p2-refactor-modularize-css-contacts-and-summary-architecture.md`
- `12-p1-chore-create-refactor-regression-matrix-and-smoke-checklist.md`
