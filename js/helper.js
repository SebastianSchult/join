/**
 * Clears the inner HTML content of the element with the specified ID.
 *
 * @param {string} id - The ID of the element to clear.
 * @return {string} An empty string.
 */
function clearDiv(id) {
	return (document.getElementById(id).innerHTML = "");
}


/**
 * Prevents the event from propagating further.
 *
 * @param {Event} event - The event object to prevent from further propagation.
 * @return {undefined} 
 */
function doNotClose(event) {
	event.stopPropagation();
}


/**
 * Sets the attributes of the given element based on the key-value pairs in the attrs object.
 *
 * @param {Element} el - The element to set attributes for.
 * @param {Object} attrs - An object containing key-value pairs of attributes to set.
 * @return {undefined}
 */
function setAttributes(el, attrs) {
    for(let key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
  }


  /**
 * Finds a free ID within the given array by iterating over a range of IDs.
 *
 * @param {Array} arrayToCheck - The array to check for free IDs.
 * @return {number} The first available free ID.
 */
function findFreeId(arrayToCheck) {
  for (let i = 0; i < 1000; i++) {
    let free = true;
    for (let j = 0; j < arrayToCheck.length; j++) {
      if (arrayToCheck[j].id == i) {
        free = false;
      }
    }
    if (free) {
      return i;
    }
  }
}


/**
 * Generates a random color from a predefined list of colors.
 *
 * @function generateRandomColor
 * @returns {string} A randomly selected color.
 */
function generateRandomColor() {
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
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}


/**
 * Escapes text for safe HTML rendering.
 *
 * @param {unknown} value - Raw value to escape.
 * @returns {string} Escaped HTML-safe string.
 */
function escapeHtml(value) {
  const normalized = value == null ? "" : String(value);
  return normalized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


/**
 * Converts values to safe integer IDs for DOM attributes and inline handlers.
 *
 * @param {unknown} value - Candidate ID value.
 * @param {number} [fallback=0] - Fallback when conversion fails.
 * @returns {number} Parsed safe integer.
 */
function toSafeInteger(value, fallback = 0) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}


/**
 * Allows only hex color values for inline style rendering.
 *
 * @param {unknown} value - Candidate CSS color.
 * @param {string} [fallback="#2a3647"] - Fallback color.
 * @returns {string} Safe color string.
 */
function sanitizeCssColor(value, fallback = "#2a3647") {
  const normalized = value == null ? "" : String(value).trim();
  const isHexColor = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized);
  return isHexColor ? normalized : fallback;
}


/**
 * Builds a safe mailto URL value from user-provided text.
 *
 * @param {unknown} value - Email-like input value.
 * @returns {string} Safe mailto href.
 */
