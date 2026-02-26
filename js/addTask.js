"use strict";
/**
 * Initializes add-task page dependencies and renders the form.
 *
 * @returns {Promise<void>}
 */
async function addTaskInit() {
    includeHTML();
    await getContactsFromRemoteStorage();
    getContactsOutOfUsers();
    await loadTasksFromRemoteStorage();
    renderAddTaskHTML();
    checkValidity();
}
/**
 * Calls a method on a namespaced add-task helper module when available.
 *
 * @param {string} moduleName - Global module namespace key on window.
 * @param {string} methodName - Method name to call on the module.
 * @param {Array<any>} [args=[]] - Arguments passed to the method.
 * @param {any} fallbackValue - Value returned when module/method is missing.
 * @returns {any}
 */
function callAddTaskModuleMethod(moduleName, methodName, args = [], fallbackValue) {
    const moduleRef = window[moduleName];
    if (!moduleRef || typeof moduleRef[methodName] !== "function") {
        return fallbackValue;
    }
    return moduleRef[methodName](...args);
}
/**
 * Calls a method on the `AddTaskUi` module.
 *
 * @param {string} methodName - Module method name.
 * @param {Array<any>} [args=[]] - Method arguments.
 * @param {any} fallbackValue - Return value when method is unavailable.
 * @returns {any}
 */
function callAddTaskUi(methodName, args = [], fallbackValue) {
    return callAddTaskModuleMethod("AddTaskUi", methodName, args, fallbackValue);
}
/**
 * Calls a method on the `AddTaskDropdown` module.
 *
 * @param {string} methodName - Module method name.
 * @param {Array<any>} [args=[]] - Method arguments.
 * @param {any} fallbackValue - Return value when method is unavailable.
 * @returns {any}
 */
function callAddTaskDropdown(methodName, args = [], fallbackValue) {
    return callAddTaskModuleMethod("AddTaskDropdown", methodName, args, fallbackValue);
}
/**
 * Calls a method on the `AddTaskKeyboard` module.
 *
 * @param {string} methodName - Module method name.
 * @param {Array<any>} [args=[]] - Method arguments.
 * @param {any} fallbackValue - Return value when method is unavailable.
 * @returns {any}
 */
function callAddTaskKeyboard(methodName, args = [], fallbackValue) {
    return callAddTaskModuleMethod("AddTaskKeyboard", methodName, args, fallbackValue);
}
/**
 * Calls a method on the `AddTaskFormDomain` module.
 *
 * @param {string} methodName - Module method name.
 * @param {Array<any>} [args=[]] - Method arguments.
 * @param {any} fallbackValue - Return value when method is unavailable.
 * @returns {any}
 */
function callAddTaskFormDomain(methodName, args = [], fallbackValue) {
    return callAddTaskModuleMethod("AddTaskFormDomain", methodName, args, fallbackValue);
}
/**
 * Renders add-task markup and initializes UI controls.
 *
 * @returns {void}
 */
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
/**
 * Sets the active task priority.
 *
 * @param {string} priority - Priority identifier.
 * @returns {void}
 */
function setPriority(priority) {
    return callAddTaskUi("setPriority", [priority], undefined);
}
/**
 * Applies visual styling for a priority button state.
 *
 * @param {string} priority - Priority identifier.
 * @returns {void}
 */
function setPriorityAppearance(priority) {
    return callAddTaskUi("setPriorityAppearance", [priority], undefined);
}
/**
 * Replaces subtask footer with the editable subtask input controls.
 *
 * @returns {void}
 */
function renderSubtaskInputField() {
    return callAddTaskUi("renderSubtaskInputField", [], undefined);
}
/**
 * Handles add/cancel actions inside the subtask input control.
 *
 * @param {string} option - Action option handled by the UI module.
 * @returns {void}
 */
function subtaskAddOrCancel(option) {
    return callAddTaskUi("subtaskAddOrCancel", [option], undefined);
}
/**
 * Renders the current list of subtasks.
 *
 * @returns {void}
 */
function renderSubtasks() {
    return callAddTaskUi("renderSubtasks", [], undefined);
}
/**
 * Checks whether any subtask row is currently in edit mode.
 *
 * @returns {boolean}
 */
function checkIfAnySubtaskIsInEditingMode() {
    return callAddTaskUi("checkIfAnySubtaskIsInEditingMode", [], false);
}
/**
 * Returns text color token for a given priority.
 *
 * @param {string} priority - Priority identifier.
 * @returns {string}
 */
function getButtonColor(priority) {
    return callAddTaskUi("getButtonColor", [priority], "white");
}
/**
 * Renders dropdown arrow state and binds keyboard support.
 *
 * @param {HTMLElement} arrowContainer - Arrow trigger element.
 * @param {HTMLElement} contentContainer - Dropdown panel element.
 * @returns {void}
 */
function renderArrow(arrowContainer, contentContainer) {
    registerAddTaskKeyboardAccessibility();
    return callAddTaskDropdown(
        "renderArrow",
        [arrowContainer, contentContainer],
        undefined
    );
}
/**
 * Opens a dropdown panel by id.
 *
 * @param {string} arrowContainerId - Arrow trigger id.
 * @param {string} contentContainerId - Dropdown panel id.
 * @returns {void}
 */
function openDropdown(arrowContainerId, contentContainerId) {
    return callAddTaskDropdown(
        "openDropdown",
        [arrowContainerId, contentContainerId],
        undefined
    );
}
/**
 * Closes a specific dropdown panel.
 *
 * @param {string} contentContainerId - Dropdown panel id.
 * @param {Object} [options={}] - Close behavior flags.
 * @returns {boolean}
 */
