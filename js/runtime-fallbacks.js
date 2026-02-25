"use strict";

/**
 * Adds compatibility fallbacks for mixed deploy/cache states in production.
 * This keeps pages functional when one script is updated but another is still cached.
 */
function initializeLegacyRuntimeFallbacks() {
	if (typeof window.escapeHtml !== "function") {
		window.escapeHtml = function (value) {
			const normalized = value == null ? "" : String(value);
			return normalized
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&#39;");
		};
	}

	if (typeof window.toSafeInteger !== "function") {
		window.toSafeInteger = function (value, fallback = 0) {
			const parsed = Number.parseInt(String(value), 10);
			return Number.isFinite(parsed) ? parsed : fallback;
		};
	}

	if (typeof window.sanitizeCssColor !== "function") {
		window.sanitizeCssColor = function (value, fallback = "#2a3647") {
			const normalized = value == null ? "" : String(value).trim();
			const isHexColor = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(
				normalized
			);
			return isHexColor ? normalized : fallback;
		};
	}

	if (typeof window.sanitizeMailtoHref !== "function") {
		window.sanitizeMailtoHref = function (value) {
			const normalized = value == null ? "" : String(value).trim();
			const singleLineValue = normalized.replace(/[\r\n]+/g, "");
			if (singleLineValue === "") {
				return "mailto:";
			}
			return `mailto:${encodeURIComponent(singleLineValue)}`;
		};
	}

	if (typeof window.normalizeAuthEmail !== "function") {
		window.normalizeAuthEmail = function (email) {
			if (typeof email !== "string") {
				return "";
			}
			return email.trim().toLowerCase();
		};
	}

	if (typeof window.doesEmailExist !== "function") {
		window.doesEmailExist = function (usersList, emailToCheck, options = {}) {
			if (!Array.isArray(usersList)) {
				return false;
			}

			const normalizedMail = window.normalizeAuthEmail(emailToCheck);
			if (normalizedMail === "") {
				return false;
			}

			const hasExcludeId = Object.prototype.hasOwnProperty.call(
				options,
				"excludeId"
			);
			const excludeId = hasExcludeId ? options.excludeId : null;

			return usersList.some((user) => {
				if (!user || typeof user !== "object") {
					return false;
				}

				if (hasExcludeId && user.id === excludeId) {
					return false;
				}

				return window.normalizeAuthEmail(user.mail) === normalizedMail;
			});
		};
	}

	if (typeof window.checkMailExist !== "function") {
		window.checkMailExist = function (mailToCheck, usersList) {
			const sourceUsers = Array.isArray(usersList)
				? usersList
				: typeof users !== "undefined" && Array.isArray(users)
				? users
				: [];
			return window.doesEmailExist(sourceUsers, mailToCheck);
		};
	}
}
