"use strict";

(function registerContactPopupValidationModule() {
  const CONTACT_REQUIRED_FIELD_ERRORS = Object.freeze({
    contactName: "Please enter a name.",
    contactMail: "Please enter an email address.",
    contactPhone: "Please enter a phone number.",
  });

  /**
   * Returns current contact form control references used by mutation flows.
   *
   * @returns {{nameInput: HTMLInputElement|null, mailInput: HTMLInputElement|null, phoneInput: HTMLInputElement|null, createButton: HTMLElement|null}}
   */
  function cpvGetContactFormElements() {
    return {
      nameInput: document.getElementById("contactName"),
      mailInput: document.getElementById("contactMail"),
      phoneInput: document.getElementById("contactPhone"),
      createButton: document.getElementById("createBtn"),
    };
  }

  /**
   * Resolves field-level error output element for a given contact form input.
   *
   * @param {HTMLInputElement|null} inputElement - Input to resolve error element for.
   * @returns {HTMLElement|null}
   */
  function cpvGetContactFieldErrorElement(inputElement) {
    if (!inputElement) {
      return null;
    }

    const describedBy = inputElement.getAttribute("aria-describedby") || "";
    const describedByIds = describedBy
      .split(" ")
      .map((id) => id.trim())
      .filter(Boolean);
    const errorIdFromA11y = describedByIds.find((id) => id.endsWith("Error"));
    if (errorIdFromA11y) {
      return document.getElementById(errorIdFromA11y);
    }

    if (!inputElement.id) {
      return null;
    }
    return document.getElementById(`${inputElement.id}Error`);
  }

  /**
   * Sets one contact form field into invalid state and writes error text.
   *
   * @param {HTMLInputElement|null} inputElement - Input element to mark invalid.
   * @param {string} message - Field-level error message.
   * @returns {void}
   */
  function cpvSetContactFieldError(inputElement, message) {
    if (!inputElement) {
      return;
    }

    inputElement.setAttribute("aria-invalid", "true");
    const errorElement = cpvGetContactFieldErrorElement(inputElement);
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  /**
   * Clears invalid state and error text for one contact input field.
   *
   * @param {HTMLInputElement|null} inputElement - Input element to clear.
   * @returns {void}
   */
  function cpvClearContactFieldError(inputElement) {
    if (!inputElement) {
      return;
    }

    inputElement.setAttribute("aria-invalid", "false");
    const errorElement = cpvGetContactFieldErrorElement(inputElement);
    if (errorElement) {
      errorElement.textContent = "";
    }
  }

  /**
   * Clears validation feedback for all known contact form input fields.
   *
   * @param {{nameInput?:HTMLInputElement|null,mailInput?:HTMLInputElement|null,phoneInput?:HTMLInputElement|null}} formElements - Contact form references.
   * @returns {void}
   */
  function cpvClearContactFieldErrors(formElements) {
    cpvClearContactFieldError(formElements?.nameInput || null);
    cpvClearContactFieldError(formElements?.mailInput || null);
    cpvClearContactFieldError(formElements?.phoneInput || null);
  }

  /**
   * Validates required contact fields and email format constraints.
   *
   * @param {{nameInput:HTMLInputElement|null,mailInput:HTMLInputElement|null,phoneInput:HTMLInputElement|null}} formElements - Contact form references.
   * @returns {boolean}
   */
  function cpvValidateContactFormFields(formElements) {
    const { nameInput, mailInput, phoneInput } = formElements;
    let isValid = true;

    if (!nameInput || nameInput.value.trim() === "") {
      cpvSetContactFieldError(nameInput, CONTACT_REQUIRED_FIELD_ERRORS.contactName);
      isValid = false;
    } else {
      cpvClearContactFieldError(nameInput);
    }

    if (!mailInput || mailInput.value.trim() === "") {
      cpvSetContactFieldError(mailInput, CONTACT_REQUIRED_FIELD_ERRORS.contactMail);
      isValid = false;
    } else if (!mailInput.checkValidity()) {
      cpvSetContactFieldError(mailInput, "Please enter a valid email address.");
      isValid = false;
    } else {
      cpvClearContactFieldError(mailInput);
    }

    if (!phoneInput || phoneInput.value.trim() === "") {
      cpvSetContactFieldError(phoneInput, CONTACT_REQUIRED_FIELD_ERRORS.contactPhone);
      isValid = false;
    } else {
      cpvClearContactFieldError(phoneInput);
    }

    return isValid;
  }

  /**
   * Checks whether all required contact form controls are currently mounted.
   *
   * @param {Object} formElements - Contact form references.
   * @returns {boolean}
   */
  function cpvHasCompleteContactForm(formElements) {
    return Boolean(
      formElements &&
        formElements.nameInput &&
        formElements.mailInput &&
        formElements.phoneInput &&
        formElements.createButton
    );
  }

  /**
   * Writes provided values into contact form fields for edit flows.
   *
   * @param {{name:string,mail:string,phone:string}} values - Values applied to the form.
   * @returns {void}
   */
  function cpvSetContactFormValues(values) {
    const formElements = cpvGetContactFormElements();
    if (!formElements.nameInput || !formElements.mailInput || !formElements.phoneInput) {
      return;
    }

    formElements.nameInput.value = values.name;
    formElements.mailInput.value = values.mail;
    formElements.phoneInput.value = values.phone;
  }

  /**
   * Normalizes email values for duplicate checks and persistence comparisons.
   *
   * @param {string} emailValue - Raw email value.
   * @returns {string}
   */
  function cpvNormalizeEmailForContactFlow(emailValue) {
    if (typeof normalizeAuthEmail === "function") {
      return normalizeAuthEmail(emailValue);
    }
    if (typeof emailValue !== "string") {
      return "";
    }
    return emailValue.trim().toLowerCase();
  }

  /**
   * Checks whether a normalized email already exists in current users data.
   *
   * @param {string} emailValue - Candidate email value.
   * @returns {boolean}
   */
  function cpvContactEmailExists(emailValue) {
    const sourceUsers = Array.isArray(users) ? users : [];

    if (typeof doesEmailExist === "function") {
      return doesEmailExist(sourceUsers, emailValue);
    }

    if (typeof checkMailExist === "function") {
      return checkMailExist(emailValue, sourceUsers);
    }

    const normalized = cpvNormalizeEmailForContactFlow(emailValue);
    if (normalized === "") {
      return false;
    }

    return sourceUsers.some((user) => {
      if (!user || typeof user !== "object") {
        return false;
      }
      return cpvNormalizeEmailForContactFlow(user.mail) === normalized;
    });
  }

  /**
   * Resets contact form values, error state, and create button availability.
   *
   * @param {Object} [formElements=cpvGetContactFormElements()] - Contact form references.
   * @returns {void}
   */
  function cpvResetContactForm(formElements = cpvGetContactFormElements()) {
    cpvClearContactFieldErrors(formElements);
    if (formElements.nameInput) {
      formElements.nameInput.value = "";
    }
    if (formElements.mailInput) {
      formElements.mailInput.value = "";
    }
    if (formElements.phoneInput) {
      formElements.phoneInput.value = "";
    }
    if (formElements.createButton) {
      formElements.createButton.disabled = false;
    }
  }

  window.ContactPopupValidation = Object.freeze({
    getContactFormElements: cpvGetContactFormElements,
    setContactFieldError: cpvSetContactFieldError,
    clearContactFieldErrors: cpvClearContactFieldErrors,
    validateContactFormFields: cpvValidateContactFormFields,
    hasCompleteContactForm: cpvHasCompleteContactForm,
    setContactFormValues: cpvSetContactFormValues,
    normalizeEmailForContactFlow: cpvNormalizeEmailForContactFlow,
    contactEmailExists: cpvContactEmailExists,
    resetContactForm: cpvResetContactForm,
  });
})();
