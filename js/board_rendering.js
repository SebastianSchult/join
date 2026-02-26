/**
 * Renders all board categories and their matching task cards.
 *
 * @param {Array} arrayToSearchIn - Tasks to render.
 */
function renderCategories(arrayToSearchIn) {
    categories.forEach((category) => {
        const categoryId = Object.keys(category)[0];
        const categoryContainer = document.getElementById(categoryId);
        if (!categoryContainer) {
            return;
        }

        categoryContainer.innerHTML = "";
        const filteredTasks = filterTasks(arrayToSearchIn, categoryId);
        if (filteredTasks.length !== 0) {
            filteredTasks.forEach((taskData) => {
                const task = getTaskOutOfId(taskData.id);
                if (!task) {
                    return;
                }

                categoryContainer.innerHTML += renderTasksHTML(task);
                setCardType(task);
                renderTaskDescription(task);
                renderSubtask(task);
                renderAssignedToButtons(task);
                setTimeout(() => {
                    renderTaskImages(task);
                }, 0);
            });
            return;
        }

        renderEmptyCategory(categoryContainer, Object.values(category)[0]);
    });
}

/**
 * Renders a shortened card description.
 *
 * @param {Object} task - Task entity.
 */
function renderTaskDescription(task) {
    const descriptionContainer = document.getElementById("cardText" + task.id);
    if (!descriptionContainer) {
        return;
    }

    const taskDescription =
        task && typeof task.description === "string" ? task.description : "";
    let cardText = "";
    const taskDescriptionSplitted = taskDescription.split(" ");

    taskDescriptionSplitted.forEach((word) => {
        if (cardText.length + word.length <= 46) {
            cardText = cardText + " " + word;
        }
    });

    cardText = cardText.substring(1);
    if (cardText.length !== taskDescription.length) {
        cardText = cardText + " ...";
    }

    descriptionContainer.textContent = cardText;
}

/**
 * Filters tasks by category key.
 *
 * @param {Array} arrayToSearchIn - Tasks to search in.
 * @param {string} category - Category key.
 * @returns {Array} Matching tasks.
 */
function filterTasks(arrayToSearchIn, category) {
    const filteredTasks = [];
    arrayToSearchIn.forEach((task) => {
        if (task.category == category) {
            filteredTasks.push(task);
        }
    });
    return filteredTasks;
}

/**
 * Renders assigned contact badges into a task card.
 *
 * @param {Object} task - Task entity.
 */
function renderAssignedToButtons(task) {
    const assignedToContainer = document.getElementById(
        "cardAssignedToContainerId" + task.id
    );
    if (!assignedToContainer) {
        return;
    }

    const assignedToContacts = Array.isArray(task.assignedTo) ? task.assignedTo : [];
    for (let i = 0; i < assignedToContacts.length; i++) {
        for (let j = 0; j < contacts.length; j++) {
            if (contacts[j].id == assignedToContacts[i]) {
                assignedToContainer.innerHTML += renderAssignedToButtonsHTML(contacts[j]);
            }
        }
    }
}

/**
 * Renders empty-column placeholder.
 *
 * @param {HTMLElement} categoryContainer - Category column container.
 * @param {string} name - Display category name.
 */
function renderEmptyCategory(categoryContainer, name) {
    categoryContainer.innerHTML = renderEmptyCategoryHTML(name);
}

/**
 * Returns the priority icon HTML.
 *
 * @param {string} taskPriority - Priority value.
 * @returns {string} Icon HTML.
 */
function setPriorityImage(taskPriority) {
    if (taskPriority == "low") {
        return `<img src="assets/img/icon-priority_low.png">`;
    }
    if (taskPriority == "medium") {
        return `<img src="assets/img/icon-priority_medium.png">`;
    }
    return `<img src="assets/img/icon-priority_urgent.png">`;
}

/**
 * Filters board cards by search input.
 */
function searchTask() {
    const searchInput = document.getElementById("findTask");
    if (searchInput == null) {
        return;
    }

    const normalizedSearch = searchInput.value.toLowerCase();
    const foundTasks = tasks.filter((task) => {
        const title = typeof task.title === "string" ? task.title.toLowerCase() : "";
        const description =
            typeof task.description === "string" ? task.description.toLowerCase() : "";
        return title.includes(normalizedSearch) || description.includes(normalizedSearch);
    });
    renderCategories(foundTasks);
}

