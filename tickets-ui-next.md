# UI/Accessibility Backlog (Next Batch)

## Proposed Issues

1. `[P1][Accessibility]: Replace clickable divs with semantic buttons and links`
2. `[P1][Accessibility]: Add focus management for overlays and dropdown flows`
3. `[P1][Accessibility]: Add explicit labels and ARIA names for forms and icon-only actions`
4. `[P1][Bug]: Remove duplicate inline event attributes in rendered template HTML`
5. `[P2][Refactor]: Migrate inline onclick handlers to addEventListener architecture`
6. `[P2][UI]: Define responsive breakpoints and spacing tokens`
7. `[P2][UI]: Mobile layout audit and touch-target hardening across key pages`
8. `[P3][Chore]: Add automated accessibility checks to CI`
9. `[P1][Accessibility]: Accessibility baseline audit and critical WCAG fixes`

## Create Issues (Automation)

GitHub CLI:

```bash
./scripts/create_github_issues_from_drafts.sh SebastianSchult/join .github/issue-drafts-ui-next
```

curl + token:

```bash
export GITHUB_TOKEN=ghp_xxx
./scripts/create_github_issues_from_drafts_curl.sh SebastianSchult/join .github/issue-drafts-ui-next
unset GITHUB_TOKEN
```
