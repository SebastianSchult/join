/**
 * Saves a contact by pushing it to the contacts array and storing it in local storage.
 */
async function saveContact() {
  const loadResult = await getContactsFromRemoteStorage({
    errorMessage: "Could not load contacts. Contact was not created.",
  });
  if (loadResult.error) {
    return;
  }

  const enteredMail = document.getElementById("contactMail").value;
  if (contactEmailExists(enteredMail)) {
    showGlobalUserMessage("A contact with this email already exists.");
    return;
  }

  try {
    createBtn.disabled = true;
    const sourceUsers = Array.isArray(users) ? users : [];
    const newId = generateCollisionSafeId(sourceUsers);
    const newContact = {
      id: newId,
      name: contactName.value,
      mail: normalizeEmailForContactFlow(enteredMail),
      phone: contactPhone.value,
      contactColor: generateRandomColor(),
    };

    await firebaseSetEntity(newContact, FIREBASE_USERS_ID);
    sourceUsers.push(newContact);
    resetContactForm();
    closeOverlay("addContact");
    displaySuccessMessage("Contact successfully created");
    applyContactsMutationResult(sourceUsers, newContact.id);
  } catch (error) {
    console.error("Error saving contact:", error);
    showGlobalUserMessage("Could not save contact. Please try again.");
    createBtn.disabled = false;
  }
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
function resetContactForm() {
  contactName.value = "";
  contactMail.value = "";
  contactPhone.value = "";
  createBtn.disabled = false;
}


/**
 * Displays the add contact card by removing the d-none class from the corresponding container.
 *
 * @function addContactCard
 * @returns {void}
 */
function addContactCard() {
  if (!document.getElementById("addContact")) {
    renderAddContacts();
  }
  document.getElementById("addContact").innerHTML = renderAddContactsHTML();
  addOverlay("closeOverlay('addContact')");
}


/**
 * Creates an overlay element and appends it to the document body. The overlay element
 * has a class of "overlay" and an onclick attribute set to the provided functionToAdd.
 * Additionally, the overflow style of the document body is set to "hidden" to prevent
 * scrolling while the overlay is active.
 *
 * @param {string} functionToAdd - The function to be called when the overlay is clicked.
 * @return {void} This function does not return a value.
 */
function addOverlay(functionToAdd) {
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");

  const bodyContent = document.getElementById("bodyContent");
  overlay.setAttribute("onclick", functionToAdd);

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
  const container = document.getElementById(id);
  container.classList.add("move-out-right");
  setTimeout(() => {
    addContactContainer.classList.remove("move-out-right");
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
    onclick: "doNotClose(event)",
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
  document.getElementById("openEditDeleteResponsive").classList.add("d-none");
  document.getElementById("editDelete").classList.remove("d-none");
}

/**
 * A function that closes the edit delete elements by showing 'openEditDeleteResponsive' and hiding 'editDelete'.
 *
 * @param {} - No parameters
 * @return {} - No return value
 */
function closeEditDelete() {
  document
    .getElementById("openEditDeleteResponsive")
    .classList.remove("d-none");
  document.getElementById("editDelete").classList.add("d-none");
}


/**
 * Edits the contact with the specified ID.
 *
 * @param {number} id - The unique identifier of the contact to be edited.
 * @returns {void}
 */
function editContact(id) {
  const contactIndex = contacts.findIndex((contact) => contact.id === id);
  if (contactIndex !== -1) {
    const contact = contacts[contactIndex];
  
    contact.name = getNameWithCapitalizedFirstLetter(contact.name);

    editContactCard(contact);
    document.getElementById("contactName").value = contact.name;
    document.getElementById("contactMail").value = contact.mail;
    document.getElementById("contactPhone").value = contact.phone;

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
    const user = sourceUsers[userIndex];

    user.name = document.getElementById("contactName").value;
    user.mail = normalizeEmailForContactFlow(
      document.getElementById("contactMail").value
    );
    user.phone = document.getElementById("contactPhone").value;

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
  if (!document.getElementById("editContact")) {
    renderEditContact();
  }
  document.getElementById("editContact").innerHTML = renderEditContactHTML(
    contact.id,
    contact.name,
    contact.contactColor
  );
  addOverlay("closeOverlay('editContact')");
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
