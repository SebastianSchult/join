Title: [P1][Bug]: Stabilize summary mobile greeting flow

Body:
### Priority
P1 - High

### Area
Summary

### Summary
`hideMobileGreeting()` uses `subMainSummary` outside of valid scope. Depending on execution path, this can trigger runtime errors and break the summary greeting transition.

### Steps To Reproduce
1. Open `summary.html` after login on mobile width.
2. Trigger mobile greeting overlay.
3. Wait for overlay close transition.
4. Observe console/runtime behavior.

### Expected Behavior
Greeting overlay opens and closes without JavaScript errors. Summary content returns to normal state consistently.

### Actual Behavior
In some runs the code references an undeclared/out-of-scope variable and can break the closing flow.

### Acceptance Criteria
- [ ] `hideMobileGreeting()` does not rely on out-of-scope variables.
- [ ] No runtime error is thrown during mobile greeting close transition.
- [ ] Behavior is stable across repeated page loads on mobile viewport.
