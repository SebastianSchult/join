Title: [P1][Refactor]: Decompose addTask.js into domain and UI modules

Body:
### Priority
P1 - High

### Area
Board

### Context / Problem
`js/addTask.js` currently mixes dropdown state, keyboard accessibility, form behavior, and rendering orchestration in one large file.

### Affected Files / Scope
- `js/addTask.js`
- `js/addTask_tasks.js` (integration boundaries)

### Proposed Refactor
- Extract modules for:
  - dropdown/open-close state
  - keyboard accessibility behavior
  - form validation and payload mapping
- Keep feature behavior unchanged.

### Risks / Regression Notes
- Add-task flow touches board overlay and filepicker integration.
- Must validate create/edit flows and keyboard interactions.

### Acceptance Criteria
- [ ] `addTask.js` responsibilities are separated into focused modules.
- [ ] Dropdown/keyboard logic is isolated and reusable.
- [ ] Task create/edit behavior remains stable.
