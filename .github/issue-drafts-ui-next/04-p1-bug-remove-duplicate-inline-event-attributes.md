Title: [P1][Bug]: Remove duplicate inline event attributes in rendered template HTML

Body:
### Priority
P1 - High

### Area
UI

### Summary
Some generated template elements define the same inline event attribute multiple times (for example duplicated `onclick`). This leads to handler override and non-deterministic behavior.

### Affected Files / Scope
- `js/contacts_render.js`
- other template-rendering files that produce inline HTML

### Expected Behavior
Each element has one unambiguous event binding per event type.

### Actual Behavior
Duplicate attributes can override previous handlers and break expected interactions.

### Acceptance Criteria
- [ ] Duplicate inline event attributes are removed.
- [ ] Affected interactions (add/edit/cancel/contact actions) behave consistently.
- [ ] A guardrail check is added to prevent duplicate attributes in template strings.
