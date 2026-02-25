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
