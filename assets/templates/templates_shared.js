/**
 * Generates the HTML for the navigation menu.
 *
 * This includes links to the summary, add task, board, and contacts pages
 * as well as links to the privacy policy and legal notice. Each link is
 * represented as a navigation button with an associated icon.
 *
 * @return {string} The HTML code for the navigation menu.
 */

function renderNavigationHTML() {
  return /* html */ `
	<div class="navigation-content">
	<div id="nav-wrapper" class="nav-wrapper">
		<div class="nav-buttons-box">
		<a href="./summary.html" id="summary" class="nav-btn">
			<img class="navImg" src="./assets/img/icon-summary.png" alt="summary" />Summary
		</a>
		<a href="./addTask.html" id="addTask" class="nav-btn">
			<img src="./assets/img/icon-addTask.png" alt="add task" />Add Task
		</a>
		<a href="./board.html" id="board" class="nav-btn">
			<img src="./assets/img/icon-board.png" alt="board" />Board
		</a>
		<a href="./contacts.html" id="contacts" class="nav-btn">
			<img src="./assets/img/icon-contacts.png" alt="contacts" />Contacts
		</a>
		</div>

		<div class="privatePolicyAndLegalNoticeLinksNav">
		<div id="privacyNav">
			<a href=" ./privacy.html">Privacy Policy</a>
		</div>
		<div id="legalNav">
			<a href="./legal_notice.html">Legal Notice</a>
		</div>
		</div>
	</div>
</div>`;
}

/**
 * Renders the HTML for a profile badge with the given contact information.
 *
 * @param {object} contact - The contact object containing the color and name.
 * @return {string} The HTML code for the profile badge.
 */
function renderAssignedToButtonsHTML(contact) {
  const contactName =
    contact && typeof contact.name === "string" ? contact.name : "";
  const safeContactColor = sanitizeCssColor(contact && contact.contactColor);
  const safeInitials = escapeHtml(getInitials(contactName));

  return /*html*/ `<span class="profile-badge-group" style="background-color: ${
    safeContactColor
  }">${safeInitials}</span>`;
}
