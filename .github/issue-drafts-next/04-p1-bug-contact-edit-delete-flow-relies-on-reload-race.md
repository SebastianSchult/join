Title: [P1][Bug]: Stabilize contact edit/delete flow (remove timeout reload race)

Body:
### Priority
P1 - High

### Area
Contacts

### Summary
Contact edit/delete currently use `setTimeout(... window.location.reload())` after Firebase writes. `removeContact()` also triggers async deletion and `contactsInit()` without waiting for completion. This can cause flicker, race conditions, and non-deterministic UI state.

### Affected Files / Scope
- `js/contact_popups.js`
- `js/contacts.js`

### Expected Behavior
Contact list updates immediately from state updates without full page reload and without timing assumptions.

### Actual Behavior
Flow depends on delayed reloads and mixed async calls.

### Acceptance Criteria
- [ ] Edit/delete contact operations update UI deterministically without `window.location.reload()`.
- [ ] Async flow awaits remote updates before local refresh.
- [ ] No race-related stale UI state is observable in repeated edit/delete operations.
