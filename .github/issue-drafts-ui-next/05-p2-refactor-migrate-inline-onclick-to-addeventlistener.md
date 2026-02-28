Title: [P2][Refactor]: Migrate inline onclick handlers to addEventListener architecture

Body:
### Priority
P2 - Medium

### Area
UI

### Context / Problem
A large part of interactions is wired through inline HTML event attributes (`onclick`, `onmouseover`, `onmouseout`). This tightly couples markup and behavior and makes testing/refactoring harder.

### Proposed Refactor
- Move event wiring into JS modules using `addEventListener`.
- Use event delegation for dynamic lists/cards where appropriate.
- Keep templates focused on structure/content, not behavior strings.

### Risks / Regression Notes
Refactor affects many user flows and requires careful regression checks on board, contacts, add-task, login/signup pages.

### Acceptance Criteria
- [ ] Core interactive flows no longer depend on inline event attributes.
- [ ] Event registration is centralized and testable.
- [ ] No interaction regressions in main user journeys.
