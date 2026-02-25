let users = [];
let contacts = [];
let currentContactId = null;


/**
 * Retrieves the contacts from the remote storage asynchronously.
 *
 * @return {Promise<Array>} A promise that resolves to an array of contacts.
 */
async function getContactsFromRemoteStorage(options = {}) {
  const loadResult = await firebaseGetArraySafe(FIREBASE_USERS_ID, {
    context: "contacts",
    errorMessage: "Could not load contacts. Please try again.",
    ...options,
  });
  users = loadResult.data;
  return loadResult;
}


/**
 * A function that extracts and returns the last name if multiple names are provided, otherwise returns the single name.
 *
 * @param {Object} contact - The contact object containing the name to extract from.
 * @return {string} The extracted last name or single name from the contact.
 */
function getSecondOrFullName(contact) {
  const names = contact.name.split(" ");
  if (names.length === 1) {
    return names[0]; // Wenn nur ein Name vorhanden ist, diesen zurückgeben
  } else {
    return names[names.length - 1]; // Sonst den letzten Namen zurückgeben
  }
}


/**
 * Sorts an array of contacts by their last name.
 *
 * @param {Array} contacts - The array of contacts to be sorted.
 * @return {Array} - The sorted array of contacts.
 */
function sortContactsByName(contacts) {
  let sortedContacts = contacts.slice().sort((a, b) => {
    const lastNameA = getSecondOrFullName(a).toLowerCase();
    const lastNameB = getSecondOrFullName(b).toLowerCase();
    return lastNameA.localeCompare(lastNameB);
  });
  return sortedContacts;
}


/**
 * Retrieves contacts from the users array and sorts them by name.
 *
 * @return {Array} An array of contacts sorted by name.
 */
function getContactsOutOfUsers() {
  const sourceUsers = Array.isArray(users) ? users : [];
  temp_contacts = [];
  sourceUsers.forEach((user) => {
    temp_contacts.push({
      contactColor: user.contactColor,
      id: user.id,
      mail: user.mail,
      name: user.name,
      phone: user.phone,
    });
  });
  users = [];
  contacts = sortContactsByName(temp_contacts);
}


/**
 * Finds the maximum id in the contactsArray and returns the next id.
 *
 * @param {Array} contactsArray - An array of contacts with ids.
 * @return {number} The next id after the maximum id in the contactsArray.
 */
function getNextId(contactsArray) {
  let maxId = 0;
  contactsArray.forEach((contact) => {
    if (contact.id > maxId) {
      maxId = contact.id;
    }
  });
  return maxId + 1;
}


/**
 * Finds the maximum id in the contactsArray and returns the next id.
 */
function getNextId(contactsArray) {
  let maxId = 0;
  contactsArray.forEach((contact) => {
    if (contact.id > maxId) {
      maxId = contact.id;
    }
  });
  return maxId + 1;
}


/**
 * Initializes the contacts by including the HTML and loading the contacts.
 *
 * @return {void} This function does not return anything.
 */
async function contactsInit() {
  includeHTML();
  await getContactsFromRemoteStorage();
  getContactsOutOfUsers();
  loadContacts();
}


/**
 * Loads the contacts and renders them into the main element.
 *
 * @function loadContacts
 * @returns {void}
 */
function loadContacts() {
  const main = document.getElementById("main");
  main.innerHTML = ``;
  createContactsContainer(main);
  renderSortedContacts(main, contacts);
}


/**
 * Generates initials from a full name.
 *
 * @param {string} name - The full name from which to generate initials.
 * @returns {string} The initials generated from the provided full name.
 */
function getInitials(name) {
  let returnName = "";
  if (name.includes(" ")) {
    let [firstName, lastName] = name.split(" ");
    let firstInitial = firstName.charAt(0).toUpperCase();
    let lastInitial = lastName.charAt(0).toUpperCase();
    returnName = firstInitial + lastInitial;
  } else {
    returnName = name.charAt(0).toUpperCase();
  }
  return returnName;
}


/**
 * Creates a letter element representing the first letter of a group of contacts.
 *
 * @function createFirstLetter
 * @param {HTMLElement} main - The main element where the letter element will be appended.
 * @param {string} firstLetter - The first letter to be displayed.
 * @returns {void}
 */
function createFirstLetter(main, firstLetter) {
  const letterDiv = document.createElement("div");
  letterDiv.classList.add("contact-list-letter");
  letterDiv.textContent = firstLetter;
  main.querySelector(".contact-list").appendChild(letterDiv);

  createPartingLine(main);
}


/**
 * Removes a container element from the DOM based on the provided id.
 *
 * @param {string} id - The ID of the container element to remove.
 * @return {void} This function does not return anything.
 */
function removeContainer(id) {
  document.getElementById(id).remove();
}


/**
 * Creates a contact card element and appends it to the contact list within the main element.
 *
 * @function createContactCard
 * @param {HTMLElement} main - The main element containing the contacts container.
 * @param {number} id - The unique identifier for the contact.
 * @param {string} color - The color associated with the contact.
 * @param {string} initials - The initials of the contact.
 * @param {string} name - The name of the contact.
 * @param {string} mail - The email address of the contact.
 * @returns {void}
 */
