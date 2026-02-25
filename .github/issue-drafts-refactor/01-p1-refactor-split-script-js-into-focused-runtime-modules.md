Title: [P1][Refactor]: Split script.js into focused runtime modules

Body:
### Priority
P1 - High

### Area
Tooling

### Context / Problem
`script.js` currently mixes multiple responsibilities (compatibility fallbacks, UI event delegation, responsive navigation, Cookiebot bootstrap, shared helpers) in one large file. This increases coupling and makes change impact hard to predict.

### Affected Files / Scope
- `script.js`
- HTML page script includes

### Proposed Refactor
- Reduce `script.js` to orchestration/bootstrap.
- Extract modules:
  - `runtime-fallbacks.js`
  - `ui-event-delegation.js`
  - `responsive-navigation.js`
  - `cookiebot-bootstrap.js`
- Keep public behavior and delegated action contract unchanged.

### Risks / Regression Notes
- Script load order can break page initialization in multi-page architecture.
- Must validate login/summary/board/contacts/addTask initialization paths.

### Acceptance Criteria
- [ ] `script.js` no longer contains all runtime concerns in one file.
- [ ] Extracted modules are loaded in deterministic order.
- [ ] No regressions in page init and delegated actions.