/**
 * Renders subtask progress for card preview.
 *
 * @param {Object} task - Task entity.
 */
function renderSubtask(task) {
    const subtaskContainer = document.getElementById("cardSubtask" + task.id);
    if (!subtaskContainer) {
        return;
    }

    const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
    const countSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter(
        (subtask) => subtask.completed == true
    ).length;
    const completedPercent =
        countSubtasks === 0 ? 0 : (completedSubtasks * 100) / countSubtasks;

    if (countSubtasks !== 0) {
        subtaskContainer.innerHTML = /*html*/ `<progress id="progressTodo" value="${completedPercent}" max="100"></progress><div class="cardSubtasksText">${completedSubtasks}/${countSubtasks} Subtasks</div>`;
    } else {
        subtaskContainer.remove();
    }
}

/**
 * Returns task entity by id.
 *
 * @param {number} taskId - Task id.
 * @returns {Object|undefined} Matching task.
 */
function getTaskOutOfId(taskId) {
    return tasks.filter((task) => task.id == taskId)[0];
}

/**
 * Adds type-specific CSS class to task cards.
 *
 * @param {Object} task - Task entity.
 */
function setCardType(task) {
    const cardType = document.getElementById(`cardType${task.id}`);
    const openCardType = document.getElementById(`openCardType${task.id}`);
    if (!cardType) {
        return;
    }

    if (task.type == "User Story") {
        cardType.classList.add("cardTypeUserStory");
        if (openCardType) {
            openCardType.classList.add("cardTypeUserStory");
        }
    } else if (task.type == "Technical Task") {
        cardType.classList.add("cardTypeTechnicalTask");
        if (openCardType) {
            openCardType.classList.add("cardTypeTechnicalTask");
        }
    }
}

/**
 * Renders subtasks in the open card dialog.
 *
 * @param {Object} task - Task entity.
 */
function renderSubtasksToOpenCard(task) {
    const container = document.getElementById("openCardSubtasksContainer");
    if (!container) {
        return;
    }

    container.innerHTML = "";
    const title = document.createElement("span");
    title.className = "openCardText";
    title.textContent = "Subtasks:";
    const content = document.createElement("div");
    content.id = "openCardSubtasks";

    container.appendChild(title);
    container.appendChild(content);
    container.classList.add("openCardSubtasksContainer");

    const safeTaskId = toSafeInteger(task && task.id);
    const subtasks = Array.isArray(task && task.subtasks) ? task.subtasks : [];

    subtasks.forEach((subtask, index) => {
        const subtaskRow = document.createElement("div");
        subtaskRow.className = "openCardSubtask";
        if (subtask && subtask.completed === true) {
            subtaskRow.setAttribute("completed", "");
        }

        const checkbox = document.createElement("div");
        checkbox.className = "openCardSubtaskImgContainer";
        checkbox.addEventListener("click", () => setSubtaskState(safeTaskId, index));

        const textNode = document.createElement("span");
        textNode.textContent =
            subtask && typeof subtask.subtaskText === "string"
                ? subtask.subtaskText
                : "";

        subtaskRow.appendChild(checkbox);
        subtaskRow.appendChild(textNode);
        content.appendChild(subtaskRow);
    });
}

/**
 * Creates an empty target card while dragging.
 *
 * @param {string} taskId - Dragged card id.
 * @param {string|number} categoryId - Target category numeric suffix.
 */
function displayEmptyTask(taskId, categoryId) {
    const taskElement = document.getElementById(taskId);
    const categoryElement = document.getElementById("category-" + categoryId);
    if (!taskElement || !categoryElement) {
        return;
    }

    const cardHeight = "min-height: " + taskElement.clientHeight + "px";
    const cardWidth = "min-width: " + taskElement.clientWidth + "px";
    const cardStyle = cardHeight + "; " + cardWidth;
    const boardColumnsMaxWidth =
        typeof getUiBreakpointValue === "function"
            ? getUiBreakpointValue("boardColumnsMax")
            : 1400;

    const newDiv = document.createElement("div");
    newDiv.classList.add("emptyCard");
    if (window.innerWidth <= boardColumnsMaxWidth) {
        newDiv.classList.add("vertical");
    }

    newDiv.style = cardStyle;
    categoryElement.appendChild(newDiv);
}
