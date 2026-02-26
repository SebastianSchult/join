# Refactor Regression Matrix

This checklist defines the minimum smoke-test baseline for refactor pull requests.
Use it to detect behavior regressions before merge.

## How To Use

1. Run all applicable flows after refactor changes.
2. Record `PASS` / `FAIL` plus short notes in your PR description.
3. If a flow fails, either fix it in the PR or open a follow-up issue and link it.

## Required Smoke Paths

| ID | Journey | Scope | Viewports | Preconditions | Expected Result |
| --- | --- | --- | --- | --- | --- |
| R1 | Login | `index.html` | Desktop + mobile (`>=1204`, `801`, `560`) | Valid test user exists in storage/Firebase | User can log in and is redirected to summary/board without console errors. |
| R2 | Signup | `signUp.html` | Desktop + mobile (`>=1204`, `801`, `560`) | Unique email available | User can sign up, validation errors are shown correctly, user data persists. |
| R3 | Summary Load | `summary.html` | Desktop + mobile (`>=1204`, `801`, `560`) | Logged-in user + task/user data available | Summary cards render counts correctly, greeting flow works without runtime errors. |
| R4 | Board CRUD | `board.html` | Desktop + mobile (`>=1204`, `801`, `560`) | Logged-in user + existing tasks | Open task, edit/save, delete, and create task from board overlays without stuck overlays. |
| R5 | Board Drag/Drop | `board.html` | Desktop + mobile touch | Existing tasks in multiple columns | Drag/drop updates task status and persists after reload. |
| R6 | Add Task Flow | `addTask.html` | Desktop + mobile (`>=1204`, `801`, `560`) | Logged-in user + contacts loaded | Create task with assignees/subtasks/images, validation works, task appears on board. |
| R7 | Contacts CRUD | `contacts.html` | Desktop + mobile (`>=1204`, `801`, `560`) | Logged-in user + contact list loaded | Create/edit/delete contacts works without reload races and without console errors. |
| R8 | Mobile Nav + Overlays | `summary`, `board`, `contacts`, `addTask` | Mobile (`<=801`) | Logged-in user | Navigation, dropdowns, and overlays are keyboard/touch usable; open/close/focus behavior remains stable. |

## Execution Notes Per Path

### R1 Login
- Test invalid credentials first (expect user-facing error).
- Then test valid credentials (expect successful redirect and session set).

### R2 Signup
- Validate duplicate-email rejection path.
- Validate required-field and password rule errors.

### R3 Summary Load
- Verify no uncaught errors in console.
- Verify task counters and urgency/date card render.

### R4 Board CRUD
- Open task details, click edit, save with and without changes.
- Verify overlay fully closes and board remains interactive.

### R5 Board Drag/Drop
- Move at least one task across columns.
- Reload page and verify moved state persisted.

### R6 Add Task Flow
- Verify assigned-to dropdown, category dropdown, priority selection, subtasks, and image area.
- Save task and verify task shows on board.

### R7 Contacts CRUD
- Add contact with duplicate-email check.
- Edit contact and delete contact; verify list and details update deterministically.

### R8 Mobile Navigation And Overlays
- Verify mobile menu actions and page switching.
- Verify add/edit overlays and dropdowns can be opened/closed repeatedly.

## PR Reporting Template (Copy Into PR)

```md
## Refactor Regression Results

| ID | Result | Notes |
| --- | --- | --- |
| R1 Login | PASS/FAIL | |
| R2 Signup | PASS/FAIL | |
| R3 Summary Load | PASS/FAIL | |
| R4 Board CRUD | PASS/FAIL | |
| R5 Board Drag/Drop | PASS/FAIL | |
| R6 Add Task Flow | PASS/FAIL | |
| R7 Contacts CRUD | PASS/FAIL | |
| R8 Mobile Nav + Overlays | PASS/FAIL | |
```
