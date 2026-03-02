"use strict";

(function registerContactPopupMutationsModule() {
  /**
   * Normalizes contact/user ids to safe integers for stable comparisons.
   *
   * @param {number|string} idValue - Raw id value.
   * @returns {number|null}
   */
  function cpmNormalizeContactId(idValue) {
    const normalizedId = Number(idValue);
    return Number.isSafeInteger(normalizedId) ? normalizedId : null;
  }

  /**
   * Builds a canonical Firebase users map keyed by contact id.
   *
   * @param {Array<Object>} sourceUsers - Source users array.
   * @returns {Object<string, Object>}
   */
  function cpmBuildCanonicalUsersMap(sourceUsers) {
    const canonicalUsersMap = {};
    const sourceList = Array.isArray(sourceUsers) ? sourceUsers : [];

    sourceList.forEach((user) => {
      if (!user || typeof user !== "object") {
        return;
      }

      const normalizedId = cpmNormalizeContactId(user.id);
      if (normalizedId == null) {
        return;
      }

      canonicalUsersMap[String(normalizedId)] = {
        ...user,
        id: normalizedId,
        mail: ContactPopupValidation.normalizeEmailForContactFlow(user.mail),
      };
    });

    return canonicalUsersMap;
  }

  /**
   * Persists users as one canonical id-keyed collection to avoid stale duplicate records.
   *
   * @param {Array<Object>} sourceUsers - Users to persist.
   * @returns {Promise<Array<Object>>} Persisted users as array.
   */
  async function cpmPersistCanonicalUsers(sourceUsers) {
    const canonicalUsersMap = cpmBuildCanonicalUsersMap(sourceUsers);
    await firebaseUpdateItem(canonicalUsersMap, FIREBASE_USERS_ID);
    return Object.values(canonicalUsersMap);
  }

  /** Validates form data and creates a new contact entity in Firebase and local runtime state. */
  async function cpmSaveContact() {
    const formElements = ContactPopupValidation.getContactFormElements();
    if (!ContactPopupValidation.hasCompleteContactForm(formElements)) {
      showGlobalUserMessage("Contact form is not available. Please reopen it.");
      return;
    }
    ContactPopupValidation.clearContactFieldErrors(formElements);
    if (!ContactPopupValidation.validateContactFormFields(formElements)) {
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
    if (ContactPopupValidation.contactEmailExists(enteredMail)) {
      ContactPopupValidation.setContactFieldError(
        mailInput,
        "A contact with this email already exists."
      );
      showGlobalUserMessage("A contact with this email already exists.");
      return;
    }

    try {
      createButton.disabled = true;
      const sourceUsers = Array.isArray(users) ? users.slice() : [];
      const newId = generateCollisionSafeId(sourceUsers);
      const newContact = {
        id: newId,
        name: nameInput.value.trim(),
        mail: ContactPopupValidation.normalizeEmailForContactFlow(enteredMail),
        phone: phoneInput.value.trim(),
        contactColor: generateRandomColor(),
      };

      sourceUsers.push(newContact);
      const persistedUsers = await cpmPersistCanonicalUsers(sourceUsers);
      ContactPopupValidation.resetContactForm(formElements);
      ContactPopupOverlay.closeOverlay("addContact");
      cpmDisplaySuccessMessage("Contact successfully created");
      cpmApplyContactsMutationResult(persistedUsers, newContact.id);
    } catch (error) {
      console.error("Error saving contact:", error);
      showGlobalUserMessage("Could not save contact. Please try again.");
      createButton.disabled = false;
    }
  }

  /**
   * Persists edited contact data for a given contact id.
   *
   * @param {number} id - Contact id being edited.
   * @returns {Promise<void>}
   */
  async function cpmSaveEditedContact(id) {
    const loadResult = await firebaseGetArraySafe(FIREBASE_USERS_ID, {
      context: "contacts",
      errorMessage: "Could not load contacts for editing. Please try again.",
    });
    if (loadResult.error) {
      return;
    }

    const sourceUsers = loadResult.data;
    const normalizedTargetId = cpmNormalizeContactId(id);
    if (normalizedTargetId == null) {
      showGlobalUserMessage("Invalid contact id. Please reload and try again.");
      return;
    }

    const userIndex = sourceUsers.findIndex(
      (contact) => cpmNormalizeContactId(contact && contact.id) === normalizedTargetId
    );

    if (userIndex === -1) {
      return;
    }

    const formElements = ContactPopupValidation.getContactFormElements();
    if (!formElements.nameInput || !formElements.mailInput || !formElements.phoneInput) {
      showGlobalUserMessage("Contact form is not available. Please reopen it.");
      return;
    }
    ContactPopupValidation.clearContactFieldErrors(formElements);
    if (!ContactPopupValidation.validateContactFormFields(formElements)) {
      return;
    }

    const user = sourceUsers[userIndex];
    const normalizedMail = ContactPopupValidation.normalizeEmailForContactFlow(
      formElements.mailInput.value
    );

    const mailExistsOnAnotherContact = sourceUsers.some((contact) => {
      if (!contact || typeof contact !== "object") {
        return false;
      }

      const contactId = cpmNormalizeContactId(contact.id);
      if (contactId === normalizedTargetId) {
        return false;
      }

      return (
        ContactPopupValidation.normalizeEmailForContactFlow(contact.mail) ===
        normalizedMail
      );
    });

    if (mailExistsOnAnotherContact) {
      ContactPopupValidation.setContactFieldError(
        formElements.mailInput,
        "A contact with this email already exists."
      );
      showGlobalUserMessage("A contact with this email already exists.");
      return;
    }

    try {
      user.id = normalizedTargetId;
      user.name = formElements.nameInput.value.trim();
      user.mail = normalizedMail;
      user.phone = formElements.phoneInput.value.trim();

      const persistedUsers = await cpmPersistCanonicalUsers(sourceUsers);
      ContactPopupOverlay.closeOverlay("editContact");
      cpmDisplaySuccessMessage("Contact successfully edited");
      cpmApplyContactsMutationResult(persistedUsers, normalizedTargetId);
    } catch (error) {
      console.error("Error editing contact:", error);
      showGlobalUserMessage("Could not edit contact. Please try again.");
    }
  }

  /**
   * Opens edit dialog for one contact and fills form values from current state.
   *
   * @param {number} id - Contact id to edit.
   * @returns {void}
   */
  function cpmEditContact(id) {
    ContactPopupOverlay.closeEditDelete({ restoreFocus: false });
    const normalizedTargetId = cpmNormalizeContactId(id);
    if (normalizedTargetId == null) {
      return;
    }

    const contactIndex = contacts.findIndex(
      (contact) => cpmNormalizeContactId(contact && contact.id) === normalizedTargetId
    );
    if (contactIndex === -1) {
      return;
    }

    const contact = contacts[contactIndex];
    contact.name = getNameWithCapitalizedFirstLetter(contact.name);

    ContactPopupOverlay.editContactCard(contact);
    ContactPopupValidation.setContactFormValues({
      name: contact.name,
      mail: contact.mail,
      phone: contact.phone,
    });

    currentContactId = normalizedTargetId;
  }

  /**
   * Removes a contact id from legacy local-storage contacts cache.
   *
   * @param {number} contactId - Contact id to remove.
   * @returns {void}
   */
  function cpmDeleteContactFromLocalStorage(contactId) {
    var contactsInStorage = JSON.parse(localStorage.getItem("contacts"));
    const normalizedTargetId = cpmNormalizeContactId(contactId);

    if (contactsInStorage) {
      contactsInStorage = contactsInStorage.filter(function (contact) {
        return cpmNormalizeContactId(contact && contact.id) !== normalizedTargetId;
      });
      localStorage.setItem("contacts", JSON.stringify(contactsInStorage));
    }
  }

  /**
   * Deletes one contact from Firebase and updates local runtime/UI state.
   *
   * @param {number} id - Contact id to delete.
   * @returns {Promise<void>}
   */
  async function cpmDeleteContact(id) {
    const loadResult = await firebaseGetArraySafe(FIREBASE_USERS_ID, {
      context: "contacts",
      errorMessage: "Could not load contacts for deleting. Please try again.",
    });
    if (loadResult.error) {
      return;
    }

    const sourceUsers = loadResult.data;
    const normalizedTargetId = cpmNormalizeContactId(id);
    if (normalizedTargetId == null) {
      showGlobalUserMessage("Invalid contact id. Please reload and try again.");
      return;
    }

    const userIndex = sourceUsers.findIndex(
      (user) => cpmNormalizeContactId(user && user.id) === normalizedTargetId
    );
    if (userIndex === -1) {
      return;
    }

    try {
      sourceUsers.splice(userIndex, 1);
      const persistedUsers = await cpmPersistCanonicalUsers(sourceUsers);
      cpmDeleteContactFromLocalStorage(normalizedTargetId);
      cpmDisplaySuccessMessage("Contact successfully deleted");
      cpmApplyContactsMutationResult(persistedUsers);
    } catch (error) {
      console.error("Error deleting contact:", error);
      showGlobalUserMessage("Could not delete contact. Please try again.");
    }
  }

  /**
   * Closes responsive action menu and executes delete flow for one contact id.
   *
   * @param {number} id - Contact id to remove.
   * @returns {Promise<void>}
   */
  async function cpmRemoveContact(id) {
    ContactPopupOverlay.closeEditDelete({ restoreFocus: false });
    await cpmDeleteContact(id);
  }

  /**
   * Applies updated users array to contacts runtime and optionally reopens contact details.
   *
   * @param {Array<Object>} sourceUsers - Updated users array after mutation.
   * @param {number|null} [selectedContactId=null] - Optional contact id to keep selected.
   * @returns {void}
   */
  function cpmApplyContactsMutationResult(sourceUsers, selectedContactId = null) {
    users = Array.isArray(sourceUsers) ? sourceUsers : [];
    getContactsOutOfUsers();
    loadContacts();

    if (selectedContactId == null) {
      return;
    }

    const normalizedSelectedId = cpmNormalizeContactId(selectedContactId);
    if (normalizedSelectedId == null) {
      return;
    }

    const hasSelectedContact = contacts.some(
      (contact) => cpmNormalizeContactId(contact && contact.id) === normalizedSelectedId
    );
    if (hasSelectedContact) {
      openContactDetails(normalizedSelectedId);
    }
  }

  /**
   * Shows transient success feedback overlay for contacts mutation operations.
   *
   * @param {string} message - User-facing success message.
   * @returns {void}
   */
  function cpmDisplaySuccessMessage(message) {
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

  window.ContactPopupMutations = Object.freeze({
    saveContact: cpmSaveContact,
    saveEditedContact: cpmSaveEditedContact,
    editContact: cpmEditContact,
    deleteContact: cpmDeleteContact,
    removeContact: cpmRemoveContact,
    deleteContactFromLocalStorage: cpmDeleteContactFromLocalStorage,
    applyContactsMutationResult: cpmApplyContactsMutationResult,
    displaySuccessMessage: cpmDisplaySuccessMessage,
  });
})();
