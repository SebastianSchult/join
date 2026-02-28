Title: [P2][Chore]: Add lint guardrails for JS undefined references and template HTML issues

Body:
### Priority
P2 - Medium

### Area
Tooling

### Summary
Current CI has syntax checks but misses higher-level defects such as undefined cross-page references and duplicate HTML attributes inside template strings.

### Engineering Value
- Catch runtime-risk defects before merge.
- Reduce regressions in shared template-heavy JS files.
- Improve maintainability of multi-page script loading model.

### Proposed Mitigation
- Add ESLint rule set for browser JS (`no-undef`, `no-redeclare`, etc.).
- Add HTML/template linting (or custom check) to catch duplicate attributes in rendered markup.
- Integrate checks into PR workflow with clear actionable output.

### Acceptance Criteria
- [ ] CI fails on undefined function usage and duplicate declarations.
- [ ] CI fails on duplicate HTML attributes in template-rendering files.
- [ ] Developer docs include command to run lint checks locally.