function createContactCard(main, id, color, initials, name, mail) {
  const shorterMail = mail.length > 20 ? mail.substring(0, 20) + "..." : mail;
  const cardHTML = generateContactCardHTML(
    id,
    color,
    initials,
    name,
    mail,
    shorterMail
  );
  const container = main.querySelector(".contacts-container");
  container
    .querySelector(".contact-list")
    .insertAdjacentHTML("beforeend", cardHTML);
}


/**
 * Capitalizes the first letter of each word in a given name.
 *
 * @param {string} name - The name to be capitalized.
 * @return {string} The capitalized name.
 */
function getNameWithCapitalizedFirstLetter(name) {
  let [firstname, lastname, surname] = name.split(" ");
  firstname = firstname[0].toUpperCase() + firstname.slice(1);
  if (lastname) {
    lastname = lastname[0].toUpperCase() + lastname.slice(1);
  }
  if (surname) {
    surname = surname[0].toUpperCase() + surname.slice(1);
    return firstname + " " + (lastname ? lastname + " " : "") + surname;
  } else {
    return firstname + (lastname ? " " + lastname : "");
  }
}


/**
 * Displays details of the contact with the given ID.
 * @param {number} id - The unique identifier of the contact.
 */
function openContactDetails(id) {
  const contact = contacts.find(({ id: contactId }) => contactId === id);
  const { name, mail, phone, contactColor } = contact;
  const rightSide = document.getElementById("rightSide");
  rightSide.classList.remove("d-none");
  rightSide.innerHTML = generateContactDetailsHTML(
    name,
    mail,
    phone,
    id,
    contactColor
  );
  highlightSelectedContact(id);
}


/**
 * Resets contact card styles to their default values.
 *
 * @param {HTMLElement} card The contact card element.
 */
function resetContactCard(card) {
  card.style.backgroundColor = "";
  card.style.color = "";
  const badgeGroup = card.querySelector(".profile-badge-group");
  if (badgeGroup) {
    badgeGroup.classList.remove("profileBadgeChoosen");
  }
  const emailEl = card.querySelector(".contact-card-email");
  if (emailEl) {
    emailEl.style.color = "";
  }
}


/**
 * Resets the styles of all contact cards to their default values.
 *
 * @function resetAllContactCards
 * @returns {void}
 */
function resetAllContactCards() {
  const allContactCards = document.querySelectorAll(".contact-card");
  allContactCards.forEach((card) => {
    resetContactCard(card);
    card.classList.remove("highlighted");
  });
}


/**
 * Highlights a contact card by applying specific styles.
 *
 * @function highlightContactCard
 * @param {HTMLElement} card - The contact card element to be highlighted.
 * @returns {void}
 */
function highlightContactCard(card) {
  card.style.backgroundColor = "#4589ff";
  card.style.color = "white";
  const badgeGroup = card.querySelector(".profile-badge-group");
  if (badgeGroup) {
    badgeGroup.classList.add("profileBadgeChoosen");
  }
  const emailElement = card.querySelector(".contact-card-email");
  if (emailElement) {
    emailElement.style.color = "white";
  }
}


/**
 * Highlights the selected contact card and shows the right side element.
 *
 * @param {number} id - The ID of the contact card to be highlighted.
 */
function highlightSelectedContact(id) {
  const selectedContactCard = document.getElementById(`contact-card-${id}`);
  const rightSideElement = document.getElementById("rightSide");

  if (selectedContactCard.classList.contains("highlighted")) {
    resetAllContactCards();
    rightSideElement.classList.add("d-none");
    return;
  }

  resetAllContactCards();
  selectedContactCard.classList.add("highlighted");
  applyHighlight();
}


/**
 * Applies highlighting to the selected contact card and shows the right side element.
 *
 * @function applyHighlight
 * @param {HTMLElement} selectedContactCard - The selected contact card element.
 * @param {HTMLElement} rightSideElement - The right side element to be shown.
 * @returns {void}
 */
function applyHighlight() {
  let allContactCards = document.getElementsByClassName("contact-card");
  for (card of allContactCards)
    if (card.classList.contains("highlighted")) {
      highlightContactCard(card);
    } else {
      resetContactCard(card);
    }
}


/**
 * Changes the cancel icon to its hover state by updating its source.
 *
 * @function changeCancelIcon
 * @returns {void}
 */
function changeCancelIcon() {
  document.getElementById("cancelIcon").src =
    "./assets/img/icon-cancel_hover.png";
}


/**
 * Restores the cancel icon to its default state by updating its source.
 *
 * @function restoreCancelIcon
 * @returns {void}
 */
function restoreCancelIcon() {
  document.getElementById("cancelIcon").src = "./assets/img/icon-cancel.png";
}


/**
 * Updates the color of each contact in the contacts_old array by mapping the colors array to the newColors array.
 *
 * @return {void} This function does not return a value.
 */
function changeColor() {
  contacts_old.forEach((contact) => {
    for (let i = 0; i < colors.length; i++) {
      if (contact.contactColor == colors[i]) {
        contact.contactColor = newColors[i];
      }
    }
  });
}

/**
 * Deletes all contacts by clearing the contacts array and updating the storage.
 *
 * @return {Promise<void>} Promise that resolves once contacts are deleted.
 */
async function delAllContacts() {
  contacts = [];
  await remoteStorageSetItem("contacts", JSON.stringify(contacts));
}
