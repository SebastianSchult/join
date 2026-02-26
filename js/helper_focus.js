"use strict";

(function registerHelperFocusModule() {
  const HF_FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(", ");

  let hfActiveFocusLayer = null;

  const hfResolveFocusLayerContainer = (containerOrId) => {
    if (!containerOrId) {
      return null;
    }
    if (typeof containerOrId === "string") {
      return document.getElementById(containerOrId);
    }
    if (containerOrId instanceof HTMLElement) {
      return containerOrId;
    }
    return null;
  };

  const hfIsElementVisibleForFocus = (element) => {
    return (
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility !== "hidden"
    );
  };

  const hfGetFocusableElements = (container) => {
    return Array.from(container.querySelectorAll(HF_FOCUSABLE_SELECTOR)).filter(
      (element) =>
        element instanceof HTMLElement &&
        !element.hasAttribute("disabled") &&
        hfIsElementVisibleForFocus(element)
    );
  };

  const hfFocusElementIfPossible = (element) => {
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

  const hfLockOutsideFocusableElements = (container) => {
    const allFocusable = Array.from(
      document.querySelectorAll(HF_FOCUSABLE_SELECTOR)
    );
    const records = [];

    allFocusable.forEach((element) => {
      if (!(element instanceof HTMLElement)) {
        return;
      }
      if (container.contains(element)) {
        return;
      }
      records.push({ element, tabindex: element.getAttribute("tabindex") });
      element.setAttribute("tabindex", "-1");
    });

    return records;
  };

  const hfRestoreOutsideFocusableElements = (records) => {
    records.forEach(({ element, tabindex }) => {
      if (!(element instanceof HTMLElement) || !element.isConnected) {
        return;
      }
      if (tabindex === null) {
        element.removeAttribute("tabindex");
        return;
      }
      element.setAttribute("tabindex", tabindex);
    });
  };

  const hfHandleFocusLayerKeydown = (event, layer) => {
    if (hfActiveFocusLayer !== layer || !layer.container.isConnected) {
      return;
    }

    if (event.key === "Escape" && layer.onEscape) {
      event.preventDefault();
      event.stopPropagation();
      layer.onEscape();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = hfGetFocusableElements(layer.container);
    if (focusableElements.length === 0) {
      event.preventDefault();
      hfFocusElementIfPossible(layer.container);
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey) {
      if (activeElement === first || !layer.container.contains(activeElement)) {
        event.preventDefault();
        hfFocusElementIfPossible(last);
      }
      return;
    }

    if (activeElement === last || !layer.container.contains(activeElement)) {
      event.preventDefault();
      hfFocusElementIfPossible(first);
    }
  };

  const hfHandleFocusLayerFocusin = (event, layer) => {
    if (hfActiveFocusLayer !== layer || !layer.container.isConnected) {
      return;
    }
    if (layer.container.contains(event.target)) {
      return;
    }

    const fallbackTarget = hfGetFocusableElements(layer.container)[0] || layer.container;
    hfFocusElementIfPossible(fallbackTarget);
  };

  const hfFocusLayerInitialTarget = (layer) => {
    const { container, initialFocus } = layer;
    let initialTarget = null;

    if (typeof initialFocus === "string" && initialFocus.trim() !== "") {
      initialTarget = container.querySelector(initialFocus);
    } else if (initialFocus instanceof HTMLElement) {
      initialTarget = initialFocus;
    }

    if (!initialTarget) {
      initialTarget = hfGetFocusableElements(container)[0] || container;
    }

    if (!initialTarget.hasAttribute("tabindex") && initialTarget === container) {
      initialTarget.setAttribute("tabindex", "-1");
    }

    hfFocusElementIfPossible(initialTarget);
  };

  const hfDeactivateFocusLayer = (options = {}) => {
    if (!hfActiveFocusLayer) {
      return;
    }

    const { restoreFocus = true } = options;
    const layer = hfActiveFocusLayer;
    hfActiveFocusLayer = null;

    document.removeEventListener("keydown", layer.keydownHandler, true);
    document.removeEventListener("focusin", layer.focusinHandler, true);
    hfRestoreOutsideFocusableElements(layer.outsideFocusRecords);

    if (restoreFocus) {
      hfFocusElementIfPossible(layer.opener);
    }
  };

  const hfActivateFocusLayer = (containerOrId, options = {}) => {
    const container = hfResolveFocusLayerContainer(containerOrId);
    if (!container) {
      return false;
    }

    hfDeactivateFocusLayer({ restoreFocus: false });

    const layer = {
      container,
      opener: options.opener || document.activeElement,
      onEscape: typeof options.onEscape === "function" ? options.onEscape : null,
      initialFocus: options.initialFocus || null,
      outsideFocusRecords: [],
      keydownHandler: null,
      focusinHandler: null,
    };

    layer.outsideFocusRecords = hfLockOutsideFocusableElements(container);
    layer.keydownHandler = (event) => hfHandleFocusLayerKeydown(event, layer);
    layer.focusinHandler = (event) => hfHandleFocusLayerFocusin(event, layer);

    document.addEventListener("keydown", layer.keydownHandler, true);
    document.addEventListener("focusin", layer.focusinHandler, true);
    hfActiveFocusLayer = layer;

    hfFocusLayerInitialTarget(layer);
    return true;
  };

  window.HelperFocus = Object.freeze({
    FOCUSABLE_SELECTOR: HF_FOCUSABLE_SELECTOR,
    activateFocusLayer: hfActivateFocusLayer,
    deactivateFocusLayer: hfDeactivateFocusLayer,
    resolveFocusLayerContainer: hfResolveFocusLayerContainer,
    getFocusableElements: hfGetFocusableElements,
    isElementVisibleForFocus: hfIsElementVisibleForFocus,
    focusElementIfPossible: hfFocusElementIfPossible,
    lockOutsideFocusableElements: hfLockOutsideFocusableElements,
    restoreOutsideFocusableElements: hfRestoreOutsideFocusableElements,
  });

  window.activateFocusLayer = hfActivateFocusLayer;
  window.deactivateFocusLayer = hfDeactivateFocusLayer;
  window.resolveFocusLayerContainer = hfResolveFocusLayerContainer;
  window.getFocusableElements = hfGetFocusableElements;
  window.isElementVisibleForFocus = hfIsElementVisibleForFocus;
  window.focusElementIfPossible = hfFocusElementIfPossible;
  window.lockOutsideFocusableElements = hfLockOutsideFocusableElements;
  window.restoreOutsideFocusableElements = hfRestoreOutsideFocusableElements;
})();
