"use strict";

(function registerContactPopupValidationModule() {
  const CONTACT_REQUIRED_FIELD_ERRORS = Object.freeze({
    contactName: "Please enter a name.",
    contactMail: "Please enter an email address.",
    contactPhone: "Please enter a phone number.",
  });

  function getContactFormElements() {
    return {
      nameInput: document.getElementById("contactName"),
      mailInput: document.getElementById("contactMail"),
      phoneInput: document.getElementById("contactPhone"),
      createButton: document.getElementById("createBtn"),
    };
  }

  function getContactFieldErrorElement(inputElement) {
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

  function setContactFieldError(inputElement, message) {
    if (!inputElement) {
      return;
    }

    inputElement.setAttribute("aria-invalid", "true");
    const errorElement = getContactFieldErrorElement(inputElement);
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function clearContactFieldError(inputElement) {
    if (!inputElement) {
      return;
    }

    inputElement.setAttribute("aria-invalid", "false");
    const errorElement = getContactFieldErrorElement(inputElement);
    if (errorElement) {
      errorElement.textContent = "";
    }
  }

  function clearContactFieldErrors(formElements) {
    clearContactFieldError(formElements?.nameInput || null);
    clearContactFieldError(formElements?.mailInput || null);
    clearContactFieldError(formElements?.phoneInput || null);
  }

  function validateContactFormFields(formElements) {
    const { nameInput, mailInput, phoneInput } = formElements;
    let isValid = true;

    if (!nameInput || nameInput.value.trim() === "") {
      setContactFieldError(nameInput, CONTACT_REQUIRED_FIELD_ERRORS.contactName);
      isValid = false;
    } else {
      clearContactFieldError(nameInput);
    }

    if (!mailInput || mailInput.value.trim() === "") {
      setContactFieldError(mailInput, CONTACT_REQUIRED_FIELD_ERRORS.contactMail);
      isValid = false;
    } else if (!mailInput.checkValidity()) {
      setContactFieldError(mailInput, "Please enter a valid email address.");
      isValid = false;
    } else {
      clearContactFieldError(mailInput);
    }

    if (!phoneInput || phoneInput.value.trim() === "") {
      setContactFieldError(phoneInput, CONTACT_REQUIRED_FIELD_ERRORS.contactPhone);
      isValid = false;
    } else {
      clearContactFieldError(phoneInput);
    }

    return isValid;
  }

  function hasCompleteContactForm(formElements) {
    return Boolean(
      formElements &&
        formElements.nameInput &&
        formElements.mailInput &&
        formElements.phoneInput &&
        formElements.createButton
    );
  }

  function setContactFormValues(values) {
    const formElements = getContactFormElements();
    if (!formElements.nameInput || !formElements.mailInput || !formElements.phoneInput) {
      return;
    }

    formElements.nameInput.value = values.name;
    formElements.mailInput.value = values.mail;
    formElements.phoneInput.value = values.phone;
  }

  function normalizeEmailForContactFlow(emailValue) {
    if (typeof normalizeAuthEmail === "function") {
      return normalizeAuthEmail(emailValue);
    }
    if (typeof emailValue !== "string") {
      return "";
    }
    return emailValue.trim().toLowerCase();
  }

  function contactEmailExists(emailValue) {
    const sourceUsers = Array.isArray(users) ? users : [];

    if (typeof doesEmailExist === "function") {
      return doesEmailExist(sourceUsers, emailValue);
    }

    if (typeof checkMailExist === "function") {
      return checkMailExist(emailValue, sourceUsers);
    }

    const normalized = normalizeEmailForContactFlow(emailValue);
    if (normalized === "") {
      return false;
    }

    return sourceUsers.some((user) => {
      if (!user || typeof user !== "object") {
        return false;
      }
      return normalizeEmailForContactFlow(user.mail) === normalized;
    });
  }

  function resetContactForm(formElements = getContactFormElements()) {
    clearContactFieldErrors(formElements);
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
    getContactFormElements,
    setContactFieldError,
    clearContactFieldErrors,
    validateContactFormFields,
    hasCompleteContactForm,
    setContactFormValues,
    normalizeEmailForContactFlow,
    contactEmailExists,
    resetContactForm,
  });
})();
