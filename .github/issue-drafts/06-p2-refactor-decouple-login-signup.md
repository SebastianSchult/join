Title: [P2][Refactor]: Decouple login and signup logic, remove duplicated validation

Body:
### Priority
P2 - Medium

### Area
Auth

### Context / Problem
Signup validation functions and form checks are duplicated across `login.js` and `signUp.js`. Current page script loading also mixes responsibilities between login and signup pages.

### Proposed Refactor
- Keep login logic in `login.js` only.
- Keep signup validation and submit flow in `signUp.js` only.
- Extract shared helpers into a dedicated shared auth utility module if needed.
- Update page script includes to load only required scripts per page.

### Risks / Regression Notes
Refactor touches form behavior and page initialization order. Manual verification needed for both login and signup flows.

### Acceptance Criteria
- [ ] Validation logic exists in one place only.
- [ ] Login and signup pages load only relevant scripts.
- [ ] No behavior regressions in form validation and submit handling.
