"use strict";

(function registerContactPopupMutationsModule() {
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
      const sourceUsers = Array.isArray(users) ? users : [];
      const newId = generateCollisionSafeId(sourceUsers);
      const newContact = {
        id: newId,
        name: nameInput.value.trim(),
        mail: ContactPopupValidation.normalizeEmailForContactFlow(enteredMail),
        phone: phoneInput.value.trim(),
        contactColor: generateRandomColor(),
      };

      await firebaseSetEntity(newContact, FIREBASE_USERS_ID);
      sourceUsers.push(newContact);
      ContactPopupValidation.resetContactForm(formElements);
      ContactPopupOverlay.closeOverlay("addContact");
      cpmDisplaySuccessMessage("Contact successfully created");
      cpmApplyContactsMutationResult(sourceUsers, newContact.id);
    } catch (error) {
      console.error("Error saving contact:", error);
      showGlobalUserMessage("Could not save contact. Please try again.");
      createButton.disabled = false;
    }
  }

  async function cpmSaveEditedContact(id) {
    const loadResult = await firebaseGetArraySafe(FIREBASE_USERS_ID, {
      context: "contacts",
      errorMessage: "Could not load contacts for editing. Please try again.",
    });
    if (loadResult.error) {
      return;
    }

    const sourceUsers = loadResult.data;
    const userIndex = sourceUsers.findIndex((contact) => contact.id === id);

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

    const mailExistsOnAnotherContact =
      typeof doesEmailExist === "function"
        ? doesEmailExist(sourceUsers, normalizedMail, { excludeId: id })
        : sourceUsers.some(
            (contact) =>
              contact &&
              contact.id !== id &&
              ContactPopupValidation.normalizeEmailForContactFlow(contact.mail) ===
                normalizedMail
          );

    if (mailExistsOnAnotherContact) {
      ContactPopupValidation.setContactFieldError(
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
    ContactPopupOverlay.closeOverlay("editContact");
    cpmDisplaySuccessMessage("Contact successfully edited");
    cpmApplyContactsMutationResult(sourceUsers, id);
  }

  function cpmEditContact(id) {
    ContactPopupOverlay.closeEditDelete({ restoreFocus: false });
    const contactIndex = contacts.findIndex((contact) => contact.id === id);
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

    currentContactId = id;
  }

  function cpmDeleteContactFromLocalStorage(contactId) {
    var contactsInStorage = JSON.parse(localStorage.getItem("contacts"));

    if (contactsInStorage) {
      contactsInStorage = contactsInStorage.filter(function (contact) {
        return contact.id !== contactId;
      });
      localStorage.setItem("contacts", JSON.stringify(contactsInStorage));
    }
  }

  async function cpmDeleteContact(id) {
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
    cpmDeleteContactFromLocalStorage(id);
    cpmDisplaySuccessMessage("Contact successfully deleted");
    cpmApplyContactsMutationResult(sourceUsers);
  }

  async function cpmRemoveContact(id) {
    ContactPopupOverlay.closeEditDelete({ restoreFocus: false });
    await cpmDeleteContact(id);
  }

  function cpmApplyContactsMutationResult(sourceUsers, selectedContactId = null) {
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
