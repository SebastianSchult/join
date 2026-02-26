/**
 * Renders the HTML code for a task card.
 *
 * @param {Object} task - The task object to be rendered.
 * @return {string} The HTML code for the task card.
 */
function renderTasksHTML(task) {
  const safeTaskId = toSafeInteger(task && task.id);
  const safeTaskType = escapeHtml(task && task.type);
  const safeTaskTitle = escapeHtml(task && task.title);
  const safeTaskDescription = escapeHtml(task && task.description);

  return /*html*/ `
      <a draggable="true" id="${safeTaskId}" class="card" href="#" data-action="open-card" data-task-id="${safeTaskId}" data-prevent-default="true" data-dragstart-action="start-dragging" data-dragend-action="stop-dragging">
          <div class="cardTopContainer">
              <div id="cardType${safeTaskId}" class="cardType">${safeTaskType}</div>
              <div class="cardTitle">${safeTaskTitle}</div>
              <div id="cardText${safeTaskId}" class="cardText">${safeTaskDescription}</div>
          </div>
          <div class="cardBottomContainer">
              <div id="cardSubtask${safeTaskId}" class="cardSubtasks"></div>
              <div class="assignedToAndPriority">
                  <div id="cardAssignedToContainerId${safeTaskId}" class="cardAssignedToContainer"></div>
                  <div class="cardPriority">${setPriorityImage(
                    task.priority
                  )}</div>
              </div>
              <!-- Neuer Container für Bilder -->
              <div id="cardImagesContainer${safeTaskId}" class="cardImagesContainer"></div>
          </div>
      </a>`;
}

/**
 * Renders a div with a class of "empty-category" containing the message "No tasks [name]".
 *
 * @param {string} name - The name of the category with no tasks.
 * @return {string} The HTML code for the empty category message.
 */
function renderEmptyCategoryHTML(name) {
  return /*html*/ `<div class="empty-category">No tasks ${name}</div>`;
}

/**
 * Renders the HTML for the open card based on the given task object.
 *
 * @param {Object} task - The task object containing the details to render.
 * @return {string} The HTML string for the open card.
 */
function renderOpenCardHTML(task) {
  const safeTaskId = toSafeInteger(task && task.id);
  const safeTaskType = escapeHtml(task && task.type);
  const safeTaskTitle = escapeHtml(task && task.title);
  const safeTaskDescription = escapeHtml(task && task.description);
  const safeTaskDueDate = escapeHtml(task && task.dueDate);
  const safeTaskPriority = escapeHtml(task && task.priority);

  return /*html*/ `
      <div class="boardAddTaskCloseHoverOuterContainer">
          <button type="button" class="boardAddTaskCloseHoverContainer" data-action="close-card" aria-label="Close task details"></button>
      </div>
      <div class="openCardInnerContainer">
          <div id="openCardType${safeTaskId}" class="cardType">${safeTaskType}</div>
          <div class="cardTitle">${safeTaskTitle}</div>
          <div class="openCardDescription">${safeTaskDescription}</div>
          <div class="openCardTextBox">
              <span class="openCardText">Due Date:</span>
              <span class="openCardValue">${safeTaskDueDate}</span>
          </div>
          <div class="openCardTextBox">
              <span class="openCardText">Priority:</span>
              <div class="openCardPriority">
                  <span class="openCardValue">${safeTaskPriority}</span>
                  <div class="openCardPriorityImage">${setPriorityImage(
                    task.priority
                  )}</div>
              </div>
          </div>
          <div id="openCardAssignedToContainer"></div>
          <div id="openCardSubtasksContainer"></div>
          <div id="openCardImagesContainer" class="openCardImagesContainer"></div>
          <div class="openCardDeleteEditContainer">
              <button type="button" class="openCardDeleteContainer" data-action="open-card-delete" data-task-id="${safeTaskId}">
                  <span class="openCardImgDiv pointer" id="openCardImgDelete"></span>
                  <span>Delete</span>
              </button>
              <div class="vLine"></div>
              <button type="button" class="openCardEditContainer" data-action="open-card-edit" data-task-id="${safeTaskId}">
                  <span class="openCardImgDiv pointer" id="openCardImgEdit"></span>
                  <span>Edit</span>
              </button>
          </div>
      </div>`;
}
