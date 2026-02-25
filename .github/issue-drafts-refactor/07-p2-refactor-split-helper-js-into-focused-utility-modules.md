Title: [P2][Refactor]: Split helper.js into focused utility modules

Body:
### Priority
P2 - Medium

### Area
Tooling

### Context / Problem
`js/helper.js` combines sanitization, focus/accessibility helpers, and generic DOM utilities. This creates unnecessary coupling and larger blast radius for changes.

### Affected Files / Scope
- `js/helper.js`
- all modules consuming shared helpers

### Proposed Refactor
- Split helper utilities into focused modules:
  - sanitize
  - focus/accessibility
  - generic DOM helpers
- Keep function signatures stable where possible.

### Risks / Regression Notes
- Helper moves can break script include order.
- Must keep global compatibility for existing non-module pages.

### Acceptance Criteria
- [ ] Helper code is grouped by concern in smaller files.
- [ ] Shared helper APIs remain documented and discoverable.
- [ ] No runtime regressions caused by helper extraction.
