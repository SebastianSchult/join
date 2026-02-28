# Next Backlog (Post Ticket Batch)

This backlog was generated from a fresh codebase review after the previous ticket set.

## Proposed Issues

1. `[P0][Security]: Prevent stored XSS in task/contact user content rendering`
2. `[P1][Bug]: Fix contact creation email check dependency on contacts page`
3. `[P1][Bug]: Remove duplicate onclick attributes in contact template markup`
4. `[P1][Bug]: Stabilize contact edit/delete flow (remove timeout reload race)`
5. `[P1][Bug]: Prevent concurrent data loss from full-array Firebase PUT writes`
6. `[P2][Refactor]: Deduplicate contact ID helper and remove implicit DOM-global dependencies`
7. `[P2][Chore]: Add lint guardrails for JS undefined references and template HTML issues`
8. `[P3][Chore]: Ignore and clean local OS/editor artifacts from repository`

## Create Issues (Automation)

GitHub CLI:

```bash
./scripts/create_github_issues_from_drafts.sh SebastianSchult/join .github/issue-drafts-next
```

curl + token:

```bash
export GITHUB_TOKEN=ghp_xxx
./scripts/create_github_issues_from_drafts_curl.sh SebastianSchult/join .github/issue-drafts-next
unset GITHUB_TOKEN
```
