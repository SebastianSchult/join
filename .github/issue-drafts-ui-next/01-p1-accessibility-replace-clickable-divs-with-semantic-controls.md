Title: [P1][Accessibility]: Replace clickable divs with semantic buttons and links

Body:
### Priority
P1 - High

### Area
UI

### Summary
Multiple interactive elements are implemented as clickable `div` containers (`onclick`) instead of semantic controls (`button`, `a`). This reduces accessibility and causes inconsistent keyboard behavior.

### Affected Files / Scope
- `index.html`
- `summary.html`
- `board.html`
- template files with interactive container markup

### Expected Behavior
Interactive UI controls use semantic HTML elements by default and are keyboard-accessible without custom hacks.

### Actual Behavior
Clicks work via inline handlers, but semantics and keyboard behavior are inconsistent.

### Acceptance Criteria
- [ ] Clickable non-semantic controls are replaced by `button` or `a` elements.
- [ ] Keyboard interaction (`Tab`, `Enter`, `Space`) works on all converted controls.
- [ ] Styling remains visually unchanged after semantic conversion.
