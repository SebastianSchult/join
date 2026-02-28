Title: [P3][Chore]: Add automated accessibility checks to CI

Body:
### Priority
P3 - Low

### Area
Tooling

### Summary
Current CI validates syntax and selected guardrails, but there is no automated accessibility baseline check.

### Engineering Value
- Detect accessibility regressions early in pull requests.
- Encourage measurable UI quality improvements.
- Provide actionable reports for accessibility debt.

### Proposed Mitigation
- Add lightweight accessibility checks (for example Lighthouse or axe-based checks) for core pages.
- Fail CI on severe regressions and publish a concise report.
- Document local command for developers.

### Acceptance Criteria
- [ ] PR CI includes at least one automated accessibility check job.
- [ ] Output clearly shows page-level accessibility findings.
- [ ] Documentation explains how to run and interpret checks locally.
