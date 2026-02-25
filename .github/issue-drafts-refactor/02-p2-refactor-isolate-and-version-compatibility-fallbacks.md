Title: [P2][Refactor]: Isolate and version compatibility fallbacks

Body:
### Priority
P2 - Medium

### Area
Tooling

### Context / Problem
Compatibility fallbacks for mixed deploy/cache states are embedded in core runtime flow. This makes `script.js` harder to reason about and creates noisy global behavior.

### Affected Files / Scope
- `script.js`
- new compatibility module

### Proposed Refactor
- Move compatibility fallbacks into a dedicated module.
- Group fallbacks by domain (sanitize/auth/helpers).
- Add explicit version header and short rationale for each fallback group.

### Risks / Regression Notes
- Removing fallback too early can break stale-client scenarios.
- Keep behavior backward-compatible during transition.

### Acceptance Criteria
- [ ] Compatibility logic is isolated from main runtime orchestration.
- [ ] Fallback groups are documented and version-tagged.
- [ ] Existing stale-cache compatibility behavior remains functional.
