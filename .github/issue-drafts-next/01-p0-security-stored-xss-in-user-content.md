Title: [P0][Security]: Prevent stored XSS in task/contact user content rendering

Body:
### Priority
P0 - Critical

### Area
UI

### Risk / Impact
User-controlled values (task title/description, contact name/email/phone) are rendered through HTML template strings and `innerHTML` without escaping. Malicious payloads can become stored XSS and execute for other users opening board/contacts views.

### Affected Files / Scope
- `js/addTask_tasks.js`
- `js/contact_popups.js`
- `assets/templates/html_templates.js`
- `js/contacts_render.js`
- `js/board.js`

### Proposed Mitigation
- Introduce a single escaping/sanitization strategy for user-provided text.
- Prefer `textContent` for dynamic user values where possible.
- Keep HTML templates only for trusted static markup.
- Add regression tests/checks for common XSS payloads.

### Acceptance Criteria
- [ ] User-provided task/contact fields are not rendered via unsafe raw HTML injection.
- [ ] Typical payloads (for example `<img onerror=...>`, `<script>`) do not execute in board/contacts UI.
- [ ] Rendering strategy is documented for future contributors.
