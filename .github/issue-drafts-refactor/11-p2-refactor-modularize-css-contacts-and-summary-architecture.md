Title: [P2][Refactor]: Modularize CSS architecture for contacts and summary

Body:
### Priority
P2 - Medium

### Area
UI

### Context / Problem
`assets/css/contacts.css`, `assets/css/contactsMobile.css`, and `assets/css/summary.css` are oversized and combine layout/components/responsive concerns.

### Affected Files / Scope
- `assets/css/contacts.css`
- `assets/css/contactsMobile.css`
- `assets/css/summary.css`
- related HTML page includes

### Proposed Refactor
- Split into structure:
  - shared base rules
  - component styles
  - responsive/mobile overrides
- Consolidate duplicate patterns where possible.

### Risks / Regression Notes
- Contact/summary pages have many responsive edge cases.
- Requires viewport regression checks.

### Acceptance Criteria
- [ ] Contacts/summary CSS is split into concern-based files.
- [ ] Desktop/mobile behavior remains stable.
- [ ] CSS stays aligned with token strategy.
