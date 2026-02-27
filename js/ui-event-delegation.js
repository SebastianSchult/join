"use strict";

const uiEventRegistry = window.UIEventActionRegistry || {};
const UI_CLICK_ACTIONS = uiEventRegistry.click || {};
const UI_DRAGSTART_ACTIONS = uiEventRegistry.dragstart || {};
const UI_DRAGEND_ACTIONS = uiEventRegistry.dragend || {};
const UI_DRAGOVER_ACTIONS = uiEventRegistry.dragover || {};
const UI_DROP_ACTIONS = uiEventRegistry.drop || {};
const UI_SUBMIT_ACTIONS = uiEventRegistry.submit || {};
const UI_KEYUP_ACTIONS = uiEventRegistry.keyup || {};
const UI_MOUSEOVER_ACTIONS = uiEventRegistry.mouseover || {};
const UI_MOUSEOUT_ACTIONS = uiEventRegistry.mouseout || {};
const UI_DBLCLICK_ACTIONS = uiEventRegistry.dblclick || {};

/**
 * Registers delegated listeners for all supported UI event types.
 *
 * Side effects:
 * - Attaches document-level listeners and routes interactions via data-* contracts.
 *
 * @returns {void}
 */
function initializeUiEventDelegation() {
  document.addEventListener("click", handleDelegatedClick);
  document.addEventListener("submit", handleDelegatedSubmit);
  document.addEventListener("keyup", handleDelegatedKeyup);
  document.addEventListener("dblclick", handleDelegatedDblclick);
  document.addEventListener("mouseover", handleDelegatedMouseover);
  document.addEventListener("mouseout", handleDelegatedMouseout);
  document.addEventListener("dragstart", handleDelegatedDragstart);
  document.addEventListener("dragend", handleDelegatedDragend);
  document.addEventListener("dragover", handleDelegatedDragover);
  document.addEventListener("drop", handleDelegatedDrop);
}

/**
 * Handles delegated click actions and optional default/prevent propagation behavior.
 *
 * @param {MouseEvent} event - Click event bubbled to document level.
 * @returns {void}
 */
function handleDelegatedClick(event) {
  const stopPropagationElement = event.target.closest(
    '[data-stop-propagation="true"]'
  );
  if (stopPropagationElement) {
    event.stopPropagation();
  }

  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) {
    return;
  }

  const actionHandler = UI_CLICK_ACTIONS[actionElement.dataset.action];
  if (!actionHandler) {
    return;
  }

  if (shouldPreventDefault(actionElement)) {
    event.preventDefault();
  }

  actionHandler(actionElement, event);
}

/**
 * Handles delegated submit actions mapped via `data-submit-action`.
 *
 * @param {SubmitEvent} event - Submit event bubbled from form elements.
 * @returns {void}
 */
function handleDelegatedSubmit(event) {
  const formElement = event.target.closest("form[data-submit-action]");
  if (!formElement) {
    return;
  }

  event.preventDefault();
  const submitHandler = UI_SUBMIT_ACTIONS[formElement.dataset.submitAction];
  if (!submitHandler) {
    return;
  }

  submitHandler(formElement, event);
}

/**
 * Handles delegated keyup actions mapped via `data-keyup-action`.
 *
 * @param {KeyboardEvent} event - Keyup event bubbled to document.
 * @returns {void}
 */
function handleDelegatedKeyup(event) {
  const keyupElement = event.target.closest("[data-keyup-action]");
  if (!keyupElement) {
    return;
  }

  const keyupHandler = UI_KEYUP_ACTIONS[keyupElement.dataset.keyupAction];
  if (!keyupHandler) {
    return;
  }

  keyupHandler(keyupElement, event);
}

/**
 * Handles delegated double-click actions mapped via `data-dblclick-action`.
 *
 * @param {MouseEvent} event - Dblclick event bubbled to document.
 * @returns {void}
 */
function handleDelegatedDblclick(event) {
  const dblclickElement = event.target.closest("[data-dblclick-action]");
  if (!dblclickElement) {
    return;
  }

  const dblclickHandler = UI_DBLCLICK_ACTIONS[dblclickElement.dataset.dblclickAction];
  if (!dblclickHandler) {
    return;
  }

  dblclickHandler(dblclickElement, event);
}

