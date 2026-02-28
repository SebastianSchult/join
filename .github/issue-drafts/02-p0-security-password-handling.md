Title: [P0][Security]: Rework password handling (no plaintext credentials)

Body:
### Priority
P0 - Critical

### Area
Auth

### Risk / Impact
Passwords are stored and compared as plaintext in frontend-accessible data. Contact creation also derives default passwords from first names. This enables credential compromise and trivial account takeover.

### Affected Files / Scope
- `js/signUp.js`
- `js/login.js`
- `js/contact_popups.js`

### Proposed Mitigation
- Stop storing plaintext passwords in user objects.
- Use server-side authentication flow with hashed credentials.
- Remove insecure default password behavior for contact creation.
- Ensure login checks happen through secure auth endpoint logic, not client-side plaintext comparison.

### Acceptance Criteria
- [ ] Plaintext password storage is eliminated.
- [ ] Login no longer compares plaintext credentials in frontend code.
- [ ] Contact creation does not assign predictable default passwords.
- [ ] Auth flow is documented and verified for basic abuse cases.
