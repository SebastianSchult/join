"use strict";

let isSmallerThan802 = false;
let isSmallerThan802Old = false;
const COOKIEBOT_SCRIPT_ID = "Cookiebot";
const COOKIEBOT_UC_URL = "https://consent.cookiebot.com/uc.js";
const COOKIEBOT_CONFIG_RETRY_DELAY_MS = 100;
const COOKIEBOT_CONFIG_MAX_RETRIES = 30;

initializeLegacyRuntimeFallbacks();
initializeCookiebot();


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


/**
 * the init-function in body onload
 */
async function init() {
	includeHTML();
	mobileGreeting();
}


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


/**
 * Includes HTML-Files into container containing "w3-include-html"-attribute
 */
async function includeHTML() {
	let includeElements = document.querySelectorAll("[w3-include-html]");
	for (let i = 0; i < includeElements.length; i++) {
		const element = includeElements[i];
		const file = element.getAttribute("w3-include-html");
		let resp = await fetch(file);
		if (resp.ok) {
			element.innerHTML = await resp.text();
		} else {
			element.innerHTML = "Page not found";
		}
	}
	showInitials();
	setIsSmallerThan802()
	addResizeEventListener();
	runFunctionsOnBreakpoint();
}


/**
 * Adds an event listener to the window's resize event. When the window is resized,
 * it checks if the window's inner width is less than or equal to 802. If it is,
 * it sets the isSmallerThan802 variable to true. Otherwise, it sets it to false.
 * If the value of isSmallerThan802 has changed since the last resize event,
 * it updates isSmallerThan802Old with the new value and calls the runFunctionsOnBreakpoint function.
 *
 * @return {void} This function does not return anything.
 */
function addResizeEventListener(){
	window.addEventListener('resize', () => {
		setIsSmallerThan802();
		if (isSmallerThan802 !== isSmallerThan802Old){
			isSmallerThan802Old = isSmallerThan802;
			runFunctionsOnBreakpoint();
		}
	});
}


/**
 * Runs specific functions based on the current breakpoint.
 */
function runFunctionsOnBreakpoint() {
	if(isSmallerThan802){
		renderMobileNavigation()
		setActiveNavButton();
	}
	else{
		renderStandardNavigation();
	}
}


/**
 * Renders the navigation for mobile devices by clearing the contents of the
 * navigation containers and populating them with the navigation HTML.
 *
 * @return {void} This function does not return a value.
 */
function renderMobileNavigation(){
	let container = document.getElementById('navigation-container');
	let mobileContainer = document.getElementById('navigation-container-mobile');
	container.innerHTML = "";
	mobileContainer.innerHTML = renderNavigationHTML();
}


/**
 * Renders the navigation for standard devices by populating the navigation container and mobile container with appropriate content.
 *
 * @return {void} This function does not return a value.
 */
function renderStandardNavigation(){
	let container = document.getElementById('navigation-container');
	let mobileContainer = document.getElementById('navigation-container-mobile');
	container.innerHTML = renderNavigationHTML();
	mobileContainer.innerHTML = "";

}


/**
 * Sets the value of the isSmallerThan802 variable based on the window's inner width.
 *
 * @return {void} This function does not return anything.
 */
function setIsSmallerThan802(){
	if (window.innerWidth <= 801) {
		isSmallerThan802 = true;
	} else {
		isSmallerThan802 = false;
	}
}


/**
 *
 * @param {string} id id eines divs
 * @returns div with given id
 */
function getDiv(id) {
	let content = document.getElementById(id);
	return content;
}


/**
 * rendering the board-page,
 * calling renderCategories to render all available tasks to each category
 */
function renderBoard() {
	let content = getDiv("main");
	content.innerHTML = renderBoardHTML();
	renderCategories();
}


/**
 * Opens the help page by switching to the 'help.html' page.
 */
function openHelp() {
	switchPage('help.html');
}


function checkIfUserIsRemembered() {
	if (!sessionStorage.getItem('currentUser')) {
		if (localStorage.getItem('rememberedUser') != null) {
			sessionStorage.setItem('currentUser', localStorage.getItem('rememberedUser'));
			if (window.location.href == 'index.html') switchPage('summary.html');
		}
	}
}


/**
 * Logs out the current user by removing the 'currentUser' item from the local storage and redirecting to the login page.
 */
function logout() {
	localStorage.removeItem('rememberedUser');
	sessionStorage.removeItem('currentUser');
	switchPage('index.html');
}


/**
 * Displays the initials of the current user in the 'userInitials' element. If no user is logged in, displays 'G' for guest instead.
 */
function showInitials() {
	checkIfUserIsRemembered();
	try {
		let userAsString = sessionStorage.getItem('currentUser');
		let userInitialsElement = document.getElementById('userInitials');

		if (userInitialsElement) {
			if (userAsString) {
				let userName = JSON.parse(userAsString).username;
				let userInitials = getInitials(userName);
				userInitialsElement.innerHTML = userInitials;
			} else {
				userInitialsElement.innerHTML = 'G';
			}
		}
	} catch (error) {
		console.error('Error while retrieving user data from localStorage:', error);
		// Handle the error accordingly, such as setting a default value or displaying an error message.
		let userInitialsElement = document.getElementById('userInitials');
		if (userInitialsElement) {
			userInitialsElement.innerHTML = 'G';
		}
	}
}


/**
 * Function to handle opening the small menu based on screen width.
 */
function openSmallMenu() {
	let screenWidth = window.innerWidth;
	let smallMenu = getDiv("smallMenu");
	let smallMenuMobile = getDiv("smallMenuMobile");

	if (screenWidth <= 801) {
		smallMenu.classList.remove("d-none");
		smallMenuMobile.classList.toggle("d-none");
	} else {
		smallMenuMobile.classList.add("d-none");
		smallMenu.classList.toggle("d-none");
	}
}


/**
 * Updates the window location pathname to the new URL.
 *
 * @param {string} newUrl - The new URL to navigate to
 */
function switchPage(newUrl) {
	window.location.href = newUrl;
}


/**
 * Opens a new tab with the specified URL.
 *
 * @param {string} newUrl - The URL to open in the new tab
 */
function switchPageNewTab(newUrl) {
	window.open(newUrl, '_blank');
}


/**	
 * Sets the active navigation button based on the current location pathname.
 */
function setActiveNavButton() {
	const navLinks = ["summary", "addTask", "board", "contacts"];
	const activeNavLink = document.querySelector(".nav-btn.active");

	// Remove active class from any previously active nav link
	if (activeNavLink) {
		activeNavLink.classList.remove("active");
	}

	navLinks.forEach((link) => {
		if (location.pathname.includes(link)) {
			document.getElementById(link).classList.add("active");
			if (isSmallerThan802) document.getElementById(link).querySelector("img").src = `./assets/img/icon-${link}-marked.png`;
			else document.getElementById(link).querySelector("img").src = `./assets/img/icon-${link}.png`;
		}
	});
}


/**
 * Closes the current window if the previous URL includes 'index', otherwise navigates back to the previous page.
 */
function goBack() {
	const previousURL = document.referrer;
	if (previousURL.includes('index') || previousURL.includes('signUp')) {
		window.close()
	}else{
		window.history.go(-1);
	}
}
