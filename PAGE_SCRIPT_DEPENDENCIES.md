# Page Script Dependencies

This document defines the per-page script manifests used in the HTML entry files.
Goal: keep page runtime dependencies explicit and avoid hidden cross-page coupling.

## Shared Core Runtime

Used on all app pages:

- `./js/runtime-fallbacks.js`
- `./js/ui-event-actions.js`
- `./js/ui-event-delegation.js`
- `./js/responsive-navigation.js`
- `./js/cookiebot-bootstrap.js`
- `script.js`
- `./js/config.js`

## Shared Storage/Auth Runtime

Used on pages that read/write users/tasks:

- `./js/storage_compat_fallbacks.js`
- `./js/storage_error_policy.js`
- `./js/storage_transport.js`
- `./js/storage_firebase_adapter.js`
- `./js/storage_runtime.js`
- `./js/storage.js`
- `./js/auth.js`

## Per-Page Manifests

### `index.html`

- Shared core runtime
- Shared storage/auth runtime
- `./js/login.js`

### `signUp.html`

- Shared core runtime
- Shared storage/auth runtime
- `./js/helper_dom.js`
- `./js/helper_sanitize.js`
- `./js/helper_focus.js`
- `./js/helper.js`
- `./js/signUp.js`

### `summary.html`

- Shared core runtime
- Shared storage/auth runtime
- `./assets/templates/templates_navigation_auth.js`
- `./js/summary.js`

### `contacts.html`

- Shared core runtime
- Shared storage/auth runtime
- `./js/helper_dom.js`
- `./js/helper_sanitize.js`
- `./js/helper_focus.js`
- `./js/helper.js`
- `./js/contacts_render.js`
- `./js/contacts.js`
- `./js/contacts_view.js`
- `./js/contact_list.js`
- `./js/contact_popups_validation.js`
- `./js/contact_popups_overlay.js`
- `./js/contact_popups_mutations.js`
- `./js/contact_popups.js`
- `./assets/templates/templates_navigation_auth.js`

### `board.html`

- Shared core runtime
- Shared storage/auth runtime
- `./js/helper_dom.js`
- `./js/helper_sanitize.js`
- `./js/helper_focus.js`
- `./js/helper.js`
- `./js/filepicker_media.js`
- `./js/filepicker.js`
- `./js/board.js`
- `./js/board_rendering.js`
- `./js/board_state.js`
- `./js/board_media.js`
- `./js/board_popups.js`
- `./js/board_drag_and_drop.js`
- `./js/contacts.js`
- `./js/contacts_view.js`
- `./js/addTask_dropdown.js`
- `./js/addTask_keyboard.js`
- `./js/addTask_form_domain.js`
- `./js/addTask_ui.js`
- `./js/addTask.js`
- `./js/addTask_task_storage.js`
- `./js/addTask_tasks.js`
- `./assets/templates/templates_shared.js`
- `./assets/templates/templates_navigation_auth.js`
- `./assets/templates/templates_board.js`
- `./assets/templates/templates_addtask.js`
- `https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.7/viewer.min.js`

### `addTask.html`

- Shared core runtime
- Shared storage/auth runtime
- `./js/helper_dom.js`
- `./js/helper_sanitize.js`
- `./js/helper_focus.js`
- `./js/helper.js`
- `./js/addTask_dropdown.js`
- `./js/addTask_keyboard.js`
- `./js/addTask_form_domain.js`
- `./js/addTask_ui.js`
- `./js/addTask.js`
- `./js/addTask_task_storage.js`
- `./js/addTask_tasks.js`
- `./js/contacts.js`
- `./js/contacts_view.js`
- `./js/board.js`
- `./js/board_rendering.js`
- `./js/board_state.js`
- `./js/board_media.js`
- `./js/board_drag_and_drop.js`
- `./js/board_popups.js`
- `./assets/templates/templates_shared.js`
- `./assets/templates/templates_navigation_auth.js`
- `./assets/templates/templates_board.js`
- `./assets/templates/templates_addtask.js`
- `./js/filepicker_media.js`
- `./js/filepicker.js`
- `https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.7/viewer.min.js`

### `help.html`, `privacy.html`, `legal_notice.html`, `privacy_external.html`, `legal_notice_external.html`

- Shared core runtime
- `./assets/templates/templates_navigation_auth.js`
- Page script:
  - `./js/help.js` for `help.html`
  - `./js/privacy_and_legal.js` for privacy/legal pages

## Maintenance Rule

When adding a new script include to an HTML page:

1. Update this manifest first.
2. Add the script only to pages that need the feature.
3. Verify with `npm run lint:js`.
