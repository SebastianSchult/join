Title: [P2][Chore]: Add file-size guardrail for JS and CSS in CI

Body:
### Priority
P2 - Medium

### Area
Tooling

### Summary
Large files are currently allowed to grow without an automated warning/error threshold.

### Engineering Value
- Prevent new monolithic files.
- Make refactor progress measurable.
- Keep review scope manageable in future PRs.

### Proposed Mitigation
- Add CI guardrail script for JS/CSS line-count thresholds.
- Report warning/error with file path and line count.
- Document thresholds and exceptions.

### Acceptance Criteria
- [ ] CI reports files above configured thresholds.
- [ ] Thresholds are documented in repository docs.
- [ ] Output is clear and actionable for contributors.
