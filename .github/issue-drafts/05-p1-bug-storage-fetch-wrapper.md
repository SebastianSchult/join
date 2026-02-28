Title: [P1][Bug]: Fix fetch wrapper options and response/error handling

Body:
### Priority
P1 - High

### Area
Storage

### Summary
Storage fetch wrappers use `header` instead of `headers` and do not consistently check response status. Failures can be silent and hard to diagnose.

### Steps To Reproduce
1. Trigger create/update operations in storage layer.
2. Inspect request configuration and response handling.
3. Simulate non-2xx response from backend.

### Expected Behavior
Requests use correct Fetch API options, and non-OK responses are surfaced as actionable errors.

### Actual Behavior
Requests can run with incorrect options and missing status checks, causing hidden failures.

### Acceptance Criteria
- [ ] All fetch wrappers use valid `headers` option.
- [ ] Non-OK responses are handled and propagated.
- [ ] Callers can react to storage failures deterministically.
