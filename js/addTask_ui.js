"use strict";

(function registerAddTaskUiModule() {
    /** Sets add-task priority and syncs visual state plus task draft payload. */
    function atuSetPriority(priority) {
        atuSetPriorityAppearance(priority);
        setPriorityForNewCard(priority);
    }

    /** Applies active styling/icons for the selected priority button group. */
    function atuSetPriorityAppearance(priority) {
        document.querySelectorAll(".addTaskPriorityButton").forEach((button) => {
            button.style.backgroundColor = "white";
            button.classList.remove("active");
            button.querySelector(".priorityButtonText").style.color = "black";
            button.querySelector("img").src =
                `./assets/img/icon-priority_${button.id.toLowerCase().slice(21)}.png`;
        });

        const button = document.getElementById(`addTaskPriorityButton${priority}`);
        if (!button) {
            return;
        }

        button.style.backgroundColor = atuGetButtonColor(priority);
        button.classList.add("active");
        button.querySelector(".priorityButtonText").style.color = "white";
        button.querySelector("img").src =
            `./assets/img/icon-priority_${priority.toLowerCase()}_white.png`;
    }

    /** Replaces the subtask footer with an editable subtask input and focuses it. */
    function atuRenderSubtaskInputField() {
        let subtaskBottom = document.getElementById("subtaskBottom");
        if (!subtaskBottom) {
            return;
        }

        subtaskBottom.innerHTML = renderSubtaskInputFieldHTML();
        const inputField = document.getElementById("subtaskInputField");
        if (inputField) {
            inputField.focus();
        }
    }

    /** Handles add/cancel actions from the subtask input footer controls. */
    function atuSubtaskAddOrCancel(option) {
        let subtaskBottom = document.getElementById("subtaskBottom");
        let subtaskInputField = document.getElementById("subtaskInputField");
        if (!subtaskBottom || !subtaskInputField) {
            return;
        }

        if (option == "add" && subtaskInputField.value != "") {
            addSubtask();
        }

        subtaskBottom.innerHTML = renderSubtaskDefaultHTML();
        subtaskBottom.dataset.action = "render-subtask-input-field";
    }

    /** Renders all draft subtasks into the add-task output container. */
    function atuRenderSubtasks() {
        let outputContainer = document.getElementById("subtasksOutputContainer");
        if (!outputContainer) {
            return;
        }

        outputContainer.innerHTML = "";
        for (let i = 0; i < newTask.subtasks.length; i++) {
            let subtask = newTask.subtasks[i];
            renderSubtaskHTML(outputContainer, subtask);
        }
    }

    /** Returns true when any subtask row is currently in inline edit mode. */
    function atuCheckIfAnySubtaskIsInEditingMode() {
        let subtaskContainers = document.getElementsByClassName("subTaskOutputDiv");
        for (let i = 0; i < subtaskContainers.length; i++) {
            let subtaskContainer = subtaskContainers[i];
            if (subtaskContainer.classList.contains("editing")) {
                return true;
            }
        }
        return false;
    }

    /** Maps a priority value to its configured add-task button color. */
    function atuGetButtonColor(priority) {
        switch (priority) {
            case "urgent":
                return "#ff3d00";
            case "medium":
                return "#ffa800";
            case "low":
                return "#7ae229";
            default:
                return "white";
        }
    }

    /** Renders contact options into the assigned-to dropdown list. */
    function atuRenderContactsToDropdown() {
        let content = document.getElementById("dropdown-content-assignedTo");
        if (!content) {
            return;
        }

        content.innerHTML = "";
        contacts.forEach((contact) => {
            const safeContactId = toSafeInteger(contact && contact.id);
            const safeContactName = escapeHtml(contact && contact.name);

            content.innerHTML += /*html*/ `<button type="button" class="dropdownOption" id="assignedToContact${safeContactId}" marked=false data-action="assign-contact-to-task" data-contact-id="${safeContactId}">
            <span class="dropdownContactBadgeAndName">${renderAssignedToButtonsHTML(contact)} ${safeContactName}</span> <img src="./assets/img/icon-check_button_unchecked.png" alt="">
            </button>`;
        });
    }

    /** Opens the browser date picker for the due-date field when supported. */
    function atuAddTaskDueDateOpenCalendear() {
        const dueDateInput = document.getElementById("addTaskDueDateInput");
        if (dueDateInput && typeof dueDateInput.showPicker === "function") {
            dueDateInput.showPicker();
        }
    }

    /** Toggles selected appearance and checkbox icon for an assigned contact row. */
    function atuSetDropdownContactAppearance(dropdownContact, dropdownCheckboxImage) {
        if (!dropdownContact || !dropdownCheckboxImage) {
            return;
        }

        if (dropdownContact.getAttribute("marked") == "false") {
            dropdownContact.setAttribute("marked", "true");
            dropdownCheckboxImage.src = "./assets/img/icon-check_button_checked_white.png";
        } else {
            dropdownContact.setAttribute("marked", "false");
            dropdownCheckboxImage.src = "./assets/img/icon-check_button_unchecked.png";
        }
    }

    /** Shows or hides the assigned-contact badge container based on selection state. */
    function atuToggleAssignedContactsContainer() {
        let contactCards = document.getElementById("dropdown-content-assignedTo")?.childNodes;
        let assignedContactsContainer = document.getElementById("assignedContactsContainer");
        if (!contactCards || !assignedContactsContainer) {
            return;
        }

        let empty = true;
        for (let i = 0; i < contactCards.length; i++) {
            if (contactCards[i].getAttribute("marked") == "true") {
                assignedContactsContainer.classList.remove("d-none");
                empty = false;
                break;
            }
        }

        if (empty) {
            assignedContactsContainer.classList.add("d-none");
        }
    }

    /** Renders assigned contact badges from temporary contact id state. */
    function atuRenderAssignedContactsContainer() {
        let container = document.getElementById("assignedContactsContainer");
        if (!container) {
            return;
        }

        container.innerHTML = "";
        tempAssignedContacts.forEach((id) => {
            let contact = contacts.find((entry) => entry.id == id);
            container.innerHTML += renderAssignedToButtonsHTML(contact);
        });
    }

    /** Applies selected category and closes category dropdown accessibility state. */
    function atuChooseCategory(chosenCategory) {
        let categoryContainer = document.getElementById("dropdown-category-title");
        if (categoryContainer) {
            categoryContainer.innerHTML = chosenCategory;
        }

        if (typeof AddTaskDropdown === "object") {
            if (typeof AddTaskDropdown.closeDropdown === "function") {
                AddTaskDropdown.closeDropdown("dropdown-content-category", {
                    restoreFocus: true,
                });
            }
            if (typeof AddTaskDropdown.setCloseDropdownContainer === "function") {
                AddTaskDropdown.setCloseDropdownContainer();
            }
        }

        newTask.type = chosenCategory;
    }

    /** Checks whether any element in the current DOM is marked with editing mode. */
    function atuCheckIfCardIsEditing() {
        let editing = document.getElementsByTagName("*");
        for (let element of editing) {
            if (element.hasAttribute("editing")) {
                return true;
            }
        }
        return false;
    }

    window.AddTaskUi = Object.freeze({
        setPriority: atuSetPriority,
        setPriorityAppearance: atuSetPriorityAppearance,
        renderSubtaskInputField: atuRenderSubtaskInputField,
        subtaskAddOrCancel: atuSubtaskAddOrCancel,
        renderSubtasks: atuRenderSubtasks,
        checkIfAnySubtaskIsInEditingMode: atuCheckIfAnySubtaskIsInEditingMode,
        getButtonColor: atuGetButtonColor,
        renderContactsToDropdown: atuRenderContactsToDropdown,
        addTaskDueDateOpenCalendear: atuAddTaskDueDateOpenCalendear,
        setDropdownContactAppearance: atuSetDropdownContactAppearance,
        toggleAssignedContactsContainer: atuToggleAssignedContactsContainer,
        renderAssignedContactsContainer: atuRenderAssignedContactsContainer,
        chooseCategory: atuChooseCategory,
        checkIfCardIsEditing: atuCheckIfCardIsEditing,
    });
})();
