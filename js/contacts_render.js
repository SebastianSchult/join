/**
 * Generates HTML code for the contacts container.
 *
 * @function generateContactsContainerHTML
 * @returns {string} The HTML code for the contacts container.
 */
function generateContactsContainerHTML() {
    return /*html*/ ` 
    <div id="contactMainEdit" class="contact-main-edit" onclick="doNotClose(event)">

  </div>
  <div class="contact-list-container">
      <div class="add-contact-overlay"></div>
      <div id="addContactContainer" class="hidden">
      </div>
  </div>
  <button type="button" class="add-contact-button" onclick="addContactCard()" aria-label="Add new contact">
    <img src="./assets/img/Secondary mobile contact V1.png" alt="">
  </button>
  <div class="contacts-container-outer">
    <div class="contacts-container" id="contacts-container"> 
            <div id="button-add-contact-card" class="button-add-contact" onclick="addContactCard(); doNotClose(event)">
                <div class="add-new-contact">Add new contact</div>
                <img src="./assets/img/icon-person_add.png" alt="icon-person_add.png">
            </div>
        <div class="contact-list" id="contactList">
        </div>
    </div>
  </div>
  <section class="right-side d-none" id="rightSide" onclick="closeEditDelete()">
  
  </section>
      `;
  }

  /**
 * Renders the HTML code for the add contact form.
 *
 * @return {string} The HTML code for the add contact form.
 */
function renderAddContactsHTML() {
    return /*html*/ `
          <div class="add-contact-header">
              <div class="add-contact-header-close">
                  <button type="button" class="icon-action-button" onclick="closeOverlay('addContact')" aria-label="Close add contact form">
                      <img src="./assets/img/icon-close_white.png" alt="">
                  </button>
              </div>
          </div>
          <div class="add-contact-header-logo">
              <img src="./assets/img/logo-medium_white.png" alt="">
              <span>Add Contact</span>
              <p>Tasks are better with a team!</p>
          </div>
          <div class="add-contact-bottom">
              <div class="profile-badge-group-add-contact">
                  <div class="profile-badge-add-contact">
                      <img src="./assets/img/add.contact-badge.png" alt="">
                  </div>
              </div>
              <form onsubmit="saveContact(); return false" class="add-contact-input-group">
                  <div class="input-frame">
                      <label class="sr-only" for="contactName">Name</label>
                      <input id="contactName" type="text" placeholder="Name" autocomplete="name" autofocus required>
                      <img src="./assets/img/icon-person.png" alt="">
                  </div>
                  <div class="input-frame">
                      <label class="sr-only" for="contactMail">Email</label>
                      <input id="contactMail" type="email" placeholder="Email" autocomplete="email" autofocus required>
                      <img src="./assets/img/icon-mail.png" alt="">
                  </div>
                  <div class="input-frame">
                      <label class="sr-only" for="contactPhone">Phone</label>
                      <input id="contactPhone" pattern="[0-9]*" type="tel" placeholder="Phone" autocomplete="tel" autofocus required>
                      <img src="./assets/img/icon-call.png" alt="">
                  </div>
                  <div id="addContactButton" class="addContactButton">
                      <button type="button" class="cancelButton" onclick="closeOverlay('addContact')" onmouseover="changeCancelIcon()"
                          onmouseout="restoreCancelIcon()">Cancel
                          <img id="cancelIcon" src="./assets/img/icon-cancel.png" alt="">
                      </button>
                      <button type="submit" id="createBtn" class="createButton">Create contact
                          <img id="createIcon" src="./assets/img/icon-check.png" alt="">
                      </button>
                  </div>
              </form>
  </div>`;
  }


/**
 * Renders the HTML code for the edit contact form with the given ID.
 *
 * @param {number} id - The ID of the contact to be edited.
 * @return {string} The HTML code for the edit contact form.
 */
