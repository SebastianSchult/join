"use strict";

(function registerAddTaskDropdownModule() {
    const ATD_DROPDOWN_ARROW_BY_CONTENT_ID = {
        "dropdown-content-assignedTo": "custom-arrow-assignedTo",
        "dropdown-content-category": "custom-arrow-category",
    };

    let atdActiveDropdownState = null;

    function atdRenderArrow(arrowContainerId, contentContainerId) {
        const dropdownContainer = document.getElementById(contentContainerId);
        if (!dropdownContainer) {
            return;
        }

        const shouldOpen = !dropdownContainer.classList.contains("dropdown-opened");

        atdCloseOpenDropdowns({ restoreFocus: false });

        if (shouldOpen) {
            atdOpenDropdown(arrowContainerId, contentContainerId);
        }

        atdSetCloseDropdownContainer();
    }

    function atdOpenDropdown(arrowContainerId, contentContainerId) {
        const dropdownContainer = document.getElementById(contentContainerId);
        if (!dropdownContainer) {
            return;
        }

        const arrowContainer = document.getElementById(arrowContainerId);
        const arrowImg = arrowContainer
            ? arrowContainer.querySelector("img[data-direction]")
            : null;
        if (arrowImg) {
            arrowImg.dataset.direction = "up";
            arrowImg.src = `./assets/img/icon-arrow_dropdown_${arrowImg.dataset.direction}.png`;
        }

        dropdownContainer.classList.remove("d-none");
        dropdownContainer.classList.add("dropdown-opened");

        const opener = arrowContainer ? arrowContainer.closest("button") : null;
        if (opener) {
            opener.setAttribute("aria-expanded", "true");
            opener.setAttribute("aria-controls", contentContainerId);
        }

        atdActiveDropdownState = {
            contentContainerId,
            opener,
        };

        atdFocusFirstDropdownControl(dropdownContainer);
    }

    function atdCloseDropdown(contentContainerId, options = {}) {
        const dropdownContainer = document.getElementById(contentContainerId);
        if (!dropdownContainer || !dropdownContainer.classList.contains("dropdown-opened")) {
            return false;
        }

        const { restoreFocus = false } = options;
        const arrowContainerId = ATD_DROPDOWN_ARROW_BY_CONTENT_ID[contentContainerId];
        const arrowContainer = arrowContainerId
            ? document.getElementById(arrowContainerId)
            : null;
        const arrowImg = arrowContainer
            ? arrowContainer.querySelector("img[data-direction]")
            : null;
        if (arrowImg) {
            arrowImg.dataset.direction = "down";
            arrowImg.src = `./assets/img/icon-arrow_dropdown_${arrowImg.dataset.direction}.png`;
        }

        dropdownContainer.classList.add("d-none");
        dropdownContainer.classList.remove("dropdown-opened");

        const openerFromState =
            atdActiveDropdownState &&
            atdActiveDropdownState.contentContainerId === contentContainerId
                ? atdActiveDropdownState.opener
                : null;

        const opener = openerFromState || (arrowContainer ? arrowContainer.closest("button") : null);
        if (opener) {
            opener.setAttribute("aria-expanded", "false");
        }

        if (restoreFocus) {
            focusElementIfPossible(opener);
        }

        if (
            atdActiveDropdownState &&
            atdActiveDropdownState.contentContainerId === contentContainerId
        ) {
            atdActiveDropdownState = null;
        }

        return true;
    }

    function atdCloseOpenDropdowns(options = {}) {
        const { restoreFocus = false } = options;
        const openedDropdowns = Array.from(
            document.getElementsByClassName("dropdown-opened")
        );
        if (openedDropdowns.length === 0) {
            return false;
        }

        openedDropdowns.forEach((dropdownContainer, index) => {
            const isLast = index === openedDropdowns.length - 1;
            atdCloseDropdown(dropdownContainer.id, {
                restoreFocus: restoreFocus && isLast,
            });
        });

        atdSetCloseDropdownContainer();
        return true;
    }

    function atdInitializeDropdownAccessibilityState() {
        document
            .querySelectorAll(
                ".addTask-dropdown-contact, .addTask-dropdown-category"
            )
            .forEach((triggerButton) => {
                triggerButton.setAttribute("aria-expanded", "false");
                triggerButton.setAttribute("aria-haspopup", "listbox");
            });
    }

    function atdFocusFirstDropdownControl(dropdownContainer) {
        if (!dropdownContainer) {
            return;
        }
        const firstControl = dropdownContainer.querySelector(
            "button, a[href], input:not([disabled]), [tabindex]:not([tabindex='-1'])"
        );
        focusElementIfPossible(firstControl);
    }

    function atdSetCloseDropdownContainer() {
        const openedDropdowns = document.getElementsByClassName("dropdown-opened");
        const container = atdGetContainerToSetDropdownCloseAction();
        if (!container) {
            return;
        }

        if (openedDropdowns.length !== 0) {
            for (let i = 0; i < openedDropdowns.length; i++) {
                if (openedDropdowns[i].id === "dropdown-content-assignedTo") {
                    container.dataset.action = "toggle-addtask-dropdown";
                    container.dataset.arrowContainer = "custom-arrow-assignedTo";
                    container.dataset.contentContainer = "dropdown-content-assignedTo";
                }
                if (openedDropdowns[i].id === "dropdown-content-category") {
                    container.dataset.action = "toggle-addtask-dropdown";
                    container.dataset.arrowContainer = "custom-arrow-category";
                    container.dataset.contentContainer = "dropdown-content-category";
                }
            }
            return;
        }

        delete container.dataset.action;
        delete container.dataset.arrowContainer;
        delete container.dataset.contentContainer;
    }

    function atdGetContainerToSetDropdownCloseAction() {
        if (window.location.href.includes("addTask")) {
            return document.getElementById("bodyContent");
        }

        if (document.getElementById("openCardContainer")) {
            return document.getElementById("openCardContainer");
        }

        return document.getElementById("addTaskHoverContainer");
    }

    function atdGetActiveDropdownState() {
        return atdActiveDropdownState;
    }

    function atdClearActiveDropdownState() {
        atdActiveDropdownState = null;
    }

    window.AddTaskDropdown = Object.freeze({
        renderArrow: atdRenderArrow,
        openDropdown: atdOpenDropdown,
        closeDropdown: atdCloseDropdown,
        closeOpenDropdowns: atdCloseOpenDropdowns,
        initializeDropdownAccessibilityState: atdInitializeDropdownAccessibilityState,
        setCloseDropdownContainer: atdSetCloseDropdownContainer,
        getContainerToSetDropdownCloseAction: atdGetContainerToSetDropdownCloseAction,
        focusFirstDropdownControl: atdFocusFirstDropdownControl,
        getActiveDropdownState: atdGetActiveDropdownState,
        clearActiveDropdownState: atdClearActiveDropdownState,
    });
})();
