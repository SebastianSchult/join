Title: [P1][Bug]: Prevent concurrent data loss from full-array Firebase PUT writes

Body:
### Priority
P1 - High

### Area
Storage

### Risk / Impact
Multiple flows read arrays, mutate locally, then overwrite entire Firebase nodes via `PUT`. In parallel usage (or multiple tabs), this can drop updates from other clients and create ID conflicts.

### Affected Files / Scope
- `js/storage.js` (`firebaseUpdateItem`)
- `js/addTask_tasks.js`
- `js/contact_popups.js`

### Context
Current writes replace full collections (`tasks`, `users`) instead of updating isolated records with conflict-safe semantics.

### Proposed Mitigation
- Move to per-entity updates (keyed records) instead of full-array overwrite.
- Use safer update strategy (`PATCH`/transaction-like merge) for concurrent clients.
- Revisit client-side ID assignment to avoid collisions.

### Acceptance Criteria
- [ ] Creating/updating/deleting one record does not overwrite unrelated concurrent changes.
- [ ] Multi-tab or multi-client edits no longer lose data.
- [ ] ID generation strategy is collision-safe for concurrent writes.