/**
 * Handles delegated mouseover actions and ignores transitions within the same element.
 *
 * @param {MouseEvent} event - Mouseover event bubbled to document.
 * @returns {void}
 */
function handleDelegatedMouseover(event) {
  const hoverElement = event.target.closest("[data-hover-action]");
  if (!hoverElement || hoverElement.contains(event.relatedTarget)) {
    return;
  }

  const hoverHandler = UI_MOUSEOVER_ACTIONS[hoverElement.dataset.hoverAction];
  if (!hoverHandler) {
    return;
  }

  hoverHandler(hoverElement, event);
}

/**
 * Handles delegated mouseout actions and ignores transitions within the same element.
 *
 * @param {MouseEvent} event - Mouseout event bubbled to document.
 * @returns {void}
 */
function handleDelegatedMouseout(event) {
  const leaveElement = event.target.closest("[data-leave-action]");
  if (!leaveElement || leaveElement.contains(event.relatedTarget)) {
    return;
  }

  const leaveHandler = UI_MOUSEOUT_ACTIONS[leaveElement.dataset.leaveAction];
  if (!leaveHandler) {
    return;
  }

  leaveHandler(leaveElement, event);
}

/**
 * Handles delegated dragstart actions mapped via `data-dragstart-action`.
 *
 * @param {DragEvent} event - Dragstart event bubbled to document.
 * @returns {void}
 */
function handleDelegatedDragstart(event) {
  const dragstartElement = event.target.closest("[data-dragstart-action]");
  if (!dragstartElement) {
    return;
  }

  const dragstartHandler = UI_DRAGSTART_ACTIONS[dragstartElement.dataset.dragstartAction];
  if (!dragstartHandler) {
    return;
  }

  dragstartHandler(dragstartElement, event);
}

/**
 * Handles delegated dragend actions mapped via `data-dragend-action`.
 *
 * @param {DragEvent} event - Dragend event bubbled to document.
 * @returns {void}
 */
function handleDelegatedDragend(event) {
  const dragendElement = event.target.closest("[data-dragend-action]");
  if (!dragendElement) {
    return;
  }

  const dragendHandler = UI_DRAGEND_ACTIONS[dragendElement.dataset.dragendAction];
  if (!dragendHandler) {
    return;
  }

  dragendHandler(dragendElement, event);
}

/**
 * Handles delegated dragover actions mapped via `data-dragover-action`.
 *
 * @param {DragEvent} event - Dragover event bubbled to document.
 * @returns {void}
 */
function handleDelegatedDragover(event) {
  const dragoverElement = event.target.closest("[data-dragover-action]");
  if (!dragoverElement) {
    return;
  }

  const dragoverHandler = UI_DRAGOVER_ACTIONS[dragoverElement.dataset.dragoverAction];
  if (!dragoverHandler) {
    return;
  }

  dragoverHandler(dragoverElement, event);
}

/**
 * Handles delegated drop actions mapped via `data-drop-action`.
 *
 * @param {DragEvent} event - Drop event bubbled to document.
 * @returns {void}
 */
function handleDelegatedDrop(event) {
  const dropElement = event.target.closest("[data-drop-action]");
  if (!dropElement) {
    return;
  }

  const dropHandler = UI_DROP_ACTIONS[dropElement.dataset.dropAction];
  if (!dropHandler) {
    return;
  }

  dropHandler(dropElement, event);
}

/**
 * Determines whether default browser behavior should be prevented for a delegated action target.
 *
 * @param {Element} element - Action element resolved from event target.
 * @returns {boolean} `true` when default behavior should be prevented.
 */
function shouldPreventDefault(element) {
  if (element.dataset.preventDefault === "true") {
    return true;
  }

  if (element.tagName === "A") {
    const href = element.getAttribute("href");
    return href === "#";
  }

  return false;
}

/**
 * Resolves a function by name from `window` and executes it with provided arguments.
 *
 * Side effects:
 * - Executes globally registered handlers.
 * - Logs a warning when a handler is missing.
 *
 * @param {string} functionName - Global function name to execute.
 * @param {Array<*>} [args=[]] - Positional arguments forwarded to the handler.
 * @returns {void}
 */
function executeNamedFunction(functionName, args = []) {
  const callback = window[functionName];
  if (typeof callback !== "function") {
    console.warn(`UI action handler not found: ${functionName}`);
    return;
  }
  callback(...args);
}
