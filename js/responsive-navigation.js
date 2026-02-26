"use strict";

const UI_BREAKPOINT_VARIABLES = Object.freeze({
	mobileMax: "--ui-bp-mobile-max",
	navigationTabletMax: "--ui-bp-navigation-tablet-max",
	phoneMax: "--ui-bp-phone-max",
	contentNarrowMax: "--ui-bp-content-narrow-max",
	boardColumnsMax: "--ui-bp-board-columns-max",
});

const UI_BREAKPOINT_FALLBACKS = Object.freeze({
	mobileMax: 801,
	navigationTabletMax: 950,
	phoneMax: 560,
	contentNarrowMax: 500,
	boardColumnsMax: 1400,
});

/**
 * Initializes responsive navigation state and breakpoint listener.
 *
 * @returns {void}
 */
function initializeResponsiveNavigation() {
	setIsMobileViewportState(isUiBreakpointAtMost("mobileMax"));
	runFunctionsOnBreakpoint();
	addResizeEventListener();
}

/**
 * Registers resize listener that rerenders navigation only when breakpoint state changes.
 *
 * @returns {void}
 */
function addResizeEventListener() {
	window.addEventListener("resize", () => {
		const nextIsMobileViewport = isUiBreakpointAtMost("mobileMax");
		if (nextIsMobileViewport !== getIsMobileViewportState()) {
			setIsMobileViewportState(nextIsMobileViewport);
			runFunctionsOnBreakpoint();
		}
	});
}

/**
 * Runs specific functions based on the current breakpoint.
 */
function runFunctionsOnBreakpoint() {
	if (getIsMobileViewportState()) {
		renderMobileNavigation();
		setActiveNavButton();
	} else {
		renderStandardNavigation();
	}
}

/**
 * Renders the navigation for mobile devices by clearing the contents of the
 * navigation containers and populating them with the navigation HTML.
 *
 * @return {void} This function does not return a value.
 */
function renderMobileNavigation() {
	let container = document.getElementById("navigation-container");
	let mobileContainer = document.getElementById("navigation-container-mobile");
	container.innerHTML = "";
	mobileContainer.innerHTML = renderNavigationHTML();
}

/**
 * Renders the navigation for standard devices by populating the navigation container and mobile container with appropriate content.
 *
 * @return {void} This function does not return a value.
 */
function renderStandardNavigation() {
	let container = document.getElementById("navigation-container");
	let mobileContainer = document.getElementById("navigation-container-mobile");
	container.innerHTML = renderNavigationHTML();
	mobileContainer.innerHTML = "";
}

/**
 * Reads a CSS breakpoint token and returns its pixel value.
 *
 * @param {string} cssVariableName - CSS custom property name, e.g. "--ui-bp-mobile-max".
 * @param {number} fallbackPx - Fallback breakpoint value in px.
 * @returns {number} Parsed breakpoint in px.
 */
function getResponsiveBreakpointPx(cssVariableName, fallbackPx) {
	const rootStyles = getComputedStyle(document.documentElement);
	const rawValue = rootStyles.getPropertyValue(cssVariableName).trim();
	const parsedValue = Number.parseFloat(rawValue);
	if (!Number.isFinite(parsedValue)) {
		return fallbackPx;
	}
	return parsedValue;
}

/**
 * Checks if current viewport width is at or below a breakpoint token.
 *
 * @param {string} cssVariableName - CSS custom property name with px value.
 * @param {number} fallbackPx - Fallback breakpoint value in px.
 * @returns {boolean} True if viewport width <= breakpoint.
 */
function isViewportAtMost(cssVariableName, fallbackPx) {
	return window.innerWidth <= getResponsiveBreakpointPx(cssVariableName, fallbackPx);
}

/**
 * Resolves a breakpoint value by key from the shared UI breakpoint registry.
 *
 * @param {keyof UI_BREAKPOINT_VARIABLES} breakpointKey - Named breakpoint key.
 * @returns {number} Breakpoint value in pixels.
 */
function getUiBreakpointValue(breakpointKey) {
	const cssVariableName = UI_BREAKPOINT_VARIABLES[breakpointKey];
	const fallbackPx = UI_BREAKPOINT_FALLBACKS[breakpointKey];
	if (!cssVariableName || !Number.isFinite(fallbackPx)) {
		console.warn(`Unknown UI breakpoint key: ${String(breakpointKey)}`);
		return 0;
	}

	return getResponsiveBreakpointPx(cssVariableName, fallbackPx);
}

/**
 * Checks viewport width against a shared UI breakpoint key.
 *
 * @param {keyof UI_BREAKPOINT_VARIABLES} breakpointKey - Named breakpoint key.
 * @returns {boolean} True if viewport width is at/below the breakpoint.
 */
function isUiBreakpointAtMost(breakpointKey) {
	return window.innerWidth <= getUiBreakpointValue(breakpointKey);
}

/**
 * Stores current responsive navigation state on window to avoid lexical global collisions
 * across mixed cache/deploy states.
 *
 * @param {boolean} value - Current mobile breakpoint state.
 * @returns {void}
 */
function setIsMobileViewportState(value) {
	window.__joinIsMobileViewport = value === true;
}

/**
 * Returns current responsive navigation state from window storage.
 *
 * @returns {boolean} True if currently in mobile breakpoint mode.
 */
function getIsMobileViewportState() {
	return window.__joinIsMobileViewport === true;
}
