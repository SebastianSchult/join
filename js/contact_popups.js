"use strict";

/**
 * Public facade for contact popup flows.
 *
 * Kept intentionally small so delegated actions continue calling stable function names,
 * while implementation details live in focused modules.
 */

/**
 * Invokes a contact-popup module method behind a stable facade API.
 *
 * @param {string} moduleName - Global module namespace (e.g. `ContactPopupOverlay`).
 * @param {string} methodName - Method name on the resolved module.
 * @param {Array<any>} [args=[]] - Positional arguments forwarded to the method.
 * @param {any} fallbackValue - Value returned when module/method is unavailable.
 * @returns {any}
 */
function callContactPopupModuleMethod(moduleName, methodName, args = [], fallbackValue) {
  const moduleRef = window[moduleName];
  if (!moduleRef || typeof moduleRef[methodName] !== "function") {
    console.warn(
      `Contact popup module method not available: ${moduleName}.${methodName}`
    );
    return fallbackValue;
  }
  return moduleRef[methodName](...args);
}

/** Saves a new contact using the mutations module flow. */
async function saveContact() {
  return callContactPopupModuleMethod(
    "ContactPopupMutations",
    "saveContact",
    [],
    undefined
  );
}

/** Opens and initializes the "add contact" overlay card. */
function addContactCard() {
  return callContactPopupModuleMethod(
    "ContactPopupOverlay",
    "addContactCard",
    [],
    undefined
  );
}

/**
 * Closes a contact overlay by element id.
 *
 * @param {string} id - Overlay container id to close.
 * @returns {void}
 */
function closeOverlay(id) {
  return callContactPopupModuleMethod(
    "ContactPopupOverlay",
    "closeOverlay",
    [id],
    undefined
  );
}

/** Opens the responsive edit/delete action menu for contacts. */
function openEditDelete() {
  return callContactPopupModuleMethod(
    "ContactPopupOverlay",
    "openEditDelete",
    [],
    undefined
  );
}

/**
 * Closes responsive edit/delete menu and optionally restores opener focus.
 *
 * @param {{restoreFocus?: boolean}} [options={}] - Menu close behavior options.
 * @returns {void}
 */
function closeEditDelete(options = {}) {
  return callContactPopupModuleMethod(
    "ContactPopupOverlay",
    "closeEditDelete",
    [options],
    undefined
  );
}

/**
 * Starts contact edit flow for a contact id.
 *
 * @param {number} id - Contact id to edit.
 * @returns {void}
 */
function editContact(id) {
  return callContactPopupModuleMethod(
    "ContactPopupMutations",
    "editContact",
    [id],
    undefined
  );
}

/**
 * Persists edited contact values for one contact id.
 *
 * @param {number} id - Contact id being edited.
 * @returns {Promise<void>}
 */
async function saveEditedContact(id) {
  return callContactPopupModuleMethod(
    "ContactPopupMutations",
    "saveEditedContact",
    [id],
    undefined
  );
}

/**
 * Removes a contact by id through mutations module orchestration.
 *
 * @param {number} id - Contact id to remove.
 * @returns {Promise<void>}
 */
async function removeContact(id) {
  return callContactPopupModuleMethod(
    "ContactPopupMutations",
    "removeContact",
    [id],
    undefined
  );
}

/**
 * Opens edit overlay pre-filled with contact values.
 *
 * @param {Object} contact - Contact object shown in edit form.
 * @returns {void}
 */
function editContactCard(contact) {
  return callContactPopupModuleMethod(
    "ContactPopupOverlay",
    "editContactCard",
    [contact],
    undefined
  );
}

/** Makes sure add-contact container is visible in the current layout context. */
function showAddContactContainer() {
  return callContactPopupModuleMethod(
    "ContactPopupOverlay",
    "showAddContactContainer",
    [],
    undefined
  );
}

/**
 * Shows a transient contacts success message overlay.
 *
 * @param {string} message - User-facing success text.
 * @returns {void}
 */
function displaySuccessMessage(message) {
  return callContactPopupModuleMethod(
    "ContactPopupMutations",
    "displaySuccessMessage",
    [message],
    undefined
  );
}

/**
 * Refreshes contacts UI state after a create/edit/delete mutation.
 *
 * @param {Array<Object>} sourceUsers - Updated users data source.
 * @param {number|null} [selectedContactId=null] - Optional contact id to reopen.
 * @returns {void}
 */
