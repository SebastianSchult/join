"use strict";

/**
 * Compatibility bootstrap for helper modules.
 *
 * Primary implementations now live in:
 * - js/helper_dom.js
 * - js/helper_sanitize.js
 * - js/helper_focus.js
 *
 * This file only guarantees global API compatibility in mixed cache/deploy states.
 */
(function registerHelperCompatibilityLayer() {
  const hasHelperDom =
    window.HelperDom && typeof window.HelperDom.setAttributes === "function";
  const hasHelperSanitize =
    window.HelperSanitize &&
    typeof window.HelperSanitize.escapeHtml === "function";
  const hasHelperFocus =
    window.HelperFocus &&
    typeof window.HelperFocus.activateFocusLayer === "function";

  if (!hasHelperDom) {
    window.clearDiv =
      typeof window.clearDiv === "function"
        ? window.clearDiv
        : (id) => (document.getElementById(id).innerHTML = "");
    window.doNotClose =
      typeof window.doNotClose === "function"
        ? window.doNotClose
        : (event) => event.stopPropagation();
    window.setAttributes =
      typeof window.setAttributes === "function"
        ? window.setAttributes
        : (element, attrs) => {
            for (const key in attrs) {
              element.setAttribute(key, attrs[key]);
            }
          };
    window.findFreeId =
      typeof window.findFreeId === "function"
        ? window.findFreeId
        : (arrayToCheck) => {
            for (let i = 0; i < 1000; i++) {
              let free = true;
              for (let j = 0; j < arrayToCheck.length; j++) {
                if (arrayToCheck[j].id == i) {
                  free = false;
                }
              }
              if (free) return i;
            }
            return -1;
          };
    window.generateRandomColor =
      typeof window.generateRandomColor === "function"
        ? window.generateRandomColor
        : () => {
            const colors = [
              "#76b852",
              "#ff7043",
              "#ff3333",
              "#3399ff",
              "#ff6666",
              "#33ccff",
              "#ff9933",
              "#66ff66",
              "#0059ff",
              "#a64dff",
            ];
            return colors[Math.floor(Math.random() * colors.length)];
          };
  }

  if (!hasHelperSanitize) {
    window.escapeHtml =
      typeof window.escapeHtml === "function"
        ? window.escapeHtml
        : (value) => {
            const normalized = value == null ? "" : String(value);
            return normalized
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#39;");
          };
    window.toSafeInteger =
      typeof window.toSafeInteger === "function"
        ? window.toSafeInteger
        : (value, fallback = 0) => {
            const parsed = Number.parseInt(String(value), 10);
            return Number.isFinite(parsed) ? parsed : fallback;
          };
    window.sanitizeCssColor =
      typeof window.sanitizeCssColor === "function"
        ? window.sanitizeCssColor
        : (value, fallback = "#2a3647") => {
            const normalized = value == null ? "" : String(value).trim();
            const isHexColor = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(
              normalized
            );
            return isHexColor ? normalized : fallback;
          };
    window.sanitizeMailtoHref =
      typeof window.sanitizeMailtoHref === "function"
        ? window.sanitizeMailtoHref
        : (value) => {
            const normalized = value == null ? "" : String(value).trim();
            const singleLineValue = normalized.replace(/[\r\n]+/g, "");
            if (singleLineValue === "") {
              return "mailto:";
            }
            return `mailto:${encodeURIComponent(singleLineValue)}`;
          };
  }

  if (!hasHelperFocus) {
    window.activateFocusLayer =
      typeof window.activateFocusLayer === "function"
        ? window.activateFocusLayer
        : () => true;
    window.deactivateFocusLayer =
      typeof window.deactivateFocusLayer === "function"
        ? window.deactivateFocusLayer
        : () => {};
    window.resolveFocusLayerContainer =
      typeof window.resolveFocusLayerContainer === "function"
        ? window.resolveFocusLayerContainer
        : (containerOrId) =>
            typeof containerOrId === "string"
              ? document.getElementById(containerOrId)
              : containerOrId || null;
    window.getFocusableElements =
      typeof window.getFocusableElements === "function"
        ? window.getFocusableElements
        : (container) =>
            container && container.querySelectorAll
              ? Array.from(
                  container.querySelectorAll(
                    "a[href],button:not([disabled]),input:not([disabled]):not([type='hidden']),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])"
                  )
                )
              : [];
    window.isElementVisibleForFocus =
      typeof window.isElementVisibleForFocus === "function"
        ? window.isElementVisibleForFocus
        : (element) =>
            element instanceof HTMLElement &&
            element.getClientRects().length > 0 &&
            getComputedStyle(element).visibility !== "hidden";
    window.focusElementIfPossible =
      typeof window.focusElementIfPossible === "function"
        ? window.focusElementIfPossible
        : (element) => {
            if (!(element instanceof HTMLElement) || !element.isConnected) {
              return false;
            }
            try {
              element.focus();
              return true;
            } catch (_error) {
              return false;
            }
          };
    window.lockOutsideFocusableElements =
      typeof window.lockOutsideFocusableElements === "function"
        ? window.lockOutsideFocusableElements
        : () => [];
    window.restoreOutsideFocusableElements =
      typeof window.restoreOutsideFocusableElements === "function"
        ? window.restoreOutsideFocusableElements
        : () => {};
  }

  if (!window.__joinHelperModuleBootstrapInfoLogged) {
    window.__joinHelperModuleBootstrapInfoLogged = true;
    if (!hasHelperDom || !hasHelperSanitize || !hasHelperFocus) {
      console.warn(
        "Helper module fallback active. Ensure helper_dom.js, helper_sanitize.js and helper_focus.js are loaded before helper.js."
      );
    }
  }
})();
