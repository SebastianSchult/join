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
	navigation: Object.freeze({
		version: "navigation-v1",
		rationale:
			"Keep responsive navigation rendering stable when template bundle is stale or missing.",
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

/**
 * Checks whether the current fallback version was already applied to this runtime.
 *
 * @returns {boolean} `true` when current fallback version is already active.
 */
function isRuntimeFallbackVersionApplied() {
	return window.__joinRuntimeFallbackVersion === RUNTIME_FALLBACKS_HEADER.version;
}

/**
 * Marks current fallback version as applied and stores immutable metadata for diagnostics.
 *
 * Side effects:
 * - Writes `window.__joinRuntimeFallbackVersion`.
 * - Writes `window.__joinRuntimeFallbackMetadata`.
 *
 * @returns {void}
 */
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

	ensureWindowFunction("renderNavigationHTML", function () {
		return /* html */ `
	<div class="navigation-content">
		<div id="nav-wrapper" class="nav-wrapper">
			<div class="nav-buttons-box">
				<a href="./summary.html" id="summary" class="nav-btn">
					<img class="navImg" src="./assets/img/icon-summary.png" alt="summary" />Summary
				</a>
				<a href="./addTask.html" id="addTask" class="nav-btn">
					<img src="./assets/img/icon-addTask.png" alt="add task" />Add Task
				</a>
				<a href="./board.html" id="board" class="nav-btn">
					<img src="./assets/img/icon-board.png" alt="board" />Board
				</a>
				<a href="./contacts.html" id="contacts" class="nav-btn">
					<img src="./assets/img/icon-contacts.png" alt="contacts" />Contacts
				</a>
			</div>
			<div class="privatePolicyAndLegalNoticeLinksNav">
				<div id="privacyNav"><a href="./privacy.html">Privacy Policy</a></div>
				<div id="legalNav"><a href="./legal_notice.html">Legal Notice</a></div>
			</div>
		</div>
	</div>`;
	});
}

/**
 * Registers a fallback implementation on `window` only when function is missing.
 *
 * @param {string} functionName - Global function identifier.
 * @param {Function} implementation - Fallback implementation to register.
 * @returns {void}
 */
function ensureWindowFunction(functionName, implementation) {
	if (typeof window[functionName] !== "function") {
		window[functionName] = implementation;
	}
}