function closeDropdown(contentContainerId, options = {}) {
    return callAddTaskDropdown("closeDropdown", [contentContainerId, options], false);
}
/**
 * Closes all currently opened dropdown panels.
 *
 * @param {Object} [options={}] - Close behavior flags.
 * @returns {boolean}
 */
function closeOpenDropdowns(options = {}) {
    return callAddTaskDropdown("closeOpenDropdowns", [options], false);
}
/**
 * Initializes ARIA state attributes for dropdown controls.
 *
 * @returns {void}
 */
function initializeDropdownAccessibilityState() {
    return callAddTaskDropdown("initializeDropdownAccessibilityState", [], undefined);
}
/**
 * Registers keyboard event handlers for add-task interactions.
 *
 * @returns {void}
 */
function registerAddTaskKeyboardAccessibility() {
    return callAddTaskKeyboard("registerAddTaskKeyboardAccessibility", [], undefined);
}
/**
 * Handles delegated keyboard events for add-task controls.
 *
 * @param {KeyboardEvent} event - Native keyboard event.
 * @returns {void}
 */
function handleAddTaskKeyboardAccessibility(event) {
    return callAddTaskKeyboard("handleAddTaskKeyboardAccessibility", [event], undefined);
}
/**
 * Focuses the first interactive control inside a dropdown.
 *
 * @param {HTMLElement} dropdownContainer - Dropdown element to inspect.
 * @returns {void}
 */
function focusFirstDropdownControl(dropdownContainer) {
    return callAddTaskDropdown("focusFirstDropdownControl", [dropdownContainer], undefined);
}
/**
 * Registers outside-click container for closing dropdowns.
 *
 * @returns {void}
 */
function setCloseDropdownContainer() {
    return callAddTaskDropdown("setCloseDropdownContainer", [], undefined);
}
/**
 * Resolves the container used for dropdown close-on-outside-click behavior.
 *
 * @returns {HTMLElement|null}
 */
function getContainerToSetDropdownCloseAction() {
    return callAddTaskDropdown("getContainerToSetDropdownCloseAction", [], null);
}
/**
 * Renders available contacts inside the assignment dropdown.
 *
 * @returns {void}
 */
function renderContactsToDropdown() {
    return callAddTaskUi("renderContactsToDropdown", [], undefined);
}
/**
 * Opens the native date selector for due date input.
 *
 * @returns {void}
 */
function addTaskDueDateOpenCalendear() {
    return callAddTaskUi("addTaskDueDateOpenCalendear", [], undefined);
}
/**
 * Updates visual state for assigned-contact row and checkbox icon.
 *
 * @param {HTMLElement} dropdownContact - Contact row element.
 * @param {HTMLImageElement} dropdownCheckboxImage - Contact checkbox icon.
 * @returns {void}
 */
function setDropdownContactAppearance(dropdownContact, dropdownCheckboxImage) {
    return callAddTaskUi(
        "setDropdownContactAppearance",
        [dropdownContact, dropdownCheckboxImage],
        undefined
    );
}
/**
 * Toggles visibility of assigned contacts in the add-task form.
 *
 * @returns {void}
 */
function toggleAssignedContactsContainer() {
    return callAddTaskUi("toggleAssignedContactsContainer", [], undefined);
}
/**
 * Renders initials badges for currently assigned contacts.
 *
 * @returns {void}
 */
function renderAssignedContactsContainer() {
    return callAddTaskUi("renderAssignedContactsContainer", [], undefined);
}
/**
 * Applies selected category value to the form state.
 *
 * @param {string} chosenCategory - Category label/value.
 * @returns {void}
 */
function chooseCategory(chosenCategory) {
    return callAddTaskUi("chooseCategory", [chosenCategory], undefined);
}
/**
 * Returns whether add-task form currently edits an existing task.
 *
 * @returns {boolean}
 */
function checkIfCardIsEditing() {
    return callAddTaskUi("checkIfCardIsEditing", [], false);
}
/**
 * Sets today's date as minimum value for due-date input.
 *
 * @returns {void}
 */
function setTodayDateAsMin() {
    return callAddTaskFormDomain("setTodayDateAsMin", [], undefined);
}
/**
 * Runs add-task form validation checks.
 *
 * @returns {void}
 */
function checkValidity() {
    return callAddTaskFormDomain("checkValidity", [], undefined);
}
/**
 * Resolves validity state for one required form field.
 *
 * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} requiredInputField - Field to validate.
 * @returns {boolean}
 */
function getStateOfRequriredField(requiredInputField) {
    return callAddTaskFormDomain("getStateOfRequriredField", [requiredInputField], false);
}
/**
 * Updates create-button enabled state based on current form validity.
 *
 * @returns {void}
 */
function setCreateBtnState() {
    return callAddTaskFormDomain("setCreateBtnState", [], undefined);
}
/**
 * Activates a button visual/action state.
 *
 * @param {string} id - Button element id.
 * @param {string} actionName - Action name used by form domain.
 * @returns {void}
 */
function activateButton(id, actionName) {
    return callAddTaskFormDomain("activateButton", [id, actionName], undefined);
}
/**
 * Deactivates a button visual/action state.
 *
 * @param {string} id - Button element id.
 * @returns {void}
 */
function deactivateButton(id) {
    return callAddTaskFormDomain("deactivateButton", [id], undefined);
}
