/**
 * Toggles a subtask completion state and persists change queue.
 *
 * @param {number} taskId - Parent task id.
 * @param {number} subtaskIndex - Subtask index.
 */
function setSubtaskState(taskId, subtaskIndex) {
    const task = getTaskOutOfId(taskId);
    if (!task || !Array.isArray(task.subtasks) || !task.subtasks[subtaskIndex]) {
        return;
    }

    task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
    queueTaskUpsert(taskId);

    const openCardSubtasks = document.getElementsByClassName("openCardSubtask");
    for (let i = 0; i < openCardSubtasks.length; i++) {
        if (i == subtaskIndex) {
            if (openCardSubtasks[i].getAttribute("completed") == null) {
                openCardSubtasks[i].setAttribute("completed", "");
            } else {
                openCardSubtasks[i].removeAttribute("completed");
            }
        }
    }
}

/**
 * Deletes a task from board state and queues remote deletion.
 *
 * @param {number} taskId - Task id.
 */
function openCardDelete(taskId) {
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id == taskId) {
            tasks.splice(i, 1);
            break;
        }
    }
    queueTaskDelete(taskId);
    closeCard();
    renderCategories(tasks);
}

/**
 * Opens edit mode for an existing task.
 *
 * @param {number} taskId - Task id.
 */
function openCardEdit(taskId) {
    newTask = getTaskOutOfId(taskId);
    renderEditContainer();
    renderContactsToDropdown();
    renderAssignedContactsContainer();
    renderSubtasks();
    setTaskValuesToFields(newTask);
    renderEditCardImages(newTask);
}

/**
 * Renders board edit form container.
 */
function renderEditContainer() {
    const container = document.getElementById("openCardContainer");
    if (!container) {
        return;
    }

    container.setAttribute("editing", "");
    container.innerHTML = createEditHeader();
    container.innerHTML += renderAddTaskMainContentHTML();
    container.innerHTML += createEditFooter(newTask);
    if (typeof initializeFilepickerUI === "function") {
        initializeFilepickerUI();
    } else {
        addFilepickerListener();
        setupDragAndDrop();
    }
}

/**
 * Fills edit form fields from task state.
 */
function setTaskValuesToFields() {
    tempAssignedContacts = [];
    document.getElementById("addTaskEnterTitleInput").value = newTask.title;
    document.getElementById("addTaskDescriptionInput").value = newTask.description;
    document.getElementById("addTaskDueDateInput").value = newTask.dueDate;
    document.getElementById("dropdown-category-title").textContent = newTask.type;
    setPriorityAppearance(newTask.priority);
    renderEditCardAssignedContacts();
}

/**
 * Renders assigned contacts in edit form.
 */
function renderEditCardAssignedContacts() {
    document.getElementById("assignedContactsContainer").innerHTML = "";
    newTask.assignedTo.forEach((id) => {
        assignContactToTask(id);
    });
}

/**
 * Saves task edits and persists them to remote storage.
 *
 * @param {number} taskId - Task id.
 */
async function saveEditedTask(taskId) {
    const loadResult = await loadTasksFromRemoteStorage();
    if (loadResult.error) {
        return;
    }
    collectInformationsForNewCard();

    const taskToSaveIndex = findTaskIndex(taskId);
    if (taskToSaveIndex === -1) {
        await closeCard();
        showGlobalUserMessage("Could not update this task. Please reload and try again.");
        return;
    }

    updateTaskDetails(taskToSaveIndex);
    updateTaskImages(taskToSaveIndex);

    await saveTasksToRemoteStorage();
    await finalizeEdit();
}

/**
 * Finds index for task id in board state.
 *
 * @param {number} taskId - Task id.
 * @returns {number} Array index or -1.
 */
function findTaskIndex(taskId) {
    const index = tasks.findIndex((task) => Number(task.id) === Number(taskId));
    if (index === -1) {
        console.error("saveEditedTask: Kein Task gefunden für ID", taskId);
    }
    return index;
}

/**
 * Applies editable fields to stored task.
 *
 * @param {number} index - Task array index.
 */
function updateTaskDetails(index) {
    tasks[index].title = newTask.title;
    tasks[index].description = newTask.description;
    tasks[index].dueDate = newTask.dueDate;
    tasks[index].priority = newTask.priority;
    tasks[index].assignedTo = [...newTask.assignedTo];
    tasks[index].subtasks = [...newTask.subtasks];
    queueTaskUpsert(tasks[index].id);
}

/**
 * Updates attachment image state during edit.
 *
 * @param {number} index - Task array index.
 */
function updateTaskImages(index) {
    tasks[index].images = [...newTask.images, ...allImages.map((image) => image.base64)];
}

/**
 * Finalizes edit mode and resets staged media.
 */
async function finalizeEdit() {
    await closeCard();
    showSuccessMessage();
    allImages = [];
}

/**
 * Returns edit card header HTML.
 *
 * @returns {string} Header markup.
 */
function createEditHeader() {
    return /*html*/ `
<div class="boardEditTaskHeader">
    <button type="button" class="boardAddTaskCloseHoverContainer" data-action="close-card" aria-label="Close edit card"></button>
 </div>
    `;
}

/**
 * Returns edit card footer HTML.
 *
 * @param {Object} task - Task in edit mode.
 * @returns {string} Footer markup.
 */
function createEditFooter(task) {
    const safeTaskId = toSafeInteger(task && task.id);

    return /*html*/ `
    <div class="addTaskBodyRight">
        <button type="button" class="createBtn addTaskBtn" data-action="save-edited-task" data-task-id="${safeTaskId}" data-stop-propagation="true">
            <span class="addTaskBtnText">Ok</span>
            <span class="createBtnImg"></span>
        </button>
    </div>`;
}
