Title: [P1][Refactor]: Split board.js into rendering, state updates, and media handling

Body:
### Priority
P1 - High

### Area
Board

### Context / Problem
`js/board.js` contains board rendering, card detail logic, subtask state updates, and image/gallery handling in one module.

### Affected Files / Scope
- `js/board.js`
- board popup/media integration

### Proposed Refactor
- Split into:
  - board rendering
  - card detail/subtask interactions
  - image/media viewer handling
- Keep current delegated action integration unchanged.

### Risks / Regression Notes
- Board is a core workflow; regressions are high impact.
- Drag/drop and card open/edit/delete must be retested.

### Acceptance Criteria
- [ ] Board responsibilities are separated into clear modules.
- [ ] Media/viewer logic is not mixed with core board rendering.
- [ ] No regressions in board CRUD and drag/drop journeys.
