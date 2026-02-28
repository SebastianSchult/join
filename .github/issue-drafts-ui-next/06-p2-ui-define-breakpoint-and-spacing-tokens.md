Title: [P2][UI]: Define responsive breakpoints and spacing tokens

Body:
### Priority
P2 - Medium

### Area
UI

### Summary
Responsive behavior is currently driven by scattered hard-coded thresholds and per-page CSS/JS decisions. Spacing and layout rhythm are not standardized across screens.

### Proposed Improvement
- Introduce shared design tokens (breakpoints, spacing scale, sizing constants).
- Align CSS media queries and JS breakpoint checks to one source of truth.
- Document token usage for future UI work.

### Acceptance Criteria
- [ ] Core breakpoints are centralized and reused.
- [ ] Spacing values are standardized via reusable tokens.
- [ ] No page relies on conflicting breakpoint values for the same layout behavior.
