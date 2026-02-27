"use strict";

window.UIEventActionRegistry = window.UIEventActionRegistry || {
  click: {
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
      executeNamedFunction("deleteSubtask", [
        toSafeInteger(element.dataset.subtaskId),
      ]),
    "edit-contact": (element) =>
      executeNamedFunction("editContact", [
        toSafeInteger(element.dataset.contactId),
      ]),
    "edit-subtask": (element) =>
      executeNamedFunction("editSubtask", [
        toSafeInteger(element.dataset.subtaskId),
      ]),
    "go-back": () => executeNamedFunction("goBack"),
    "goto-signup": () => executeNamedFunction("gotoSignUp"),
    "hide-add-task-container": () => executeNamedFunction("hideAddTaskContainer"),
    "login-guest": () => executeNamedFunction("loginAsGuest"),
    logout: () => executeNamedFunction("logout"),
    "open-add-task-container": (element) =>
      executeNamedFunction("showAddTaskContainer", [
        element.dataset.category || "category-0",
      ]),
    "open-card": (element) =>
      executeNamedFunction("openCard", [toSafeInteger(element.dataset.taskId)]),
    "open-card-delete": (element) =>
      executeNamedFunction("openCardDelete", [
        toSafeInteger(element.dataset.taskId),
      ]),
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
      executeNamedFunction("removeContact", [
        toSafeInteger(element.dataset.contactId),
      ]),
    "render-subtask-input-field": () =>
      executeNamedFunction("renderSubtaskInputField"),
    "save-edit-subtask": (element) =>
      executeNamedFunction("saveEditSubtask", [
        toSafeInteger(element.dataset.subtaskId),
      ]),
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
  },
  dragstart: {
    "start-dragging": (element) =>
      executeNamedFunction("startDragging", [toSafeInteger(element.dataset.taskId)]),
  },
  dragend: {
    "stop-dragging": () => executeNamedFunction("stopDragging"),
  },
  dragover: {
    "allow-drop": (_, event) => executeNamedFunction("allowDrop", [event]),
  },
  drop: {
    "move-to": (element) => executeNamedFunction("moveTo", [element.dataset.category || ""]),
  },
  submit: {
    "add-new-user": () => executeNamedFunction("addNewUser"),
    "login-user": () => executeNamedFunction("loginUser"),
    "save-contact": () => executeNamedFunction("saveContact"),
    "save-edited-contact": (formElement) =>
      executeNamedFunction("saveEditedContact", [
        toSafeInteger(formElement.dataset.contactId),
      ]),
  },
  keyup: {
    "search-task": () => executeNamedFunction("searchTask"),
  },
  mouseover: {
    "change-cancel-icon": () => executeNamedFunction("changeCancelIcon"),
  },
  mouseout: {
    "restore-cancel-icon": () => executeNamedFunction("restoreCancelIcon"),
  },
  dblclick: {
    "edit-subtask": (element) =>
      executeNamedFunction("editSubtask", [toSafeInteger(element.dataset.subtaskId)]),
  },
};
