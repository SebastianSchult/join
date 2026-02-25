Title: [P1][Refactor]: Decompose contact_popups.js by responsibility

Body:
### Priority
P1 - High

### Area
Contacts

### Context / Problem
`js/contact_popups.js` combines overlay lifecycle, form validation, mutation/persistence, and keyboard accessibility handling in one large module.

### Affected Files / Scope
- `js/contact_popups.js`
- related contact helpers

### Proposed Refactor
- Split into focused modules:
  - overlay/focus lifecycle
  - form validation and error rendering
  - contact mutations (create/edit/delete)
- Keep stable public entry points used by delegated actions.

### Risks / Regression Notes
- Contacts flow is interaction-heavy and regression-prone.
- Must verify add/edit/delete on desktop and mobile.

### Acceptance Criteria
- [ ] Contact popup logic is separated by concern.
- [ ] Public flow behavior remains unchanged.
- [ ] No regressions in contact create/edit/delete and focus behavior.