function applyContactsMutationResult(sourceUsers, selectedContactId = null) {
  return callContactPopupModuleMethod(
    "ContactPopupMutations",
    "applyContactsMutationResult",
    [sourceUsers, selectedContactId],
    undefined
  );
}

/**
 * Removes one contact entry from legacy local-storage contacts cache.
 *
 * @param {number} contactId - Contact id to remove from cache.
 * @returns {void}
 */
function deleteContactFromLocalStorage(contactId) {
  return callContactPopupModuleMethod(
    "ContactPopupMutations",
    "deleteContactFromLocalStorage",
    [contactId],
    undefined
  );
}

/**
 * Deletes one contact remotely and applies resulting local UI refresh.
 *
 * @param {number} id - Contact id to delete.
 * @returns {Promise<void>}
 */
async function deleteContact(id) {
  return callContactPopupModuleMethod(
    "ContactPopupMutations",
    "deleteContact",
    [id],
    undefined
  );
}

/**
 * Returns key contact-form controls used by create/edit flows.
 *
 * @returns {{nameInput: HTMLInputElement|null, mailInput: HTMLInputElement|null, phoneInput: HTMLInputElement|null, createButton: HTMLElement|null}}
 */
function getContactFormElements() {
  return callContactPopupModuleMethod(
    "ContactPopupValidation",
    "getContactFormElements",
    [],
    {
      nameInput: null,
      mailInput: null,
      phoneInput: null,
      createButton: null,
    }
  );
}

/**
 * Validates required contact form fields and formats.
 *
 * @param {Object} formElements - Input references returned by `getContactFormElements`.
 * @returns {boolean}
 */
function validateContactFormFields(formElements) {
  return callContactPopupModuleMethod(
    "ContactPopupValidation",
    "validateContactFormFields",
    [formElements],
    false
  );
}

/**
 * Sets one contact input field into invalid state with message output.
 *
 * @param {HTMLInputElement|null} inputElement - Input to mark invalid.
 * @param {string} message - Error text for field-level feedback.
 * @returns {void}
 */
function setContactFieldError(inputElement, message) {
  return callContactPopupModuleMethod(
    "ContactPopupValidation",
    "setContactFieldError",
    [inputElement, message],
    undefined
  );
}

/**
 * Clears invalid state and field-level messages for contact form inputs.
 *
 * @param {Object} formElements - Input references returned by `getContactFormElements`.
 * @returns {void}
 */
function clearContactFieldErrors(formElements) {
  return callContactPopupModuleMethod(
    "ContactPopupValidation",
    "clearContactFieldErrors",
    [formElements],
    undefined
  );
}

/**
 * Resets contact form values and validation state.
 *
 * @param {Object} [formElements=getContactFormElements()] - Form element references.
 * @returns {void}
 */
function resetContactForm(formElements = getContactFormElements()) {
  return callContactPopupModuleMethod(
    "ContactPopupValidation",
    "resetContactForm",
    [formElements],
    undefined
  );
}

/**
 * Writes provided contact values into active form inputs.
 *
 * @param {{name: string, mail: string, phone: string}} values - Values to apply.
 * @returns {void}
 */
function setContactFormValues(values) {
  return callContactPopupModuleMethod(
    "ContactPopupValidation",
    "setContactFormValues",
    [values],
    undefined
  );
}

/**
 * Normalizes contact email values for duplicate checks and persistence.
 *
 * @param {string} emailValue - Raw email value.
 * @returns {string}
 */
function normalizeEmailForContactFlow(emailValue) {
  return callContactPopupModuleMethod(
    "ContactPopupValidation",
    "normalizeEmailForContactFlow",
    [emailValue],
    ""
  );
}

/**
 * Checks whether a contact email is already present in current users list.
 *
 * @param {string} emailValue - Candidate email value.
 * @returns {boolean}
 */
function contactEmailExists(emailValue) {
  return callContactPopupModuleMethod(
    "ContactPopupValidation",
    "contactEmailExists",
    [emailValue],
    false
  );
}

/**
 * Checks whether all required contact form controls are available.
 *
 * @param {Object} formElements - Input references returned by `getContactFormElements`.
 * @returns {boolean}
 */
function hasCompleteContactForm(formElements) {
  return callContactPopupModuleMethod(
    "ContactPopupValidation",
    "hasCompleteContactForm",
    [formElements],
    false
  );
}
