Title: [P1][Bug]: Remove duplicate onclick attributes in contact template markup

Body:
### Priority
P1 - High

### Area
UI

### Summary
Contact template HTML contains duplicated `onclick` attributes on the same element. In HTML parsing, one handler overrides the other, causing unpredictable behavior.

### Affected Files / Scope
- `js/contacts_render.js`

### Examples
- Add contact card button contains two `onclick` attributes on one `<div>`.
- Edit-contact cancel button contains two `onclick` attributes on one `<button>`.

### Expected Behavior
Each interactive element has one deterministic click handler.

### Actual Behavior
Duplicate attributes create ambiguous/overridden click handling.

### Acceptance Criteria
- [ ] Duplicate event attributes are removed from templates.
- [ ] Cancel/add-contact interactions behave consistently on desktop and mobile.
- [ ] A guardrail check (lint or validation) prevents duplicate attributes in template strings.
