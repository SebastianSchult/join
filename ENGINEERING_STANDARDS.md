# Engineering Standards

This document defines baseline engineering standards for this repository.
Scope: browser runtime JavaScript, HTML templates, CSS, and refactor PR quality.

## 1) Function Documentation Expectations

Use JSDoc for all public/shared functions and for any function with non-trivial behavior.

Required for public/shared functions:

- short purpose sentence
- parameters with types and intent
- return value type and meaning
- side effects (DOM, storage, network, globals)
- important constraints or assumptions

Example:

```js
/**
 * Loads runtime navigation for the current viewport.
 *
 * @param {boolean} isMobile - True when mobile breakpoint is active.
 * @returns {void}
 * @sideEffects Updates navigation container DOM nodes.
 */
function renderNavigationForViewport(isMobile) {}
```

For private/simple helpers:

- JSDoc is optional when function name and code are self-explanatory.
- Add a short comment when behavior is not obvious.

Documentation language:

- write in English
- keep descriptions concise and technical

## 2) Naming Conventions

JavaScript:

- functions/variables: `camelCase`
- constants: `UPPER_SNAKE_CASE`
- booleans: prefixes `is`, `has`, `can`, `should`
- event handlers: `handle*`
- initializers/bootstrap: `initialize*`
- DOM IDs/data-action values: kebab-case in HTML, mapped explicitly in JS

Files:

- JS/CSS files: kebab-case preferred
- use domain prefixes where useful (`board-*`, `contacts-*`, `runtime-*`)

Avoid:

- unclear abbreviations
- implicit globals
- duplicate helper names across files

## 3) Module Boundaries and Ownership

Ownership is domain-based. Each module has a primary responsibility:

- `script.js`: runtime orchestration/bootstrap only
- `js/runtime-fallbacks.js`: mixed-cache compatibility fallbacks
- `js/ui-event-delegation.js`: delegated UI event routing and action mapping
- `js/responsive-navigation.js`: breakpoints and responsive navigation state
- `js/cookiebot-bootstrap.js`: Cookiebot runtime loading/config handling
- page/domain modules (`js/board.js`, `js/addTask.js`, `js/contacts.js`, `js/login.js`, `js/signUp.js`, `js/summary.js`): page behavior only
- `js/storage.js`: storage and backend adapter concerns
- `js/helper.js`: shared helpers that are truly cross-domain

Boundary rules:

- avoid importing page-specific behavior into shared runtime modules
- keep rendering concerns out of storage/auth modules
- keep compatibility fallbacks isolated in `js/runtime-fallbacks.js`
- when logic is shared by multiple pages, extract to a dedicated helper module

Change ownership:

- if a change crosses domains, document the reason in the PR
- avoid "drive-by refactors" outside the ticket scope

## 4) Refactor PR Quality Checklist

Every refactor PR should include:

1. Scope statement (what changed and what is explicitly out of scope).
2. Risk notes (possible regressions and impacted flows/pages).
3. Validation evidence:
   - `npm run lint`
   - `npm run lint:jsdoc`
   - `npm run lint:file-size`
   - manual smoke checks for affected user journeys
4. Backward compatibility notes for mixed deploy/cache states when runtime code is touched.
5. Follow-up tickets for deferred cleanup.
6. Refactor regression matrix evidence using [REFACTOR_REGRESSION_MATRIX.md](./REFACTOR_REGRESSION_MATRIX.md).

Minimum smoke checks when runtime or shared modules change:

- login/signup flow
- summary load
- board open/create/edit/delete path
- add-task submit flow
- contacts create/edit/delete flow
- mobile navigation and overlays

## 5) Definition of Done for Standards Compliance

A standards-compliant change has:

- clear naming and no new implicit globals
- required function docs for public/shared behavior
- no module boundary violations
- lint checks passing
- PR description containing checklist evidence
