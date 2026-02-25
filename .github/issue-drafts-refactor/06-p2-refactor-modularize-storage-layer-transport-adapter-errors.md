Title: [P2][Refactor]: Modularize storage layer into transport, adapter, and error policies

Body:
### Priority
P2 - Medium

### Area
Storage

### Context / Problem
`js/storage.js` currently bundles transport concerns, Firebase adapter logic, and error policy handling. This complicates maintenance and safe change rollout.

### Affected Files / Scope
- `js/storage.js`
- consumers in auth/board/contacts/addTask

### Proposed Refactor
- Separate into:
  - transport wrapper
  - Firebase entity adapter
  - centralized error policy helpers
- Standardize non-OK handling and error message mapping.

### Risks / Regression Notes
- Storage is cross-cutting and used by many pages.
- Requires careful backward compatibility for current call sites.

### Acceptance Criteria
- [ ] Storage responsibilities are modularized.
- [ ] Error handling is centralized and consistent.
- [ ] Existing callers continue to work without behavior regressions.
