"use strict";

const COOKIEBOT_SCRIPT_ID = "Cookiebot";
const COOKIEBOT_UC_URL = "https://consent.cookiebot.com/uc.js";
const COOKIEBOT_CONFIG_RETRY_DELAY_MS = 100;
const COOKIEBOT_CONFIG_MAX_RETRIES = 30;

/**
 * Loads Cookiebot once runtime config is available.
 * Retries a short period because config.js is loaded after script.js on some pages.
 */
function initializeCookiebot(retryCount = 0) {
	if (document.getElementById(COOKIEBOT_SCRIPT_ID)) {
		return;
	}

	const joinConfig = getJoinRuntimeConfig();
	const cookiebotId =
		typeof joinConfig.COOKIEBOT_ID === "string"
			? joinConfig.COOKIEBOT_ID.trim()
			: "";

	if (!cookiebotId) {
		if (retryCount >= COOKIEBOT_CONFIG_MAX_RETRIES) {
			if (!window.__joinCookiebotConfigWarningShown) {
				window.__joinCookiebotConfigWarningShown = true;
				console.warn(
					"Cookiebot is not configured. Set JOIN_APP_CONFIG.COOKIEBOT_ID."
				);
			}
			return;
		}

		setTimeout(
			() => initializeCookiebot(retryCount + 1),
			COOKIEBOT_CONFIG_RETRY_DELAY_MS
		);
		return;
	}

	const blockingMode = getCookiebotBlockingMode(joinConfig);
	const scriptElement = document.createElement("script");
	scriptElement.id = COOKIEBOT_SCRIPT_ID;
	scriptElement.src = COOKIEBOT_UC_URL;
	scriptElement.type = "text/javascript";
	scriptElement.async = true;
	scriptElement.setAttribute("data-cbid", cookiebotId);
	scriptElement.setAttribute("data-blockingmode", blockingMode);
	document.head.appendChild(scriptElement);
}

/**
 * Returns runtime configuration object if available.
 */
function getJoinRuntimeConfig() {
	const config = window.JOIN_APP_CONFIG;
	if (!config || typeof config !== "object") {
		return {};
	}
	return config;
}

/**
 * Cookiebot blocking mode defaults to "auto".
 */
function getCookiebotBlockingMode(config) {
	const mode =
		typeof config.COOKIEBOT_BLOCKING_MODE === "string"
			? config.COOKIEBOT_BLOCKING_MODE.trim()
			: "";
	return mode || "auto";
}
