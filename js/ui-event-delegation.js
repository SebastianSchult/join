"use strict";

const UI_CLICK_ACTIONS = {
	"add-contact-card": () => executeNamedFunction("addContactCard"),
	"add-new-user": () => executeNamedFunction("addNewUser"),
	"assign-contact-to-task": (element) =>
		executeNamedFunction("assignContactToTask", [
			toSafeInteger(element.dataset.contactId),
		]),
	"choose-category": (element) =>
		executeNamedFunction("chooseCategory", [element.dataset.category || ""]),
	"clear-formular": () => executeNamedFunction("clearFormular"),
	"close-card": () => executeNamedFunction("closeCard"),
	"create-task": () => executeNamedFunction("createTask"),
	"close-edit-delete": () => executeNamedFunction("closeEditDelete"),
	"close-overlay": (element) =>
		executeNamedFunction("closeOverlay", [element.dataset.overlayId || ""]),
	"delete-subtask": (element) =>
		executeNamedFunction("deleteSubtask", [toSafeInteger(element.dataset.subtaskId)]),
	"edit-contact": (element) =>
		executeNamedFunction("editContact", [toSafeInteger(element.dataset.contactId)]),
	"edit-subtask": (element) =>
		executeNamedFunction("editSubtask", [toSafeInteger(element.dataset.subtaskId)]),
	"go-back": () => executeNamedFunction("goBack"),
	"goto-signup": () => executeNamedFunction("gotoSignUp"),
	"hide-add-task-container": () => executeNamedFunction("hideAddTaskContainer"),
	"login-guest": () => executeNamedFunction("loginAsGuest"),
	"logout": () => executeNamedFunction("logout"),
	"open-add-task-container": (element) =>
		executeNamedFunction("showAddTaskContainer", [
			element.dataset.category || "category-0",
		]),
	"open-card": (element) =>
		executeNamedFunction("openCard", [toSafeInteger(element.dataset.taskId)]),
	"open-card-delete": (element) =>
		executeNamedFunction("openCardDelete", [toSafeInteger(element.dataset.taskId)]),
	"open-card-edit": (element) =>
		executeNamedFunction("openCardEdit", [toSafeInteger(element.dataset.taskId)]),
	"open-due-date-picker": () => executeNamedFunction("addTaskDueDateOpenCalendear"),
	"open-edit-delete": () => executeNamedFunction("openEditDelete"),
	"open-help": () => executeNamedFunction("openHelp"),
	"open-new-tab": (element) =>
		executeNamedFunction("switchPageNewTab", [element.dataset.url || ""]),
	"open-small-menu": () => executeNamedFunction("openSmallMenu"),
	"open-filepicker": () => executeNamedFunction("openFilepicker"),
	"open-contact-details": (element) =>
		executeNamedFunction("openContactDetails", [
			toSafeInteger(element.dataset.contactId),
		]),
	"redirect-to-login": () => executeNamedFunction("redirectToLogin"),
	"remove-contact": (element) =>
		executeNamedFunction("removeContact", [toSafeInteger(element.dataset.contactId)]),
	"render-subtask-input-field": () =>
		executeNamedFunction("renderSubtaskInputField"),
	"save-edit-subtask": (element) =>
		executeNamedFunction("saveEditSubtask", [toSafeInteger(element.dataset.subtaskId)]),
	"save-edited-task": (element) =>
		executeNamedFunction("saveEditedTask", [toSafeInteger(element.dataset.taskId)]),
	"search-task": () => executeNamedFunction("searchTask"),
	"set-priority": (element) =>
		executeNamedFunction("setPriority", [String(element.dataset.priority || "")]),
	"subtask-add-or-cancel": (element) =>
		executeNamedFunction("subtaskAddOrCancel", [element.dataset.option || ""]),
	"switch-page": (element) =>
		executeNamedFunction("switchPage", [element.dataset.url || ""]),
	"toggle-addtask-dropdown": (element) =>
		executeNamedFunction("renderArrow", [
			element.dataset.arrowContainer || "",
			element.dataset.contentContainer || "",
		]),
	"toggle-privacy-policy-checkbox": () =>
		executeNamedFunction("togglePrivacyPolicyCheckbox"),
	"toggle-remember-me": () => executeNamedFunction("toggleRememberMeCheckbox"),
};

const UI_DRAGSTART_ACTIONS = {
	"start-dragging": (element) =>
		executeNamedFunction("startDragging", [toSafeInteger(element.dataset.taskId)]),
};

const UI_DRAGEND_ACTIONS = {
	"stop-dragging": () => executeNamedFunction("stopDragging"),
};

const UI_DRAGOVER_ACTIONS = {
	"allow-drop": (_, event) => executeNamedFunction("allowDrop", [event]),
};

const UI_DROP_ACTIONS = {
	"move-to": (element) =>
		executeNamedFunction("moveTo", [element.dataset.category || ""]),
};

const UI_SUBMIT_ACTIONS = {
	"add-new-user": () => executeNamedFunction("addNewUser"),
	"login-user": () => executeNamedFunction("loginUser"),
	"save-contact": () => executeNamedFunction("saveContact"),
	"save-edited-contact": (formElement) =>
		executeNamedFunction("saveEditedContact", [
			toSafeInteger(formElement.dataset.contactId),
		]),
};

const UI_KEYUP_ACTIONS = {
	"search-task": () => executeNamedFunction("searchTask"),
};

const UI_MOUSEOVER_ACTIONS = {
	"change-cancel-icon": () => executeNamedFunction("changeCancelIcon"),
};

const UI_MOUSEOUT_ACTIONS = {
	"restore-cancel-icon": () => executeNamedFunction("restoreCancelIcon"),
};

const UI_DBLCLICK_ACTIONS = {
	"edit-subtask": (element) =>
		executeNamedFunction("editSubtask", [toSafeInteger(element.dataset.subtaskId)]),
};

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

	const dblclickHandler =
		UI_DBLCLICK_ACTIONS[dblclickElement.dataset.dblclickAction];
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

	const dragstartHandler =
		UI_DRAGSTART_ACTIONS[dragstartElement.dataset.dragstartAction];
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

	const dragoverHandler =
		UI_DRAGOVER_ACTIONS[dragoverElement.dataset.dragoverAction];
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
