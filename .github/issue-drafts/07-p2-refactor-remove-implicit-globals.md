Title: [P2][Refactor]: Remove implicit global variables

Body:
### Priority
P2 - Medium

### Area
Tooling

### Context / Problem
Several files assign values to undeclared variables. This creates implicit globals and unpredictable side effects across pages.

### Proposed Refactor
- Add explicit `const`/`let` declarations for all variables.
- Enable stricter checks (for example linting) to prevent regressions.
- Verify initialization order where globals were previously relied upon.

### Risks / Regression Notes
Fixing implicit globals may reveal hidden coupling between scripts. A pass over login, contacts, summary, and shared script files is required.

### Acceptance Criteria
- [ ] No undeclared variable assignments remain in targeted files.
- [ ] No runtime behavior depends on implicit globals.
- [ ] Guardrail check is added to catch future implicit globals.
