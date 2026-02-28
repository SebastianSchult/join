Title: [P3][Chore]: Remove debug logs and add minimal CI syntax check

Body:
### Priority
P3 - Low

### Area
Tooling

### Summary
There are leftover debug `console.log` statements in production code. The repository also lacks a minimal automated syntax guard in CI for JavaScript files.

### Engineering Value
- Cleaner production logs.
- Earlier detection of syntax problems in pull requests.
- Lower debugging noise and safer baseline quality.

### Acceptance Criteria
- [ ] Unnecessary debug logs are removed from affected files.
- [ ] A minimal CI check validates JS syntax on push and pull request.
- [ ] CI failure signal is clear and actionable.
