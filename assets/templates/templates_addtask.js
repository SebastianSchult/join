/**
 * Renders the HTML for the header of the add task overlay.
 *
 * @return {string} The rendered HTML.
 */
function renderBoardAddTaskHeaderHTML() {
  return /*html*/ `
    <div class="boardAddTaskHeader">
    <div class="boardAddTaskHeaderText">Add Task</div>
    <button type="button" class="boardAddTaskCloseHoverContainer" data-action="hide-add-task-container" aria-label="Close add task overlay"></button>
 </div>`;
}

/**
 * Renders the main content HTML for adding a task.
 *
 * This function generates a structured HTML layout containing input fields and
 * dropdowns for task details such as title, description, due date, priority,
 * assigned contacts, category, subtasks, and images. It includes interactive
 * elements for selecting priorities and categories, as well as buttons for
 * adding subtasks and images.
 *
 * @return {string} The HTML string for the task addition interface.
 */

function renderAddTaskMainContentHTML() {
  return /*html*/ `<div class="addTaskBodyLeft">
        <div class="addTaskBodyTop">
            <div class="addTaskAddTitleContainer">
                <label class="sr-only" for="addTaskEnterTitleInput">Task title</label>
                <input type="text" id="addTaskEnterTitleInput" placeholder="Enter a title" aria-describedby="requiredTitle" aria-invalid="false" required>
                <div class="addTaskRequired" id="requiredTitle" role="alert" aria-live="polite"></div>
            </div>
            <div class="addTaskDescription">
                <div class="addTaskTitles"><span class="bold">Description</span> (optional)</div>
                <div>
                <div class="textAreaContainer">
                    <label class="sr-only" for="addTaskDescriptionInput">Task description</label>
                    <textarea id="addTaskDescriptionInput" type="text" placeholder="Enter a description"></textarea>
                </div>
            </div>
            </div>
            <div class="addTaskDueDate ">
                <div class="addTaskTitles"><span class="bold">Due date</span></div>
                <div>
                    <div class="addTaskDueDateInputContainer border-bottom pointer" id="addTaskDueDateInputContainer">
                        <label class="sr-only" for="addTaskDueDateInput">Due date</label>
                        <input class="addTaskDueDateInput" id="addTaskDueDateInput" type="date" aria-describedby="requiredDueDate" aria-invalid="false" value="">
                        <button type="button" class="addTaskDueDateImage" data-action="open-due-date-picker" aria-label="Open due date picker"></button>
                    </div>
                    <div class="addTaskRequired" id="requiredDueDate" role="alert" aria-live="polite"></div>
                </div>
            </div>
        </div>
        <div class="addTaskBodyBottom">
        <div class="addTaskPriority">
            <div class="addTaskTitles bold">Priority</div>
            <div class="addTaskPriorityButtonContainer">
                <button type="button" id="addTaskPriorityButtonurgent" class="addTaskPriorityButton" data-action="set-priority" data-priority="urgent">
                    <span class="priorityButtonText">Urgent</span>
                    <img src="./assets/img/icon-priority_urgent.png" alt="Priority urgent">
                </button>
                <button type="button" id="addTaskPriorityButtonmedium" class="addTaskPriorityButton" data-action="set-priority" data-priority="medium">
                    <span class="priorityButtonText">Medium</span>
                    <img src="./assets/img/icon-priority_medium.png" alt="Priority medium">
                </button>
                <button type="button" id="addTaskPriorityButtonlow" class="addTaskPriorityButton" data-action="set-priority" data-priority="low">
                    <span class="priorityButtonText">Low</span>
                    <img src="./assets/img/icon-priority_low.png" alt="Priority low">
                </button>

            </div>
        </div>
        <div class="addTaskContainer">
            <div class="addTaskTitle"><span class="bold">Assigned to</span> (optional)</div>
            <button type="button" class="addTask-dropdown-contact pointer border-bottom" data-action="toggle-addtask-dropdown" data-arrow-container="custom-arrow-assignedTo" data-content-container="dropdown-content-assignedTo" data-stop-propagation="true">
                <span class="addTask-custom-select">
                    <span id="dropdown-assignedTo-title">Select contacts to assign</span>
                    <span class="addTask-custom-arrow" id="custom-arrow-assignedTo">
                        <img data-direction="down" src="./assets/img/icon-arrow_dropdown_down.png" alt="">
                    </span>
                </span>
            </button>
                <div class="addTask-dropdown-content d-none" data-stop-propagation="true" id="dropdown-content-assignedTo">
                </div>
                <div id="assignedContactsContainer" class="assignedContactsContainer cardAssignedToContainer d-none"></div>
        </div>
        <div class="addTaskContainer ">
            <div class="addTaskTitle bold">Category </div>
            <button type="button" class="addTask-dropdown-category pointer border-bottom" data-action="toggle-addtask-dropdown" data-arrow-container="custom-arrow-category" data-content-container="dropdown-content-category" data-stop-propagation="true">
                <span class="addTask-custom-select">
                    <span id="dropdown-category-title">Select task category</span>
                        <span class="addTask-custom-arrow" id="custom-arrow-category">
                        <img data-direction="down" src="./assets/img/icon-arrow_dropdown_down.png" alt="">
                    </span>
                </span>
            </button>
            <div class="addTask-dropdown-content d-none no-scroll" data-stop-propagation="true" id="dropdown-content-category">
                <button type="button" class="dropdownOption" data-action="choose-category" data-category="Technical Task">Technical Task</button>
                <button type="button" class="dropdownOption" data-action="choose-category" data-category="User Story">User Story</button>
            </div>
        </div>
        <div class="addTaskContainer">
            <div class="addTaskTitles"><span class="bold">Subtasks</span> (optional)
            </div>
            <button type="button" id="subtaskBottom" class="subtaskBottom border-bottom" data-action="render-subtask-input-field">
                <span id="subtaskInputFieldDiv">Add new subtask</span>
                <span id="subtaskImgAddPlus" class="subtaskImgDiv pointer"></span>
            </button>
            <div id="subtasksOutputContainer"></div>
        </div>


        <div class="addTaskContainer">
            <div class="addTaskTitles"><span class="bold">Attachments</span> (optional)</div>
            <div id="addImageBottom" class="addImageBottom border-bottom">
            <button type="button" class="uploadImageButton" data-action="open-filepicker" aria-label="Upload attachment">
            <img src="./assets/img/upload.png" alt="upload">
            </button>
            <input type="file" id="filepicker" style="display: none" accept="image/*" multiple dropzone="copy">
            
            </div>
            <div id="subtasksImageContainer"></div>
        </div>

        <div id="addTaskBodyRight" class="addTaskBodyRight"></div>
    </div>`;
}

