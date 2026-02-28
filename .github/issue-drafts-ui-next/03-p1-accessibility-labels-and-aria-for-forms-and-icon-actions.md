Title: [P1][Accessibility]: Add explicit labels and ARIA names for forms and icon-only actions

Body:
### Priority
P1 - High

### Area
UI

### Summary
Several form fields and icon-only click targets rely on placeholders or visual cues. This weakens screen-reader support and reduces form clarity.

### Affected Files / Scope
- login and signup forms
- add-task form
- contact create/edit forms
- icon-only actions (close, back, menu, delete/edit icons)

### Expected Behavior
Each input has an accessible label and each icon-only action has a meaningful accessible name.

### Actual Behavior
Some fields/actions are ambiguous to assistive technologies.

### Acceptance Criteria
- [ ] Form fields have explicit labels (visible or screen-reader only).
- [ ] Icon-only controls expose `aria-label` or equivalent accessible names.
- [ ] Validation errors are announced/accessibly connected to inputs.
