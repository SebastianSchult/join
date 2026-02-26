"use strict";

(function registerAddTaskKeyboardModule() {
    let atkKeyboardAccessibilityRegistered = false;

    function atkRegisterAddTaskKeyboardAccessibility() {
        if (atkKeyboardAccessibilityRegistered) {
            return;
        }

        document.addEventListener("keydown", atkHandleAddTaskKeyboardAccessibility);
        atkKeyboardAccessibilityRegistered = true;
    }

    function atkHandleAddTaskKeyboardAccessibility(event) {
        if (event.defaultPrevented) {
            return;
        }

        const dropdownModule = window.AddTaskDropdown;
        if (!dropdownModule || typeof dropdownModule.getActiveDropdownState !== "function") {
            return;
        }

        const activeState = dropdownModule.getActiveDropdownState();
        if (!activeState || !activeState.contentContainerId) {
            return;
        }

        const dropdownContainer = document.getElementById(activeState.contentContainerId);
        if (!dropdownContainer || !dropdownContainer.classList.contains("dropdown-opened")) {
            if (typeof dropdownModule.clearActiveDropdownState === "function") {
                dropdownModule.clearActiveDropdownState();
            }
            return;
        }

        if (event.key === "Escape") {
            if (
                typeof dropdownModule.closeDropdown === "function" &&
                dropdownModule.closeDropdown(activeState.contentContainerId, { restoreFocus: true })
            ) {
                if (typeof dropdownModule.setCloseDropdownContainer === "function") {
                    dropdownModule.setCloseDropdownContainer();
                }
                event.preventDefault();
                event.stopPropagation();
            }
            return;
        }

        if (event.key !== "Tab") {
            return;
        }

        const focusableControls =
            typeof getFocusableElements === "function"
                ? getFocusableElements(dropdownContainer)
                : Array.from(
                      dropdownContainer.querySelectorAll(
                          "button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex='-1'])"
                      )
                  );

        if (focusableControls.length === 0) {
            event.preventDefault();
            focusElementIfPossible(dropdownContainer);
            return;
        }

        const first = focusableControls[0];
        const last = focusableControls[focusableControls.length - 1];
        const activeElement = document.activeElement;

        if (event.shiftKey) {
            if (activeElement === first || !dropdownContainer.contains(activeElement)) {
                event.preventDefault();
                focusElementIfPossible(last);
            }
            return;
        }

        if (activeElement === last || !dropdownContainer.contains(activeElement)) {
            event.preventDefault();
            focusElementIfPossible(first);
        }
    }

    window.AddTaskKeyboard = Object.freeze({
        registerAddTaskKeyboardAccessibility: atkRegisterAddTaskKeyboardAccessibility,
        handleAddTaskKeyboardAccessibility: atkHandleAddTaskKeyboardAccessibility,
    });
})();
