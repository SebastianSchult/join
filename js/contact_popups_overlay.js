"use strict";

(function registerContactPopupOverlayModule() {
  let contactOverlayOpener = null;
  let contactsKeyboardAccessibilityRegistered = false;
  let editDeleteMenuOpener = null;

  /** Opens the add-contact dialog, overlay backdrop, and focus trap context. */
  function cpoAddContactCard() {
    contactOverlayOpener = document.activeElement;
    if (!document.getElementById("addContact")) {
      cpoRenderAddContacts();
    }
    document.getElementById("addContact").innerHTML = renderAddContactsHTML();
    cpoAddOverlay("addContact");
    activateFocusLayer("addContact", {
      opener: contactOverlayOpener,
      initialFocus: "#contactName",
      onEscape: () => cpoCloseOverlay("addContact"),
    });
  }

  /**
   * Appends a shared fullscreen overlay backdrop for contact dialogs.
   *
   * @param {string} overlayId - Dialog id that should close on overlay click.
   * @returns {void}
   */
  function cpoAddOverlay(overlayId) {
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    overlay.dataset.action = "close-overlay";
    overlay.dataset.overlayId = overlayId;

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
  }

  /**
   * Closes a contact dialog, removes overlay backdrop, and restores scroll/focus state.
   *
   * @param {string} id - Dialog id to close and remove.
   * @returns {void}
   */
  function cpoCloseOverlay(id) {
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
    if (overlay) {
      overlay.remove();
    }

    document.body.style.overflow = "auto";
    setTimeout(() => {
      removeContainer(id);
    }, 100);
  }

  /** Creates and mounts the add-contact dialog container if missing. */
  function cpoRenderAddContacts() {
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

  /** Creates and mounts the edit-contact dialog container if missing. */
  function cpoRenderEditContact() {
    let newDiv = document.createElement("div");
    newDiv.id = "editContact";
    setAttributes(newDiv, {
      class: "edit-contact",
      role: "dialog",
      "aria-modal": "true",
    });
    document.getElementById("contactMainEdit").appendChild(newDiv);
  }

  /** Unhides the add-contact host container in responsive layouts. */
  function cpoShowAddContactContainer() {
    const addContactContainer = document.getElementById("addContactContainer");
    addContactContainer.classList.remove("hidden");
  }

  /** Opens responsive edit/delete menu and moves keyboard focus into it. */
  function cpoOpenEditDelete() {
    const openButton = document.getElementById("openEditDeleteResponsive");
    const editDeleteMenu = document.getElementById("editDelete");
    if (!openButton || !editDeleteMenu) {
      return;
    }

    cpoRegisterContactsKeyboardAccessibility();
    editDeleteMenuOpener = openButton;

    openButton.classList.add("d-none");
    openButton.setAttribute("aria-expanded", "true");
    editDeleteMenu.classList.remove("d-none");
    editDeleteMenu.setAttribute("tabindex", "-1");

    const firstMenuButton = editDeleteMenu.querySelector("button");
    focusElementIfPossible(firstMenuButton || editDeleteMenu);
  }

  /**
   * Closes responsive edit/delete menu and optionally restores opener focus.
   *
   * @param {{restoreFocus?: boolean}} [options={}] - Close behavior options.
   * @returns {void}
   */
  function cpoCloseEditDelete(options = {}) {
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

  /** Registers global keyboard handling for responsive contact action menu. */
  function cpoRegisterContactsKeyboardAccessibility() {
    if (contactsKeyboardAccessibilityRegistered) {
      return;
    }

    document.addEventListener("keydown", cpoHandleContactsKeyboardAccessibility, true);
    contactsKeyboardAccessibilityRegistered = true;
  }

  /**
   * Handles ESC and TAB focus loop behavior for responsive contact action menu.
   *
   * @param {KeyboardEvent} event - Native keydown event.
   * @returns {void}
   */
  function cpoHandleContactsKeyboardAccessibility(event) {
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
      cpoCloseEditDelete({ restoreFocus: true });
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
   * Opens edit-contact dialog prefilled with selected contact values.
   *
   * @param {{id:number,name:string,contactColor:string}} contact - Contact to edit.
   * @returns {void}
   */
  function cpoEditContactCard(contact) {
    contactOverlayOpener = document.activeElement;
    if (!document.getElementById("editContact")) {
      cpoRenderEditContact();
    }
    document.getElementById("editContact").innerHTML = renderEditContactHTML(
      contact.id,
      contact.name,
      contact.contactColor
    );
    cpoAddOverlay("editContact");
    activateFocusLayer("editContact", {
      opener: contactOverlayOpener,
      initialFocus: "#contactName",
      onEscape: () => cpoCloseOverlay("editContact"),
    });
  }

  window.ContactPopupOverlay = Object.freeze({
    addContactCard: cpoAddContactCard,
    closeOverlay: cpoCloseOverlay,
    openEditDelete: cpoOpenEditDelete,
    closeEditDelete: cpoCloseEditDelete,
    editContactCard: cpoEditContactCard,
    showAddContactContainer: cpoShowAddContactContainer,
  });
})();
