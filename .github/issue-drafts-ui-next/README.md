# UI & Semantics Issue Drafts

These drafts focus on semantic HTML, accessibility, and responsive UI quality.

## Create only this batch

With GitHub CLI:

```bash
./scripts/create_github_issues_from_drafts.sh SebastianSchult/join .github/issue-drafts-ui-next
```

With curl + token:

```bash
export GITHUB_TOKEN=ghp_xxx
./scripts/create_github_issues_from_drafts_curl.sh SebastianSchult/join .github/issue-drafts-ui-next
unset GITHUB_TOKEN
```

## Draft files

- `01-p1-accessibility-replace-clickable-divs-with-semantic-controls.md`
- `02-p1-accessibility-focus-management-for-overlays-and-dropdowns.md`
- `03-p1-accessibility-labels-and-aria-for-forms-and-icon-actions.md`
- `04-p1-bug-remove-duplicate-inline-event-attributes.md`
- `05-p2-refactor-migrate-inline-onclick-to-addeventlistener.md`
- `06-p2-ui-define-breakpoint-and-spacing-tokens.md`
- `07-p2-ui-mobile-layout-audit-and-touch-target-hardening.md`
- `08-p3-chore-add-accessibility-checks-in-ci.md`
- `09-p1-accessibility-baseline-audit-and-critical-wcag-fixes.md`
