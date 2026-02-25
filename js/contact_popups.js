/**
 * Saves a contact by pushing it to the contacts array and storing it in local storage.
 */
async function saveContact() {
  const formElements = getContactFormElements();
  if (!hasCompleteContactForm(formElements)) {
    showGlobalUserMessage("Contact form is not available. Please reopen it.");
    return;
  }
  clearContactFieldErrors(formElements);
  if (!validateContactFormFields(formElements)) {
    return;
  }

  const { nameInput, mailInput, phoneInput, createButton } = formElements;
  const loadResult = await getContactsFromRemoteStorage({
    errorMessage: "Could not load contacts. Contact was not created.",
  });
  if (loadResult.error) {
    return;
  }

  const enteredMail = mailInput.value;
  if (contactEmailExists(enteredMail)) {
    setContactFieldError(mailInput, "A contact with this email already exists.");
    showGlobalUserMessage("A contact with this email already exists.");
    return;
  }

  try {
    createButton.disabled = true;
    const sourceUsers = Array.isArray(users) ? users : [];
    const newId = generateCollisionSafeId(sourceUsers);
    const newContact = {
      id: newId,
      name: nameInput.value.trim(),
      mail: normalizeEmailForContactFlow(enteredMail),
      phone: phoneInput.value.trim(),
      contactColor: generateRandomColor(),
    };

    await firebaseSetEntity(newContact, FIREBASE_USERS_ID);
    sourceUsers.push(newContact);
    resetContactForm(formElements);
    closeOverlay("addContact");
    displaySuccessMessage("Contact successfully created");
    applyContactsMutationResult(sourceUsers, newContact.id);
  } catch (error) {
    console.error("Error saving contact:", error);
    showGlobalUserMessage("Could not save contact. Please try again.");
    createButton.disabled = false;
  }
}

let contactOverlayOpener = null;
let contactsKeyboardAccessibilityRegistered = false;
let editDeleteMenuOpener = null;
const CONTACT_REQUIRED_FIELD_ERRORS = Object.freeze({
  contactName: "Please enter a name.",
  contactMail: "Please enter an email address.",
  contactPhone: "Please enter a phone number.",
});


/**
 * Returns contact form element references from the current DOM.
 *
 * @returns {{nameInput: HTMLInputElement|null, mailInput: HTMLInputElement|null, phoneInput: HTMLInputElement|null, createButton: HTMLButtonElement|null}}
 */
function getContactFormElements() {
  return {
    nameInput: document.getElementById("contactName"),
    mailInput: document.getElementById("contactMail"),
    phoneInput: document.getElementById("contactPhone"),
    createButton: document.getElementById("createBtn"),
  };
}


/**
 * Resolves the error output element for a contact form field.
 *
 * @param {HTMLInputElement|null} inputElement - Contact form input field.
 * @returns {HTMLElement|null} Matching error container.
 */
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


/**
 * Marks one contact input as invalid and announces the error text.
 *
 * @param {HTMLInputElement|null} inputElement - Input to mark.
 * @param {string} message - Accessible error message.
 * @returns {void}
 */
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


/**
 * Clears one contact input error state.
 *
 * @param {HTMLInputElement|null} inputElement - Input to clear.
 * @returns {void}
 */
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


/**
 * Clears all current contact form field errors.
 *
 * @param {{nameInput: HTMLInputElement|null, mailInput: HTMLInputElement|null, phoneInput: HTMLInputElement|null}} formElements - Current form refs.
 * @returns {void}
 */
function clearContactFieldErrors(formElements) {
  clearContactFieldError(formElements?.nameInput || null);
  clearContactFieldError(formElements?.mailInput || null);
  clearContactFieldError(formElements?.phoneInput || null);
}


/**
 * Validates required and format-sensitive contact fields.
 *
 * @param {{nameInput: HTMLInputElement|null, mailInput: HTMLInputElement|null, phoneInput: HTMLInputElement|null}} formElements - Current form refs.
 * @returns {boolean} True when all fields are valid.
 */
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


/**
 * Checks if all required contact form elements exist.
 *
 * @param {Object} formElements - Object returned by getContactFormElements.
 * @returns {boolean} True when all required elements are present.
 */
function hasCompleteContactForm(formElements) {
  return Boolean(
    formElements &&
      formElements.nameInput &&
      formElements.mailInput &&
      formElements.phoneInput &&
      formElements.createButton
  );
}


/**
 * Writes values into currently visible contact form fields.
 *
 * @param {{name: string, mail: string, phone: string}} values - Form values to apply.
 * @returns {void}
 */
