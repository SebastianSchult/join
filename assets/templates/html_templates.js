/**
 * @deprecated Legacy compatibility shim.
 *
 * The monolithic template bundle was split into focused domain files:
 * - assets/templates/templates_shared.js
 * - assets/templates/templates_navigation_auth.js
 * - assets/templates/templates_board.js
 * - assets/templates/templates_addtask.js
 *
 * This shim intentionally exposes no template functions and only serves as
 * a deprecation marker for stale references.
 */
(function markLegacyTemplateBundleDeprecated() {
  if (typeof window === "undefined") {
    return;
  }
  window.__JOIN_LEGACY_TEMPLATE_BUNDLE_DEPRECATED__ = true;
})();
