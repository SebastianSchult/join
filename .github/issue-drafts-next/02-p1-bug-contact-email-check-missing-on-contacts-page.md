Title: [P1][Bug]: Fix contact creation email check dependency on contacts page

Body:
### Priority
P1 - High

### Area
Contacts

### Summary
`saveContact()` in `js/contact_popups.js` calls `checkMailExist(...)`, but this function is defined in `js/signUp.js` and is not loaded on `contacts.html`. This can break contact creation with `ReferenceError: checkMailExist is not defined`.

### Steps To Reproduce
1. Open `contacts.html`.
2. Click `Add new contact`.
3. Submit the form.
4. Inspect browser console.

### Expected Behavior
Contact creation checks duplicate email safely and continues without runtime errors.

### Actual Behavior
Cross-page dependency can throw `checkMailExist is not defined` in the contacts flow.

### Affected Files / Scope
- `js/contact_popups.js`
- `js/signUp.js`
- `contacts.html`

### Acceptance Criteria
- [ ] Contact creation no longer relies on functions that are only loaded on signup page.
- [ ] Duplicate-email validation works in contacts flow.
- [ ] No runtime error is thrown while creating contacts on `contacts.html`.