function setContactFormValues(values) {
  const formElements = getContactFormElements();
  if (!formElements.nameInput || !formElements.mailInput || !formElements.phoneInput) {
    return;
  }

  formElements.nameInput.value = values.name;
  formElements.mailInput.value = values.mail;
  formElements.phoneInput.value = values.phone;
}


/**
 * Normalizes email values even if auth helpers are temporarily stale in cache.
 *
 * @param {unknown} emailValue - Raw email input.
 * @returns {string} Normalized lowercase email.
 */
function normalizeEmailForContactFlow(emailValue) {
  if (typeof normalizeAuthEmail === "function") {
    return normalizeAuthEmail(emailValue);
  }
  if (typeof emailValue !== "string") {
    return "";
  }
  return emailValue.trim().toLowerCase();
}


/**
 * Resolves duplicate-email checks with backward compatibility for older script versions.
 *
 * @param {string} emailValue - Email to check.
 * @returns {boolean} True when email already exists.
 */
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


/**
 * Displays a success message overlay with the given message content.
 *
 * @param {string} message - The message to be displayed in the success overlay.
 * @return {void} This function does not return a value.
 */
function displaySuccessMessage(message) {
  const overlay = document.createElement("div");
  overlay.className = "contact-succ-created-overlay";

  const wrapper = document.createElement("div");
  wrapper.className = "contact-succesfully-created-wrapper";

  const messageContainer = document.createElement("div");
  messageContainer.className = "contact-succesfully-created";
  messageContainer.textContent = message == null ? "" : String(message);

  wrapper.appendChild(messageContainer);
  overlay.appendChild(wrapper);
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.classList.add("slide-in"); 

    setTimeout(() => {
      overlay.classList.add("slide-out"); 
      setTimeout(() => {
        overlay.remove(); 
      }, 500); 
    }, 2000); 
  }, 10); 
}


/**
 * Resets the contact form by clearing the input fields and enabling the create button.
 *
 * @param {void}
 * @return {void}
 */
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


/**
 * Displays the add contact card by removing the d-none class from the corresponding container.
 *
 * @function addContactCard
 * @returns {void}
 */
function addContactCard() {
  contactOverlayOpener = document.activeElement;
  if (!document.getElementById("addContact")) {
    renderAddContacts();
  }
  document.getElementById("addContact").innerHTML = renderAddContactsHTML();
  addOverlay("addContact");
  activateFocusLayer("addContact", {
    opener: contactOverlayOpener,
    initialFocus: "#contactName",
    onEscape: () => closeOverlay("addContact"),
  });
}


/**
 * Creates an overlay element and appends it to the document body. The overlay element
 * has a class of "overlay" and delegated close action data attributes.
 * Additionally, the overflow style of the document body is set to "hidden" to prevent
 * scrolling while the overlay is active.
 *
 * @param {string} overlayId - The overlay container id to close on overlay click.
 * @return {void} This function does not return a value.
 */
function addOverlay(overlayId) {
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  overlay.dataset.action = "close-overlay";
  overlay.dataset.overlayId = overlayId;

  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";
}


/**
 * Closes an overlay by adding the "move-out-right" class to the container element, removing the class after a delay, and removing the overlay element if it exists. Also enables scrolling on the body element and removes the container element.
 *
 * @param {string} id - The ID of the container element.
 * @return {void}
 */
function closeOverlay(id) {
  deactivateFocusLayer({ restoreFocus: true });
  const container = document.getElementById(id);
  if (!container) {
    return;
  }

  container.classList.add("move-out-right");
  const addContactContainerElement = document.getElementById("addContactContainer");
  setTimeout(() => {
    if (addContactContainerElement) {
      addContactContainerElement.classList.remove("move-out-right");
    }
  }, 125);

  const overlay = document.querySelector(".overlay");
  if (overlay) overlay.remove();

  document.body.style.overflow = "auto";
  setTimeout(() => {
    removeContainer(id);
  },100);
}


/**
 * Renders the "Add Contact" button by creating a new div element and appending it to the "addContactContainer" element.
 *
 * @return {void} This function does not return a value.
 */
function renderAddContacts() {
  let newDiv = document.createElement("div");
  newDiv.id = "addContact";
  setAttributes(newDiv, {
    class: "add-contact",
    "data-stop-propagation": "true",
    role: "dialog",
    "aria-modal": "true",
  });
  document.getElementById("addContactContainer").appendChild(newDiv);
}


/**
 * Creates a new `<div>` element with the id 'editContact' and adds it as a child to the element with the id 'contactMainEdit'.
 * The new `<div>` element has a class attribute set to 'edit-contact'.
 *
 * @return {void} This function does not return anything.
 */
