"use strict";

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
 *
 * @param {number} id - The unique identifier of the contact.
 */
function openContactDetails(id) {
  const contact = contacts.find(({ id: contactId }) => contactId === id);
  if (!contact) {
    return;
  }
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

  if (!selectedContactCard || !rightSideElement) {
    return;
  }

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
 * @returns {void}
 */
function applyHighlight() {
  let allContactCards = document.getElementsByClassName("contact-card");
  for (const card of allContactCards)
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
