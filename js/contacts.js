"use strict";

let users = [];
let contacts = [];
let currentContactId = null;

/**
 * Retrieves the contacts from the remote storage asynchronously.
 *
 * @param {Object} [options={}] - Safe-load options forwarded to the Firebase adapter.
 * @return {Promise<{data:Array,error:Error|null}>} Safe contacts load result.
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
    return names[0];
  }
  return names[names.length - 1];
}

/**
 * Sorts an array of contacts by their last name.
 *
 * @param {Array} contactsToSort - The array of contacts to be sorted.
 * @return {Array} The sorted array of contacts.
 */
function sortContactsByName(contactsToSort) {
  return contactsToSort.slice().sort((a, b) => {
    const lastNameA = getSecondOrFullName(a).toLowerCase();
    const lastNameB = getSecondOrFullName(b).toLowerCase();
    return lastNameA.localeCompare(lastNameB);
  });
}

/**
 * Retrieves contacts from the users array and sorts them by name.
 *
 * @return {void}
 */
function getContactsOutOfUsers() {
  const sourceUsers = Array.isArray(users) ? users : [];
  const tempContacts = [];
  sourceUsers.forEach((user) => {
    tempContacts.push({
      contactColor: user.contactColor,
      id: user.id,
      mail: user.mail,
      name: user.name,
      phone: user.phone,
    });
  });
  users = [];
  contacts = sortContactsByName(tempContacts);
}

/**
 * Finds the maximum id in the contacts array and returns the next id.
 *
 * @param {Array} contactsArray - An array of contacts with ids.
 * @return {number} The next id after the maximum id in contactsArray.
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
 * @return {Promise<void>} Promise that resolves once contacts are loaded.
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
 * @returns {void}
 */
function loadContacts() {
  const main = document.getElementById("main");
  main.innerHTML = ``;
  createContactsContainer(main);
  renderSortedContacts(main, contacts);
}

/**
 * Updates the color of each contact in contacts_old by mapping colors to newColors.
 *
 * @return {void}
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
