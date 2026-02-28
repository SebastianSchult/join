Title: [P3][Chore]: Ignore and clean local OS/editor artifacts from repository

Body:
### Priority
P3 - Low

### Area
Tooling

### Summary
Repository status is frequently polluted by local machine artifacts (for example `.DS_Store`). This creates noisy diffs and increases risk of accidental unrelated commits.

### Affected Files / Scope
- `.gitignore`
- existing tracked local artifact files in project tree

### Proposed Mitigation
- Add common OS/editor artifact patterns to `.gitignore`.
- Remove already-tracked artifacts from version control where safe.
- Keep working tree clean for ticket-based branches.

### Acceptance Criteria
- [ ] `.DS_Store` and similar local artifacts are ignored.
- [ ] Existing tracked artifact files are removed from git index.
- [ ] `git status` remains focused on intentional code changes.