function renderEditContact() {
  let newDiv = document.createElement("div");
  newDiv.id = "editContact";
  setAttributes(newDiv, {
    class: "edit-contact",
    role: "dialog",
    "aria-modal": "true",
  });
  document.getElementById("contactMainEdit").appendChild(newDiv);
}


/**
 * Shows the add contact container by removing the "hidden" class from the element with the id "addContactContainer".
 *
 * @return {void} This function does not return anything.
 */
function showAddContactContainer() {
  const addContactContainer = document.getElementById("addContactContainer");
  addContactContainer.classList.remove("hidden");
}


/**
 * A function that hides the openEditDeleteResponsive element and shows the editDelete element.
 *
 */
function openEditDelete() {
  const openButton = document.getElementById("openEditDeleteResponsive");
  const editDeleteMenu = document.getElementById("editDelete");
  if (!openButton || !editDeleteMenu) {
    return;
  }

  registerContactsKeyboardAccessibility();
  editDeleteMenuOpener = openButton;

  openButton.classList.add("d-none");
  openButton.setAttribute("aria-expanded", "true");
  editDeleteMenu.classList.remove("d-none");
  editDeleteMenu.setAttribute("tabindex", "-1");

  const firstMenuButton = editDeleteMenu.querySelector("button");
  focusElementIfPossible(firstMenuButton || editDeleteMenu);
}

/**
 * A function that closes the edit delete elements by showing 'openEditDeleteResponsive' and hiding 'editDelete'.
 *
 * @param {} - No parameters
 * @return {} - No return value
 */
function closeEditDelete(options = {}) {
  const { restoreFocus = true } = options;
  const openButton = document.getElementById("openEditDeleteResponsive");
  const editDeleteMenu = document.getElementById("editDelete");

  if (openButton) {
    openButton.classList.remove("d-none");
    openButton.setAttribute("aria-expanded", "false");
  }
  if (editDeleteMenu) {
    editDeleteMenu.classList.add("d-none");
  }

  if (restoreFocus) {
    focusElementIfPossible(editDeleteMenuOpener || openButton);
  }
  editDeleteMenuOpener = null;
}


/**
 * Registers keyboard handling for the mobile contact action menu.
 *
 * @returns {void}
 */
function registerContactsKeyboardAccessibility() {
  if (contactsKeyboardAccessibilityRegistered) {
    return;
  }

  document.addEventListener("keydown", handleContactsKeyboardAccessibility, true);
  contactsKeyboardAccessibilityRegistered = true;
}


/**
 * Handles keyboard behavior for the responsive contact action menu.
 *
 * @param {KeyboardEvent} event - Browser keyboard event.
 * @returns {void}
 */
function handleContactsKeyboardAccessibility(event) {
  const editDeleteMenu = document.getElementById("editDelete");
  if (
    !editDeleteMenu ||
    editDeleteMenu.classList.contains("d-none") ||
    event.defaultPrevented
  ) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    closeEditDelete({ restoreFocus: true });
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusableControls = getFocusableElements(editDeleteMenu);
  if (focusableControls.length === 0) {
    event.preventDefault();
    focusElementIfPossible(editDeleteMenu);
    return;
  }

  const first = focusableControls[0];
  const last = focusableControls[focusableControls.length - 1];
  const activeElement = document.activeElement;

  if (event.shiftKey) {
    if (activeElement === first || !editDeleteMenu.contains(activeElement)) {
      event.preventDefault();
      focusElementIfPossible(last);
    }
    return;
  }

  if (activeElement === last || !editDeleteMenu.contains(activeElement)) {
    event.preventDefault();
    focusElementIfPossible(first);
  }
}


/**
 * Edits the contact with the specified ID.
 *
 * @param {number} id - The unique identifier of the contact to be edited.
 * @returns {void}
 */
function editContact(id) {
  closeEditDelete({ restoreFocus: false });
  const contactIndex = contacts.findIndex((contact) => contact.id === id);
  if (contactIndex !== -1) {
    const contact = contacts[contactIndex];
  
    contact.name = getNameWithCapitalizedFirstLetter(contact.name);

    editContactCard(contact);
    setContactFormValues({
      name: contact.name,
      mail: contact.mail,
      phone: contact.phone,
    });

    currentContactId = id; // Setze die aktuelle Kontakt-ID
  }
}



/**
 * Saves the edited contact by updating the contact object with the values from the input fields.
 * If the contact is found in the contacts array, it is updated and logged to the console.
 * If the contact is not found, an error message is logged to the console.
 *
 * @return {undefined} This function does not return a value.
 */
