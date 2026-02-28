Title: [P2][Refactor]: Deduplicate contact ID helper and remove implicit DOM-global dependencies

Body:
### Priority
P2 - Medium

### Area
Tooling

### Context / Problem
- `getNextId()` is declared twice in `js/contacts.js`.
- Contact popup logic relies on browser DOM-id globals (`createBtn`, `contactName`, etc.) instead of explicit element lookups, which is fragile and breaks under stricter execution modes.

### Affected Files / Scope
- `js/contacts.js`
- `js/contact_popups.js`

### Proposed Refactor
- Keep one source of truth for ID helper logic.
- Replace implicit DOM globals with explicit `document.getElementById(...)` references.
- Add small helper functions for consistent form element access.

### Acceptance Criteria
- [ ] Duplicate helper declarations are removed.
- [ ] Contact popup code does not rely on implicit DOM-id globals.
- [ ] Behavior remains unchanged for create/edit/delete contact flows.