function renderAddTaskFooterHTML() {
  return /*html*/ `
            <div class="addTaskBtnContainer">
                <button type="button" class="clearBtn addTaskBtn" data-action="clear-formular">
                    <span class="addTaskBtnText">Clear</span>
                    <span class="clearBtnImg"></span>
                </button>
                <button type="button" id="createBtn" class="createBtn addTaskBtn disabled" disabled aria-disabled="true">
                    <span class="addTaskBtnText">Create Task</span>
                    <span class="createBtnImg"></span>
                </button>
        </div>`;
}

/**
 * Renders the HTML for a subtask in edit mode.
 *
 * @param {Object} subtask - The subtask object containing the details to render.
 * @return {string} The HTML string for the subtask in edit mode.
 */
function editSubtaskHTML(subtask) {
  const safeSubtaskId = toSafeInteger(subtask && subtask.id);
  const safeSubtaskText = escapeHtml(subtask && subtask.subtaskText);

  return /*html*/ `
        <label class="sr-only" for="subtaskEditInputField">Edit subtask</label>
        <input type="text" id="subtaskEditInputField" value="${safeSubtaskText}">
        <div class="subtaskCheckboxes">
        <button type="button" class="subtaskImgDiv pointer" id="subtaskImgDelete" data-action="delete-subtask" data-subtask-id="${safeSubtaskId}" aria-label="Delete subtask"></button><div class="vLine"></div>
            <button type="button" class="subtaskImgDiv pointer" id="subtaskImgAddCheck" data-action="save-edit-subtask" data-subtask-id="${safeSubtaskId}" aria-label="Save subtask"></button>
        </div>`;
}