async function saveEditedContact(id) {
  const loadResult = await firebaseGetArraySafe(FIREBASE_USERS_ID, {
    context: "contacts",
    errorMessage: "Could not load contacts for editing. Please try again.",
  });
  if (loadResult.error) {
    return;
  }

  const sourceUsers = loadResult.data;
  const userIndex = sourceUsers.findIndex((contact) => contact.id === id);

  if (userIndex !== -1) {
    const formElements = getContactFormElements();
    if (
      !formElements.nameInput ||
      !formElements.mailInput ||
      !formElements.phoneInput
    ) {
      showGlobalUserMessage("Contact form is not available. Please reopen it.");
      return;
    }
    clearContactFieldErrors(formElements);
    if (!validateContactFormFields(formElements)) {
      return;
    }

    const user = sourceUsers[userIndex];
    const normalizedMail = normalizeEmailForContactFlow(formElements.mailInput.value);
    const mailExistsOnAnotherContact =
      typeof doesEmailExist === "function"
        ? doesEmailExist(sourceUsers, normalizedMail, { excludeId: id })
        : sourceUsers.some(
            (contact) =>
              contact &&
              contact.id !== id &&
              normalizeEmailForContactFlow(contact.mail) === normalizedMail
          );
    if (mailExistsOnAnotherContact) {
      setContactFieldError(
        formElements.mailInput,
        "A contact with this email already exists."
      );
      showGlobalUserMessage("A contact with this email already exists.");
      return;
    }

    user.name = formElements.nameInput.value.trim();
    user.mail = normalizedMail;
    user.phone = formElements.phoneInput.value.trim();

    await firebaseSetEntity(user, FIREBASE_USERS_ID);
    closeOverlay("editContact");
    displaySuccessMessage("Contact successfully edited");
    applyContactsMutationResult(sourceUsers, id);
  }
}


/**
 * Removes the "d-none" class from the "editContact" element, making it visible.
 *
 * @return {void} This function does not return a value.
 */
function editContactCard(contact) {
  contactOverlayOpener = document.activeElement;
  if (!document.getElementById("editContact")) {
    renderEditContact();
  }
  document.getElementById("editContact").innerHTML = renderEditContactHTML(
    contact.id,
    contact.name,
    contact.contactColor
  );
  addOverlay("editContact");
  activateFocusLayer("editContact", {
    opener: contactOverlayOpener,
    initialFocus: "#contactName",
    onEscape: () => closeOverlay("editContact"),
  });
}


/**
 * Deletes a contact from the local storage.
 *
 * @param {number} contactId - The ID of the contact to be deleted.
 * @return {undefined} This function does not return a value.
 */
function deleteContactFromLocalStorage(contactId) {
  var contacts = JSON.parse(localStorage.getItem("contacts"));

  if (contacts) {
    contacts = contacts.filter(function (contact) {
      return contact.id !== contactId;
    });
    localStorage.setItem("contacts", JSON.stringify(contacts));
  }
}


/**
 * Deletes a contact from the Firebase database and local storage.
 *
 * @param {number} id - The ID of the contact to be deleted.
 * @return {Promise<void>} A promise that resolves when the contact is successfully deleted.
 */
async function deleteContact(id) {
  const loadResult = await firebaseGetArraySafe(FIREBASE_USERS_ID, {
    context: "contacts",
    errorMessage: "Could not load contacts for deleting. Please try again.",
  });
  if (loadResult.error) {
    return;
  }

  const sourceUsers = loadResult.data;
  const userIndex = sourceUsers.findIndex((user) => user.id === id);
  if (userIndex === -1) {
    return;
  }

  sourceUsers.splice(userIndex, 1);
  await firebaseDeleteEntity(id, FIREBASE_USERS_ID);
  deleteContactFromLocalStorage(id);
  displaySuccessMessage("Contact successfully deleted");
  applyContactsMutationResult(sourceUsers);
}


/**
 * Removes a contact from the local storage and reinitializes the contacts list.
 *
 * @param {number} id - The unique identifier of the contact to be removed.
 * @return {void} This function does not return anything.
 */
async function removeContact(id) {
  closeEditDelete({ restoreFocus: false });
  await deleteContact(id);
}


/**
 * Updates local contact state and re-renders contacts after successful mutations.
 *
 * @param {Array} sourceUsers - Updated user array from Firebase flow.
 * @param {number|null} selectedContactId - Contact to keep selected after rerender.
 * @returns {void}
 */
function applyContactsMutationResult(sourceUsers, selectedContactId = null) {
  users = Array.isArray(sourceUsers) ? sourceUsers : [];
  getContactsOutOfUsers();
  loadContacts();

  if (selectedContactId == null) {
    return;
  }

  const hasSelectedContact = contacts.some(
    (contact) => contact.id === selectedContactId
  );
  if (hasSelectedContact) {
    openContactDetails(selectedContactId);
  }
}
