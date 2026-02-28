Title: [P2][UI]: Mobile layout audit and touch-target hardening across key pages

Body:
### Priority
P2 - Medium

### Area
UI

### Summary
Desktop-first interactions are mostly functional, but mobile quality is inconsistent in key flows (board/add task/contacts/summary), especially regarding overflow, touch-target sizes, and interaction density.

### Proposed Scope
- Audit key pages on common mobile widths.
- Remove horizontal overflow and clipping issues.
- Ensure actionable controls meet touch-target size guidance.
- Improve spacing and readability for dense UI sections.

### Acceptance Criteria
- [ ] No unintended horizontal scrolling on key pages.
- [ ] Primary interactive elements meet minimum touch-target size.
- [ ] Main workflows remain fully usable on mobile portrait widths.
