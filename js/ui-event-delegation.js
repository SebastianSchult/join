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

function executeNamedFunction(functionName, args = []) {
  const callback = window[functionName];
  if (typeof callback !== "function") {
    console.warn(`UI action handler not found: ${functionName}`);
    return;
  }
  callback(...args);
}
