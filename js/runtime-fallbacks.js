"use strict";

/**
 * Runtime compatibility fallback registry.
 *
 * Version Header
 * - module: runtime-fallbacks
 * - version: 2026.02.26-1
 * - compatibility target: mixed deploy/cache states
 *
 * Rationale:
 * During incremental deploys some clients temporarily run mixed script versions.
 * This registry keeps critical cross-page helper contracts stable until all assets
 * are refreshed on the client.
 */
const RUNTIME_FALLBACKS_HEADER = Object.freeze({
	module: "runtime-fallbacks",
	version: "2026.02.26-1",
	compatibilityTarget: "mixed-deploy-cache",
});

/**
 * Fallback groups are separated by domain to keep intent explicit and
 * reduce accidental coupling.
 */
const RUNTIME_FALLBACK_GROUPS = Object.freeze({
	sanitize: Object.freeze({
		version: "sanitize-v1",
		rationale:
			"Protect template rendering and URL/link output in stale-client mixes.",
	}),
	auth: Object.freeze({
		version: "auth-v1",
		rationale:
			"Keep normalized auth-email checks stable across login/signup/contacts pages.",
	}),
	helpers: Object.freeze({
		version: "helpers-v1",
		rationale:
			"Provide minimal numeric helper compatibility for delegated action payloads.",
	}),
});

/**
 * Adds compatibility fallbacks for mixed deploy/cache states in production.
 * This initializer is idempotent and safe to call more than once.
 */
function initializeLegacyRuntimeFallbacks() {
	if (isRuntimeFallbackVersionApplied()) {
		return;
	}

	applySanitizeFallbacks();
	applyAuthFallbacks();
	applyHelperFallbacks();
	markRuntimeFallbackVersionApplied();
}

function isRuntimeFallbackVersionApplied() {
	return window.__joinRuntimeFallbackVersion === RUNTIME_FALLBACKS_HEADER.version;
}

function markRuntimeFallbackVersionApplied() {
	window.__joinRuntimeFallbackVersion = RUNTIME_FALLBACKS_HEADER.version;
	window.__joinRuntimeFallbackMetadata = Object.freeze({
		header: RUNTIME_FALLBACKS_HEADER,
		groups: RUNTIME_FALLBACK_GROUPS,
	});
}

/**
 * Group: sanitize
 * Version tag: sanitize-v1
 */
function applySanitizeFallbacks() {
	ensureWindowFunction("escapeHtml", function (value) {
		const normalized = value == null ? "" : String(value);
		return normalized
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");
	});

	ensureWindowFunction("sanitizeCssColor", function (value, fallback = "#2a3647") {
		const normalized = value == null ? "" : String(value).trim();
		const isHexColor = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized);
		return isHexColor ? normalized : fallback;
	});

	ensureWindowFunction("sanitizeMailtoHref", function (value) {
		const normalized = value == null ? "" : String(value).trim();
		const singleLineValue = normalized.replace(/[\r\n]+/g, "");
		if (singleLineValue === "") {
			return "mailto:";
		}
		return `mailto:${encodeURIComponent(singleLineValue)}`;
	});
}

/**
 * Group: auth
 * Version tag: auth-v1
 */
function applyAuthFallbacks() {
	ensureWindowFunction("normalizeAuthEmail", function (email) {
		if (typeof email !== "string") {
			return "";
		}
		return email.trim().toLowerCase();
	});

	ensureWindowFunction(
		"doesEmailExist",
		function (usersList, emailToCheck, options = {}) {
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
		}
	);

	ensureWindowFunction("checkMailExist", function (mailToCheck, usersList) {
		const sourceUsers = Array.isArray(usersList)
			? usersList
			: typeof users !== "undefined" && Array.isArray(users)
			? users
			: [];
		return window.doesEmailExist(sourceUsers, mailToCheck);
	});
}

/**
 * Group: helpers
 * Version tag: helpers-v1
 */
function applyHelperFallbacks() {
	ensureWindowFunction("toSafeInteger", function (value, fallback = 0) {
		const parsed = Number.parseInt(String(value), 10);
		return Number.isFinite(parsed) ? parsed : fallback;
	});
}

function ensureWindowFunction(functionName, implementation) {
	if (typeof window[functionName] !== "function") {
		window[functionName] = implementation;
	}
}
