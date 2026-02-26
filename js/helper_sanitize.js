"use strict";

(function registerHelperSanitizeModule() {
  const hsEscapeHtml = (value) => {
    const normalized = value == null ? "" : String(value);
    return normalized
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  const hsToSafeInteger = (value, fallback = 0) => {
    const parsed = Number.parseInt(String(value), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const hsSanitizeCssColor = (value, fallback = "#2a3647") => {
    const normalized = value == null ? "" : String(value).trim();
    const isHexColor = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized);
    return isHexColor ? normalized : fallback;
  };

  const hsSanitizeMailtoHref = (value) => {
    const normalized = value == null ? "" : String(value).trim();
    const singleLineValue = normalized.replace(/[\r\n]+/g, "");
    if (singleLineValue === "") {
      return "mailto:";
    }
    return `mailto:${encodeURIComponent(singleLineValue)}`;
  };

  window.HelperSanitize = Object.freeze({
    escapeHtml: hsEscapeHtml,
    toSafeInteger: hsToSafeInteger,
    sanitizeCssColor: hsSanitizeCssColor,
    sanitizeMailtoHref: hsSanitizeMailtoHref,
  });

  window.escapeHtml = hsEscapeHtml;
  window.toSafeInteger = hsToSafeInteger;
  window.sanitizeCssColor = hsSanitizeCssColor;
  window.sanitizeMailtoHref = hsSanitizeMailtoHref;
})();
