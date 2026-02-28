Title: [P1][Accessibility]: Add focus management for overlays and dropdown flows

Body:
### Priority
P1 - High

### Area
UI

### Summary
Overlay and dropdown interactions currently focus mainly on pointer input. Focus trapping, restore-focus behavior, and keyboard-close handling are incomplete.

### Affected Files / Scope
- contacts overlays
- board add/edit overlays
- dropdown components (assigned/category)

### Expected Behavior
When an overlay opens, focus moves into it; `Tab` stays within it; `Esc` closes it; and focus returns to the triggering control.

### Actual Behavior
Focus handling is inconsistent and can escape into background UI.

### Acceptance Criteria
- [ ] Focus is trapped inside active overlays/dialog-like containers.
- [ ] `Esc` closes closable overlays/dropdowns.
- [ ] Focus returns to the opener element after closing.
- [ ] Background interactive elements are not focusable while overlay is active.
