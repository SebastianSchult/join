"use strict";

/**
 * Public facade for contact popup flows.
 *
 * Kept intentionally small so delegated actions continue calling stable function names,
 * while implementation details live in focused modules.
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

async function saveContact() {
  return callContactPopupModuleMethod(
    "ContactPopupMutations",
    "saveContact",
    [],
    undefined
  );
}

function addContactCard() {
  return callContactPopupModuleMethod(
    "ContactPopupOverlay",
    "addContactCard",
    [],
    undefined
  );
}

function closeOverlay(id) {
  return callContactPopupModuleMethod(
    "ContactPopupOverlay",
    "closeOverlay",
    [id],
    undefined
  );
}

function openEditDelete() {
  return callContactPopupModuleMethod(
    "ContactPopupOverlay",
    "openEditDelete",
    [],
    undefined
  );
}

function closeEditDelete(options = {}) {
  return callContactPopupModuleMethod(
    "ContactPopupOverlay",
    "closeEditDelete",
    [options],
    undefined
  );
}

function editContact(id) {
  return callContactPopupModuleMethod(
    "ContactPopupMutations",
    "editContact",
    [id],
    undefined
  );
}

async function saveEditedContact(id) {
  return callContactPopupModuleMethod(
    "ContactPopupMutations",
    "saveEditedContact",
    [id],
    undefined
  );
}

async function removeContact(id) {
  return callContactPopupModuleMethod(
    "ContactPopupMutations",
    "removeContact",
    [id],
    undefined
  );
}

function editContactCard(contact) {
  return callContactPopupModuleMethod(
    "ContactPopupOverlay",
    "editContactCard",
    [contact],
    undefined
  );
}

function showAddContactContainer() {
  return callContactPopupModuleMethod(
    "ContactPopupOverlay",
    "showAddContactContainer",
    [],
    undefined
  );
}

function displaySuccessMessage(message) {
  return callContactPopupModuleMethod(
    "ContactPopupMutations",
    "displaySuccessMessage",
    [message],
    undefined
  );
}

function applyContactsMutationResult(sourceUsers, selectedContactId = null) {
  return callContactPopupModuleMethod(
    "ContactPopupMutations",
    "applyContactsMutationResult",
    [sourceUsers, selectedContactId],
    undefined
  );
}

function deleteContactFromLocalStorage(contactId) {
  return callContactPopupModuleMethod(
    "ContactPopupMutations",
    "deleteContactFromLocalStorage",
    [contactId],
    undefined
  );
}

async function deleteContact(id) {
  return callContactPopupModuleMethod(
    "ContactPopupMutations",
    "deleteContact",
    [id],
    undefined
  );
}

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

function validateContactFormFields(formElements) {
  return callContactPopupModuleMethod(
    "ContactPopupValidation",
    "validateContactFormFields",
    [formElements],
    false
  );
}

function setContactFieldError(inputElement, message) {
  return callContactPopupModuleMethod(
    "ContactPopupValidation",
    "setContactFieldError",
    [inputElement, message],
    undefined
  );
}

function clearContactFieldErrors(formElements) {
  return callContactPopupModuleMethod(
    "ContactPopupValidation",
    "clearContactFieldErrors",
    [formElements],
    undefined
  );
}

function resetContactForm(formElements = getContactFormElements()) {
  return callContactPopupModuleMethod(
    "ContactPopupValidation",
    "resetContactForm",
    [formElements],
    undefined
  );
}

function setContactFormValues(values) {
  return callContactPopupModuleMethod(
    "ContactPopupValidation",
    "setContactFormValues",
    [values],
    undefined
  );
}

function normalizeEmailForContactFlow(emailValue) {
  return callContactPopupModuleMethod(
    "ContactPopupValidation",
    "normalizeEmailForContactFlow",
    [emailValue],
    ""
  );
}

function contactEmailExists(emailValue) {
  return callContactPopupModuleMethod(
    "ContactPopupValidation",
    "contactEmailExists",
    [emailValue],
    false
  );
}

function hasCompleteContactForm(formElements) {
  return callContactPopupModuleMethod(
    "ContactPopupValidation",
    "hasCompleteContactForm",
    [formElements],
    false
  );
}
