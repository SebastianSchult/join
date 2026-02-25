Title: [P1][Chore]: Create refactor regression matrix and smoke-check checklist

Body:
### Priority
P1 - High

### Area
Tooling

### Summary
Refactor work is high-risk without a fixed regression matrix for critical user journeys.

### Engineering Value
- Standardized verification quality across refactor PRs.
- Faster detection of behavioral regressions.
- Better decision-making for follow-up tickets.

### Proposed Mitigation
- Add a checklist covering core journeys:
  - login/signup
  - summary load
  - board CRUD + drag/drop
  - add-task flow
  - contacts CRUD
  - mobile navigation and overlays
- Require checklist completion in refactor PR descriptions.

### Acceptance Criteria
- [ ] Refactor regression matrix document exists.
- [ ] Core smoke-test paths are clearly defined.
- [ ] New refactor PRs reference and use the checklist.
