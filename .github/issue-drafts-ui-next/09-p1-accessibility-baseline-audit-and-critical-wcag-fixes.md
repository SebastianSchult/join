Title: [P1][Accessibility]: Accessibility baseline audit and critical WCAG fixes

Body:
### Priority
P1 - High

### Area
UI

### Summary
The app has partial accessibility support, but critical WCAG basics are inconsistent across pages (semantic controls, keyboard support, focus behavior, and accessible naming).

### Scope
Whole project (login, signup, summary, board, add-task, contacts, legal/privacy pages).

### Proposed Mitigation
- Run a structured accessibility audit (keyboard navigation, focus order, semantics, labels, contrast).
- Fix critical blockers first:
  - clickable `div` -> semantic `button`/`a`
  - missing labels/ARIA names
  - overlay focus trap + focus restore + `Esc` close
- Add automated accessibility check in CI to prevent regressions.

### Acceptance Criteria
- [ ] Core user journeys are keyboard operable without mouse-only dependencies.
- [ ] Interactive controls use semantic HTML (or equivalent accessible roles/attributes).
- [ ] Form fields and icon-only actions expose accessible names.
- [ ] Overlay/dialog focus behavior is correct (trap, close, restore focus).
- [ ] No critical/serious findings remain in automated accessibility checks.