function renderEditContactHTML(id, name, contactColor) {
    const safeContactId = toSafeInteger(id);
    const safeContactColor = sanitizeCssColor(contactColor);
    const safeInitials = escapeHtml(getInitials(name || ""));

    return /*html*/ `
          <div class="edit-contact-header">
              <div class="edit-contact-header-close">
                  <button type="button" class="icon-action-button" onclick="closeOverlay('editContact')" aria-label="Close edit contact form">
                      <img src="./assets/img/icon-close_white.png" alt="">
                  </button>
              </div>
          </div>
          <div class="edit-contact-header-logo">
              <img src="./assets/img/logo-medium_white.png" alt="">
              <span>Edit contact</span>
              <p>Tasks are better with a team!</p>
          </div>
  
          <div class="edit-contact-bottom">
              <div class="profile-badge-group-add-contact">
                  <div class="profile-badge-add-contact"> 
                  <div class="contact-details-badge" style="background-color: ${safeContactColor}">
              <div class="contact-details-badge-initials">${safeInitials}</div>
            </div>
                  </div>
              </div>
              <form action="" onsubmit="saveEditedContact(${safeContactId}); return false" class="add-contact-input-group">
                  <div class="input-frame">
                      <label class="sr-only" for="contactName">Name</label>
                      <input id="contactName" type="text" placeholder="Name" autocomplete="name" autofocus required>
                      <img src="./assets/img/icon-person.png" alt="">
                  </div>
                  <div class="input-frame">
                      <label class="sr-only" for="contactMail">Email</label>
                      <input id="contactMail" type="email" placeholder="Email" autocomplete="email" autofocus required>
                      <img src="./assets/img/icon-mail.png" alt="">
                  </div>
                  <div class="input-frame">
                      <label class="sr-only" for="contactPhone">Phone</label>
                      <input id="contactPhone" type="tel" placeholder="Phone" autocomplete="tel" autofocus required>
                      <img src="./assets/img/icon-call.png" alt="">
                  </div>
                  <div id="addContactButton" class="addContactButton">
                      <button type="button" class="cancelButton" onclick="closeOverlay('editContact')" onmouseover="changeCancelIcon()"
                          onmouseout="restoreCancelIcon()">Cancel
                          <img id="cancelIcon" src="./assets/img/icon-cancel.png" alt="">
                      </button>
                      <button class="createButton" type="submit">Save
                          <img id="createIcon" src="./assets/img/icon-check.png" alt="">
                      </button>
                  </div>
              </form>
          </div>`;
  }


 /**
 * Generates the HTML code for a contact card.
 *
 * @param {number} contactId - The unique identifier for the contact.
 * @param {string} profileColor - The color associated with the contact's profile.
 * @param {string} initials - The initials of the contact.
 * @param {string} name - The name of the contact.
 * @param {string} email - The email address of the contact.
 * @param {string} shortEmail - The shortened version of the email address.
 * @return {string} The HTML code for the contact card.
 */
function generateContactCardHTML(
    contactId,
    profileColor,
    initials,
    name,
    email,
    shorterMail
  ) {
    const safeContactId = toSafeInteger(contactId);
    const safeProfileColor = sanitizeCssColor(profileColor);
    const safeInitials = escapeHtml(initials);
    const safeFormattedName = escapeHtml(getNameWithCapitalizedFirstLetter(name));
    const safeShorterMail = escapeHtml(shorterMail);

    return /*html*/ `
      <div class="contact-card" id="contact-card-${safeContactId}" onclick="openContactDetails(${safeContactId})">
        <div class="profile-badge-group" style="background-color: ${safeProfileColor}">${safeInitials}</div>
        <div>
          <span class="contact-card-name">${safeFormattedName}</span><br>
          <a class="contact-card-email">${safeShorterMail}</a>
        </div>
      </div>
    `;
  }

  
/**
 * Generates HTML code for displaying contact details.
 *
 * @function generateContactDetailsHTML
 * @param {string} name - The name of the contact.
 * @param {string} email - The email address of the contact.
 * @param {string} phone - The phone number of the contact.
 * @returns {string} The HTML code for displaying contact details.
 */
function generateContactDetailsHTML(name, email, phone, id, color) {
    const safeContactId = toSafeInteger(id);
    const safeContactName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeColor = sanitizeCssColor(color);
    const safeInitials = escapeHtml(getInitials(name || ""));
    const safeMailtoHref = sanitizeMailtoHref(email);

    return /*html*/ `
      <div class="contact-Details">
        <div class="contact-details-header-and-button">
          <div class="contact-details-header-responsive">Contact Information</div>
          <button type="button" class="contact-details-back-button" onclick="openContactDetails(${safeContactId})" aria-label="Back to contact list">
            <img src="./assets/img/icon-arrow_left.png">
          </button>
        </div>
        <div class="contact-details-header" id="contactDetailsHeader">
          <div class="contact-details-badge-group">
            <div class="contact-details-badge" style="background-color: ${safeColor}">
              <div class="contact-details-badge-initials">${safeInitials}</div>
            </div>
          </div>
          <div class="contact-details-name-group">
            <div class="contact-details-name">${safeContactName}</div>
            <div class="contact-details-icons">
              <div class="icon-edit" onclick="editContact(${safeContactId})">
                <img src="./assets/img/icon-edit.png" alt="">Edit
              </div>
              <div class="icon-delete" onclick="removeContact(${safeContactId})">
                <img src="./assets/img/icon-delete.png" alt="">Delete
              </div>
            </div>
          </div>
        </div>
        <div></div>
        <div class="contact-information">Contact Information</div>
          <div class="contact-email-container" id="contactEmailContainer">
            <div class="contact-information-mail-header" >Email</div>
            <a class="contact-information-mail" href="${safeMailtoHref}">${safeEmail}</a>
          </div>
        <div>
          <div class="contact-phone-container">
            <div class="contact-phone-container-header">Phone</div>
            <div class="contact-phone-container-phone">${safePhone}</div>
          </div>
        </div>
        <button type="button" class="openEditDeleteResponsive" id="openEditDeleteResponsive" onclick="openEditDelete(); doNotClose(event)" aria-label="Open contact actions menu">
          <img src="./assets/img/Menu Contact options.png" alt="">
        </button>
        <div class="editDelete d-none" id="editDelete" onclick="doNotClose(event)">
          <div class="editDiv" onclick="editContact(${safeContactId})">
            <img src="./assets/img/icon-edit.png" alt="">
            <span>Edit</span>
            </div>
          <div class="deleteDiv" onclick="removeContact(${safeContactId})">
              <img src="./assets/img/icon-delete.png" alt="">
              <span>Delete</span>
            </div>
        </div>
      </div>
    `;
  }
