"use strict";

const PAGE_INIT_RETRY_DELAY_MS = 16;
const PAGE_INIT_MAX_RETRIES = 20;

bootstrapRuntime();

/**
 * Bootstraps runtime fallbacks, consent integration, delegated actions,
 * and page-level initialization in a defer-safe order.
 *
 * @returns {void}
 */
function bootstrapRuntime() {
	initializeLegacyRuntimeFallbacks();
	initializeCookiebot();
	initializeUiEventDelegation();
	initializePageOnDomReady();
}

/**
 * Executes the page-specific initializer declared via `data-init` on the body.
 * Waits for DOM readiness when required.
 *
 * @returns {void}
 */
function initializePageOnDomReady() {
	const runPageInit = () => {
		const initFunctionName = document.body?.dataset?.init;
		if (!initFunctionName) {
			return;
		}
		runNamedPageInitializer(initFunctionName);
	};

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", runPageInit, { once: true });
		return;
	}

	runPageInit();
}

/**
 * Executes the page initializer by name and retries briefly when a handler is
 * still pending, which can happen in mixed cached asset states.
 *
 * @param {string} initFunctionName - Global page-init handler name.
 * @param {number} [retryCount=0] - Current retry counter.
 * @returns {void}
 */
function runNamedPageInitializer(initFunctionName, retryCount = 0) {
	if (typeof window[initFunctionName] === "function") {
		if (typeof executeNamedFunction === "function") {
			executeNamedFunction(initFunctionName);
		} else {
			window[initFunctionName]();
		}
		return;
	}

	if (retryCount >= PAGE_INIT_MAX_RETRIES) {
		console.warn(`Page init handler not found: ${initFunctionName}`);
		return;
	}

	window.setTimeout(() => {
		runNamedPageInitializer(initFunctionName, retryCount + 1);
	}, PAGE_INIT_RETRY_DELAY_MS);
}


/**
 * Legacy initializer retained for older call sites.
 */
async function init() {
	includeHTML();
	mobileGreeting();
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
	initializeResponsiveNavigation();
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
 * Builds initials from a full name for avatar/header rendering.
 *
 * @param {string} name - Full name string.
 * @returns {string} Initials (1-2 chars), defaults to "G" for empty input.
 */
function getInitials(name) {
	if (typeof name !== "string" || name.trim() === "") {
		return "G";
	}

	const nameParts = name.trim().split(/\s+/).filter(Boolean);
	if (nameParts.length === 1) {
		return nameParts[0].charAt(0).toUpperCase();
	}

	return (
		nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
	).toUpperCase();
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


/**
 * Restores a remembered user into the current session when available.
 * Redirects to summary when the login page is open.
 *
 * @returns {void}
 */
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
	let smallMenu = getDiv("smallMenu");
	let smallMenuMobile = getDiv("smallMenuMobile");

	if (isUiBreakpointAtMost("mobileMax")) {
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
	const isMobileViewportActive =
		typeof getIsMobileViewportState === "function"
			? getIsMobileViewportState()
			: false;

	// Remove active class from any previously active nav link
	if (activeNavLink) {
		activeNavLink.classList.remove("active");
	}

		navLinks.forEach((link) => {
			if (location.pathname.includes(link)) {
				document.getElementById(link).classList.add("active");
				if (isMobileViewportActive) document.getElementById(link).querySelector("img").src = `./assets/img/icon-${link}-marked.png`;
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
