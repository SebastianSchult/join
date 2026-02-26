"use strict";

(function registerAddTaskFormDomainModule() {
    function atfSetTodayDateAsMin() {
        let date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        const year = date.getFullYear();

        if (month < 10) month = "0" + month;
        if (day < 10) day = "0" + day;

        const todayDate = `${year}-${month}-${day}`;
        const dueDateInput = document.getElementById("addTaskDueDateInput");
        if (dueDateInput) {
            dueDateInput.setAttribute("min", todayDate);
        }
    }

    function atfCheckValidity() {
        if (!atfHasRequiredInputFields()) {
            return;
        }

        requiredInputFields.forEach((requiredInputField) => {
            const inputField = document.getElementById(requiredInputField.id);
            if (inputField) {
                inputField.addEventListener("input", () => {
                    atfToggleRequiredMessage(requiredInputField);
                });
            }
            atfToggleRequiredMessage(requiredInputField);
        });
    }

    function atfGetStateOfRequriredField(requiredInputField) {
        let inputField = document.getElementById(requiredInputField.id);
        if (!inputField) {
            return false;
        }

        if (inputField.value == "") {
            inputField.style = "color: #D1D1D1 !important";
            return false;
        }

        inputField.style = "color: black !important";
        return true;
    }

    function atfSetCreateBtnState() {
        if (!atfHasRequiredInputFields()) {
            atfDeactivateButton("createBtn");
            return;
        }

        if (requiredInputFields.every((requiredField) => requiredField.state === true)) {
            atfActivateButton("createBtn", "create-task");
        } else {
            atfDeactivateButton("createBtn");
        }
    }

    function atfActivateButton(id, actionName) {
        const button = document.getElementById(id);
        if (!button) {
            return;
        }

        button.classList.remove("disabled");
        if (button.tagName === "BUTTON") {
            button.disabled = false;
            button.setAttribute("aria-disabled", "false");
        }

        if (actionName) {
            button.dataset.action = actionName;
        }
    }

    function atfDeactivateButton(id) {
        const button = document.getElementById(id);
        if (!button) {
            return;
        }

        button.classList.add("disabled");
        if (button.tagName === "BUTTON") {
            button.disabled = true;
            button.setAttribute("aria-disabled", "true");
        }
        delete button.dataset.action;
    }

    function atfMapTaskPayloadFromForm(taskDraft, options = {}) {
        if (!taskDraft || typeof taskDraft !== "object") {
            return taskDraft;
        }

        const titleInput = document.getElementById("addTaskEnterTitleInput");
        const descriptionInput = document.getElementById("addTaskDescriptionInput");
        const dueDateInput = document.getElementById("addTaskDueDateInput");

        taskDraft.title = titleInput ? titleInput.value : "";
        taskDraft.description = descriptionInput ? descriptionInput.value : "";
        taskDraft.dueDate = dueDateInput ? dueDateInput.value : "";

        if (Array.isArray(options.assignedTo)) {
            taskDraft.assignedTo = options.assignedTo;
        }

        const defaultType = typeof options.defaultType === "string" ? options.defaultType : "";
        if (taskDraft.type === "" && defaultType !== "") {
            taskDraft.type = defaultType;
        }

        return taskDraft;
    }

    function atfToggleRequiredMessage(requiredInputField) {
        let requiredMessageField = document.getElementById(requiredInputField.requiredFieldId);
        let toUnderline = document.getElementById(requiredInputField.idForRedUnderline);
        let inputField = document.getElementById(requiredInputField.id);

        if (inputField) {
            inputField.setAttribute("aria-describedby", requiredInputField.requiredFieldId);
        }

        if (atfGetStateOfRequriredField(requiredInputField)) {
            requiredInputField.state = true;
            if (toUnderline) {
                toUnderline.classList.remove("is-invalid");
            }
            if (inputField) {
                inputField.setAttribute("aria-invalid", "false");
            }
            if (requiredMessageField) {
                requiredMessageField.textContent = "";
            }
        } else {
            requiredInputField.state = false;
            if (toUnderline) {
                toUnderline.classList.add("is-invalid");
            }
            if (inputField) {
                inputField.setAttribute("aria-invalid", "true");
            }
            if (requiredMessageField) {
                requiredMessageField.textContent = "This field is required";
            }
        }

        atfSetCreateBtnState();
    }

    function atfHasRequiredInputFields() {
        return typeof requiredInputFields !== "undefined" && Array.isArray(requiredInputFields);
    }

    window.AddTaskFormDomain = Object.freeze({
        setTodayDateAsMin: atfSetTodayDateAsMin,
        checkValidity: atfCheckValidity,
        getStateOfRequriredField: atfGetStateOfRequriredField,
        setCreateBtnState: atfSetCreateBtnState,
        activateButton: atfActivateButton,
        deactivateButton: atfDeactivateButton,
        mapTaskPayloadFromForm: atfMapTaskPayloadFromForm,
    });
})();
