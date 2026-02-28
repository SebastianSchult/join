Title: [P1][Bug]: Guard Firebase null/error states in read flows

Body:
### Priority
P1 - High

### Area
Storage

### Summary
Multiple flows assume `firebaseGetItem()` always returns a valid array. If the response is `null` or request fails, follow-up operations (`forEach`, `find`, `push`) can break.

### Steps To Reproduce
1. Simulate empty Firebase node or temporary network failure.
2. Open pages that call data load (`addTask`, `contacts`, `login`).
3. Trigger actions relying on loaded data.

### Expected Behavior
App handles missing/failed data gracefully (fallback array, error message, safe early return).

### Actual Behavior
Unchecked assumptions can lead to runtime errors and broken UI flows.

### Acceptance Criteria
- [ ] All relevant data-loading call sites handle `null` and request failures safely.
- [ ] User-facing error feedback is shown for failed load paths.
- [ ] No uncaught runtime errors occur in affected flows.