/**
 * Renders the HTML for the subtask input field with add and cancel buttons.
 *
 * The rendered HTML is a container containing an input field and a div with two
 * child divs for the add and cancel buttons. The add button will add a new subtask
 * to the subtask array and render the subtasks, while the cancel button will
 * cancel the input process and clear the input field.
 *
 * @return {string} The HTML string for the subtask input field with add and cancel buttons.
 */
function renderSubtaskInputFieldHTML() {
  return /*html*/ `
     <label class="sr-only" for="subtaskInputField">Subtask</label>
     <input type="text" id="subtaskInputField" placeholder="Add new subtask" data-stop-propagation="true">
     <div class="subtaskAddOrCancel">
         <button type="button" id="subtaskImgAddCheck" class="subtaskImgDiv pointer" data-action="subtask-add-or-cancel" data-option="add" data-stop-propagation="true" aria-label="Add subtask"></button>
         <div class="vLine"></div>
         <button type="button" id="subtaskImgAddCancel" class="subtaskImgDiv pointer" data-action="subtask-add-or-cancel" data-option="cancel" data-stop-propagation="true" aria-label="Cancel subtask input"></button>
     </div>`;
}

/**
 * Renders the HTML for a subtask in the output container.
 *
 * The rendered HTML is a container containing the subtask text and two buttons
 * for editing and deleting the subtask. The edit button will enter the edit mode
 * for the subtask, while the delete button will delete the subtask from the
 * subtasks array and render the subtasks.
 *
 * @param {HTMLElement} outputContainer - The container where the subtask HTML will be rendered.
 * @param {Object} subtask - The subtask object containing the details to render.
 */
function renderSubtaskHTML(outputContainer, subtask) {
  const safeSubtaskId = toSafeInteger(subtask && subtask.id);
  const safeSubtaskText = escapeHtml(subtask && subtask.subtaskText);

  outputContainer.innerHTML += /*html*/ `
        <div class="subTaskOutputDiv" id="subtask${safeSubtaskId}">
        <button type="button" class="subtaskTextButton" data-action="edit-subtask" data-subtask-id="${safeSubtaskId}">
          <span class="subtaskText">${safeSubtaskText}</span>
        </button>
            <div class="subtaskCheckboxes">
                <button type="button" class="subtaskImgDiv pointer" id="subtaskImgEdit" data-action="edit-subtask" data-subtask-id="${safeSubtaskId}" aria-label="Edit subtask"></button>
                <div class="vLine"></div>
                <button type="button" class="subtaskImgDiv pointer" id="subtaskImgDelete" data-action="delete-subtask" data-subtask-id="${safeSubtaskId}" aria-label="Delete subtask"></button>
            </div>
        </div>`;
}

function renderImageInputField() {}

/**
 * Renders the default HTML for a subtask input, providing a placeholder text
 * and an add button. This is displayed when no subtask is being actively edited
 * or added, serving as a prompt to the user to add a new subtask.
 *
 * @return {string} The HTML string for the default subtask input prompt.
 */

function renderSubtaskDefaultHTML() {
  return /*html*/ `<span id="subtaskInputFieldDiv">Add new subtask</span>
    <span id="subtaskImgAddPlus" class="subtaskImgDiv pointer"></span>
    `;
}
