# Refactor Research (Ticket #73)

## Goal

Move the codebase toward maintainable industry-standard structure:

- clear module boundaries
- predictable CI quality gates
- smaller files (target: avoid files > 400 lines where feasible)
- documented public/shared functions and critical behavior paths

## Current baseline (measured)

### JavaScript files over 400 lines

- `script.js` (~828)
- `js/contact_popups.js` (~772)
- `js/addTask.js` (~652)
- `js/board.js` (~629)
- `js/storage.js` (~452)
- `js/helper.js` (~421)

### CSS files over 400 lines

- `assets/css/contacts.css` (~1116)
- `assets/css/summary.css` (~980)
- `assets/css/board.css` (~961)
- `assets/css/addTask.css` (~846)
- `assets/css/contactsMobile.css` (~709, removed in #123 after usage audit)
- `assets/css/login.css` (~455)
- `assets/css/signUp.css` (~454)

## Key findings

1. `script.js` is overloaded
- It combines runtime compatibility fallbacks, event delegation, responsive behavior, navigation rendering, Cookiebot initialization, and general helpers.
- This increases coupling and makes reasoning/regression testing harder.

2. UI feature modules are large and mixed
- `contact_popups.js`, `addTask.js`, `board.js` each contain both domain behavior and UI rendering/interaction orchestration.
- Editing one behavior risks accidental regressions elsewhere in the same file.

3. CSS is strongly page-coupled and monolithic
- Several CSS files are too large for fast review.
- Repeated patterns and mixed concerns (layout, component styling, responsive overrides) increase maintenance cost.

4. Documentation quality is improving, but still uneven
- Core docs for deployment/config/accessibility/automation exist.
- Refactor conventions and module ownership rules are not yet centralized in one engineering guide.

## Immediate improvement implemented in this ticket

### Responsive breakpoint state cleanup in `script.js`

Replaced unclear mutable flags:

- `isSmallerThan802`
- `isSmallerThan802Old`

with clearer, single-source state:

- `isMobileViewport`
- `initializeResponsiveNavigation()`
- resize handling that only rerenders on breakpoint transition

Why:

- removes ambiguous naming (`802`)
- removes duplicated "old/new" state variables
- keeps behavior deterministic and easier to reason about

## Proposed refactor roadmap (recommended tickets)

### Phase 1: Foundation

1. `script.js` split into dedicated modules
- `runtime-fallbacks.js`
- `ui-event-delegation.js`
- `responsive-navigation.js`
- `cookiebot-bootstrap.js`

2. Engineering standards doc
- define JSDoc requirements (public/shared functions mandatory)
- define max file-size policy and exception process
- define naming conventions and module boundaries

### Phase 2: Feature module decomposition

3. Split `js/contact_popups.js`
- form validation
- overlay/focus handling
- mutation/persistence operations

4. Split `js/addTask.js`
- dropdown/keyboard access
- subtask editing
- field validation and task payload mapping

5. Split `js/board.js`
- board rendering
- card detail rendering
- image/gallery handling

### Phase 3: CSS modularization

6. Break down large page CSS into component-level files
- keep page entry CSS lean
- move repeated patterns into shared component styles

7. Add CSS architecture notes (token usage + layering order)

### Phase 4: Guardrails and verification

8. Extend CI checks
- file-length threshold warning check (JS/CSS)
- optional docs coverage check for public functions

9. Regression pass
- keyboard + responsive + core CRUD journeys
- create follow-up issues for findings outside scope

## Risks

- Large-scale splitting can break load order in a multi-script page architecture.
- Mitigation: keep refactors incremental, one module group per PR, and verify each page init path.

## Acceptance status for Ticket #73

- [x] technical baseline measured
- [x] first concrete cleanup applied in `script.js`
- [x] structured refactor roadmap documented
- [ ] full project-wide refactor execution (requires follow-up ticket batch)
