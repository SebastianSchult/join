Title: [P2][Refactor]: Modularize CSS architecture for board and addTask

Body:
### Priority
P2 - Medium

### Area
UI

### Context / Problem
`assets/css/board.css` and `assets/css/addTask.css` are large monolithic files with mixed concerns.

### Affected Files / Scope
- `assets/css/board.css`
- `assets/css/addTask.css`
- page-level stylesheet includes

### Proposed Refactor
- Split styles into layered files:
  - base/layout
  - component styles
  - responsive overrides
- Keep token usage aligned with `ui-tokens.css`.

### Risks / Regression Notes
- Visual regressions are possible during split.
- Requires screenshot/manual checks for board and add-task flows.

### Acceptance Criteria
- [ ] Board/addTask CSS is decomposed into smaller concern-based files.
- [ ] Existing visual behavior remains unchanged.
- [ ] No duplicate spacing/breakpoint definitions are introduced.
