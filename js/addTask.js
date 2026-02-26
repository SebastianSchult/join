"use strict";

async function addTaskInit() {
    includeHTML();
    await getContactsFromRemoteStorage();
    getContactsOutOfUsers();
    await loadTasksFromRemoteStorage();
    renderAddTaskHTML();
    checkValidity();
}

function callAddTaskModuleMethod(moduleName, methodName, args = [], fallbackValue) {
    const moduleRef = window[moduleName];
    if (!moduleRef || typeof moduleRef[methodName] !== "function") {
        return fallbackValue;
    }
    return moduleRef[methodName](...args);
}

function callAddTaskUi(methodName, args = [], fallbackValue) {
    return callAddTaskModuleMethod("AddTaskUi", methodName, args, fallbackValue);
}

function callAddTaskDropdown(methodName, args = [], fallbackValue) {
    return callAddTaskModuleMethod("AddTaskDropdown", methodName, args, fallbackValue);
}

function callAddTaskKeyboard(methodName, args = [], fallbackValue) {
    return callAddTaskModuleMethod("AddTaskKeyboard", methodName, args, fallbackValue);
}

function callAddTaskFormDomain(methodName, args = [], fallbackValue) {
    return callAddTaskModuleMethod("AddTaskFormDomain", methodName, args, fallbackValue);
}

function renderAddTaskHTML() {
    const container = document.getElementById("addTaskBody");
    if (!container) {
        return;
    }

    container.innerHTML = renderAddTaskMainContentHTML();
    const footerContainer = document.getElementById("addTaskBodyRight");
    if (!footerContainer) {
        return;
    }
    footerContainer.innerHTML = renderAddTaskFooterHTML();

    registerAddTaskKeyboardAccessibility();
    initializeDropdownAccessibilityState();
    setTodayDateAsMin();
    setPriority("medium");
    renderContactsToDropdown();
    renderSubtasks();

    if (typeof initializeFilepickerUI === "function") {
        initializeFilepickerUI();
    }
}

function setPriority(priority) {
    return callAddTaskUi("setPriority", [priority], undefined);
}

function setPriorityAppearance(priority) {
    return callAddTaskUi("setPriorityAppearance", [priority], undefined);
}

function renderSubtaskInputField() {
    return callAddTaskUi("renderSubtaskInputField", [], undefined);
}

function subtaskAddOrCancel(option) {
    return callAddTaskUi("subtaskAddOrCancel", [option], undefined);
}

function renderSubtasks() {
    return callAddTaskUi("renderSubtasks", [], undefined);
}

function checkIfAnySubtaskIsInEditingMode() {
    return callAddTaskUi("checkIfAnySubtaskIsInEditingMode", [], false);
}

function getButtonColor(priority) {
    return callAddTaskUi("getButtonColor", [priority], "white");
}

function renderArrow(arrowContainer, contentContainer) {
    registerAddTaskKeyboardAccessibility();
    return callAddTaskDropdown(
        "renderArrow",
        [arrowContainer, contentContainer],
        undefined
    );
}

function openDropdown(arrowContainerId, contentContainerId) {
    return callAddTaskDropdown(
        "openDropdown",
        [arrowContainerId, contentContainerId],
        undefined
    );
}

function closeDropdown(contentContainerId, options = {}) {
    return callAddTaskDropdown("closeDropdown", [contentContainerId, options], false);
}

function closeOpenDropdowns(options = {}) {
    return callAddTaskDropdown("closeOpenDropdowns", [options], false);
}

function initializeDropdownAccessibilityState() {
    return callAddTaskDropdown("initializeDropdownAccessibilityState", [], undefined);
}

function registerAddTaskKeyboardAccessibility() {
    return callAddTaskKeyboard("registerAddTaskKeyboardAccessibility", [], undefined);
}

function handleAddTaskKeyboardAccessibility(event) {
    return callAddTaskKeyboard("handleAddTaskKeyboardAccessibility", [event], undefined);
}

function focusFirstDropdownControl(dropdownContainer) {
    return callAddTaskDropdown("focusFirstDropdownControl", [dropdownContainer], undefined);
}

function setCloseDropdownContainer() {
    return callAddTaskDropdown("setCloseDropdownContainer", [], undefined);
}

function getContainerToSetDropdownCloseAction() {
    return callAddTaskDropdown("getContainerToSetDropdownCloseAction", [], null);
}

function renderContactsToDropdown() {
    return callAddTaskUi("renderContactsToDropdown", [], undefined);
}

function addTaskDueDateOpenCalendear() {
    return callAddTaskUi("addTaskDueDateOpenCalendear", [], undefined);
}

function setDropdownContactAppearance(dropdownContact, dropdownCheckboxImage) {
    return callAddTaskUi(
        "setDropdownContactAppearance",
        [dropdownContact, dropdownCheckboxImage],
        undefined
    );
}

function toggleAssignedContactsContainer() {
    return callAddTaskUi("toggleAssignedContactsContainer", [], undefined);
}

function renderAssignedContactsContainer() {
    return callAddTaskUi("renderAssignedContactsContainer", [], undefined);
}

function chooseCategory(chosenCategory) {
    return callAddTaskUi("chooseCategory", [chosenCategory], undefined);
}

function checkIfCardIsEditing() {
    return callAddTaskUi("checkIfCardIsEditing", [], false);
}

function setTodayDateAsMin() {
    return callAddTaskFormDomain("setTodayDateAsMin", [], undefined);
}

function checkValidity() {
    return callAddTaskFormDomain("checkValidity", [], undefined);
}

function getStateOfRequriredField(requiredInputField) {
    return callAddTaskFormDomain("getStateOfRequriredField", [requiredInputField], false);
}

function setCreateBtnState() {
    return callAddTaskFormDomain("setCreateBtnState", [], undefined);
}

function activateButton(id, actionName) {
    return callAddTaskFormDomain("activateButton", [id, actionName], undefined);
}

function deactivateButton(id) {
    return callAddTaskFormDomain("deactivateButton", [id], undefined);
}
