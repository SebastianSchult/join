# Next Issue Drafts

These drafts are based on a fresh codebase analysis after the previous ticket batch was completed.

## Create only this new batch

With GitHub CLI:

```bash
./scripts/create_github_issues_from_drafts.sh SebastianSchult/join .github/issue-drafts-next
```

With curl + token:

```bash
export GITHUB_TOKEN=ghp_xxx
./scripts/create_github_issues_from_drafts_curl.sh SebastianSchult/join .github/issue-drafts-next
unset GITHUB_TOKEN
```

## Draft files

- `01-p0-security-stored-xss-in-user-content.md`
- `02-p1-bug-contact-email-check-missing-on-contacts-page.md`
- `03-p1-bug-duplicate-onclick-attributes-in-contact-templates.md`
- `04-p1-bug-contact-edit-delete-flow-relies-on-reload-race.md`
- `05-p1-bug-firebase-array-put-overwrites-concurrent-updates.md`
- `06-p2-refactor-deduplicate-contact-id-helper-and-dom-globals.md`
- `07-p2-chore-add-lint-guardrails-for-js-and-template-html.md`
- `08-p3-chore-ignore-and-clean-local-os-artifacts.md`