function sanitizeMailtoHref(value) {
  const normalized = value == null ? "" : String(value).trim();
  const singleLineValue = normalized.replace(/[\r\n]+/g, "");
  if (singleLineValue === "") {
    return "mailto:";
  }
  return `mailto:${encodeURIComponent(singleLineValue)}`;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

let activeFocusLayer = null;

/**
 * Activates focus management for dialog-like containers.
 * Traps Tab navigation, supports Esc callback, and restores focus on close.
 *
 * @param {HTMLElement|string} containerOrId - Focus scope container or element id.
 * @param {Object} [options={}] - Focus behavior options.
 * @param {HTMLElement|null} [options.opener] - Element that opened the container.
 * @param {Function|null} [options.onEscape] - Called when Esc is pressed.
 * @param {string|HTMLElement|null} [options.initialFocus] - Initial focus target.
 * @returns {boolean} True if focus layer was activated.
 */
function activateFocusLayer(containerOrId, options = {}) {
  const container = resolveFocusLayerContainer(containerOrId);
  if (!container) {
    return false;
  }

  deactivateFocusLayer({ restoreFocus: false });

  const layer = {
    container,
    opener: options.opener || document.activeElement,
    onEscape: typeof options.onEscape === "function" ? options.onEscape : null,
    initialFocus: options.initialFocus || null,
    outsideFocusRecords: [],
    keydownHandler: null,
    focusinHandler: null,
  };

  layer.outsideFocusRecords = lockOutsideFocusableElements(container);
  layer.keydownHandler = (event) => handleFocusLayerKeydown(event, layer);
  layer.focusinHandler = (event) => handleFocusLayerFocusin(event, layer);

  document.addEventListener("keydown", layer.keydownHandler, true);
  document.addEventListener("focusin", layer.focusinHandler, true);
  activeFocusLayer = layer;

  focusLayerInitialTarget(layer);
  return true;
}

/**
 * Deactivates active focus management layer.
 *
 * @param {Object} [options={}] - Deactivation options.
 * @param {boolean} [options.restoreFocus=true] - Restore focus to opener.
 * @returns {void}
 */
function deactivateFocusLayer(options = {}) {
  if (!activeFocusLayer) {
    return;
  }

  const { restoreFocus = true } = options;
  const layer = activeFocusLayer;
  activeFocusLayer = null;

  document.removeEventListener("keydown", layer.keydownHandler, true);
  document.removeEventListener("focusin", layer.focusinHandler, true);
  restoreOutsideFocusableElements(layer.outsideFocusRecords);

  if (restoreFocus) {
    focusElementIfPossible(layer.opener);
  }
}

/**
 * Resolves container references for focus layer activation.
 *
 * @param {HTMLElement|string} containerOrId - Container reference.
 * @returns {HTMLElement|null} Resolved container element.
 */
function resolveFocusLayerContainer(containerOrId) {
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
}

/**
 * Handles keyboard behavior for the active focus layer.
 *
 * @param {KeyboardEvent} event - Keyboard event.
 * @param {Object} layer - Active focus layer data.
 * @returns {void}
 */
function handleFocusLayerKeydown(event, layer) {
  if (activeFocusLayer !== layer || !layer.container.isConnected) {
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

  const focusableElements = getFocusableElements(layer.container);
  if (focusableElements.length === 0) {
    event.preventDefault();
    focusElementIfPossible(layer.container);
    return;
  }

  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement;

  if (event.shiftKey) {
    if (activeElement === first || !layer.container.contains(activeElement)) {
      event.preventDefault();
      focusElementIfPossible(last);
    }
    return;
  }

  if (activeElement === last || !layer.container.contains(activeElement)) {
    event.preventDefault();
    focusElementIfPossible(first);
  }
}

/**
 * Ensures focus cannot leave active layer container.
 *
 * @param {FocusEvent} event - Focus event.
 * @param {Object} layer - Active focus layer data.
 * @returns {void}
 */
function handleFocusLayerFocusin(event, layer) {
  if (activeFocusLayer !== layer || !layer.container.isConnected) {
    return;
  }

  if (layer.container.contains(event.target)) {
    return;
  }

  const fallbackTarget = getFocusableElements(layer.container)[0] || layer.container;
  focusElementIfPossible(fallbackTarget);
}

/**
 * Applies initial focus when a layer opens.
 *
 * @param {Object} layer - Active focus layer data.
 * @returns {void}
 */
function focusLayerInitialTarget(layer) {
  const { container, initialFocus } = layer;
  let initialTarget = null;

  if (typeof initialFocus === "string" && initialFocus.trim() !== "") {
    initialTarget = container.querySelector(initialFocus);
  } else if (initialFocus instanceof HTMLElement) {
    initialTarget = initialFocus;
  }

  if (!initialTarget) {
    initialTarget = getFocusableElements(container)[0] || container;
  }

  if (!initialTarget.hasAttribute("tabindex") && initialTarget === container) {
    initialTarget.setAttribute("tabindex", "-1");
  }

  focusElementIfPossible(initialTarget);
}

/**
 * Returns focusable descendants inside a given container.
 *
 * @param {HTMLElement} container - Scope container.
 * @returns {HTMLElement[]} Focusable elements.
 */
function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      element instanceof HTMLElement &&
      !element.hasAttribute("disabled") &&
      isElementVisibleForFocus(element)
  );
}

/**
 * Checks whether an element is visible enough to receive focus.
 *
 * @param {HTMLElement} element - Candidate element.
 * @returns {boolean} True when visible.
 */
function isElementVisibleForFocus(element) {
  return (
    element.getClientRects().length > 0 &&
    getComputedStyle(element).visibility !== "hidden"
  );
}

/**
 * Focuses an element when possible.
 *
 * @param {HTMLElement|null} element - Focus target.
 * @returns {boolean} True when focus call was attempted.
 */
function focusElementIfPossible(element) {
  if (!(element instanceof HTMLElement) || !element.isConnected) {
    return false;
  }
  try {
    element.focus();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Removes all outside elements from tab-order while overlay is active.
 *
 * @param {HTMLElement} container - Active focus layer container.
 * @returns {Array<{element: HTMLElement, tabindex: string|null}>} Stored tabindex records.
 */
function lockOutsideFocusableElements(container) {
  const allFocusable = Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR));
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
}

/**
 * Restores tabindex values for elements changed by lockOutsideFocusableElements.
 *
 * @param {Array<{element: HTMLElement, tabindex: string|null}>} records - Stored tabindex records.
 * @returns {void}
 */
function restoreOutsideFocusableElements(records) {
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
}
