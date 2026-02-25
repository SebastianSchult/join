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
 * Renders the HTML for the summary page.
 *
 * @return {string} The HTML code for the summary page.
 */
function renderSummaryHTML() {
  return /*html*/ `
  <div class="sub-main-summary">
    <div class="summary-box box-shadow">
        <div id="h1GreetingUser" class="h1-box">
            <h1 id="daytimeGreeting" class="no-wrap">Good morning,</h1>
            <h1 id="usernameForGreeting"></h1>
        </div>
        <div id="h1GreetingGuest" class="h1-box" style="display: none;">
            <h1 class="no-wrap">Good morning</h1>
        </div>
        <div class="line1">
            <div class="urgentAndDate" id="urgentAndDate">
                <div class="urgentBox">
                    <div class="image-and-amount flex">
                        <img src="./assets/img/icon-blue-urgent_clock-with-border.png" alt="clock symbol"
                            class="white-border">
                        <span class="amount">1</span>
                    </div>
                    <span>Tasks Urgent</span>
                </div>
                <div class="verticalSeparaterLine"></div>
                <div class="dateBox">
                    <div class="date">${getDate()}</div>
                    <span>Upcoming Deadline</span>
                </div>
            </div>
            <div class="square-button">
                <div class="inner-square-button">
                    <div class="image-and-amount flex">
                        <img src="/assets/img/icon-blue-tasks_in_board.png" alt="file shelf">
                        <div class="amount">5</div>
                    </div>
                    <span>Task in Board</span>
                </div>
            </div>
        </div>
        <div class="line2">
            <div class="square-button">
                <div class="inner-square-button">
                    <div class="image-and-amount flex">
                        <img src="./assets/img/icon-blue-todo.png" alt="todo list">
                        <div class="amount">1</div>
                    </div>
                    <span class="no-wrap">Tasks To-do</span>
                </div>
            </div>
            <div class="square-button">
                <div class="inner-square-button">
                    <div class="image-and-amount flex">
                        <img src="/assets/img/icon-blue-in_progress.png" alt="rising chart">
                        <div class="amount">2</div>
                    </div>
                    <span>Task in Progress</span>
                </div>
            </div>
            <div class="square-button">
                <div class="inner-square-button">
                    <div class="image-and-amount flex">
                        <img src="/assets/img/icon-blue-awaiting_feedback.png" alt="feedback card">
                        <div class="amount">2</div>
                    </div>
                    <span>Awaiting Feedback</span>
                </div>
            </div>
            <div class="square-button">
                <div class="inner-square-button">
                    <div class="image-and-amount flex">
                        <img src="./assets/img/icon-blue-done.png" alt="thumbs up">
                        <div class="amount">1</div>
                    </div>
                    <span>Tasks<br>Done</span>
                </div>
            </div>
        </div>
    </div>
</div>`;
}

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

/**
 * Renders the HTML for the login page.
 *
 * @return {string} The HTML code for the login page.
 */
function renderLoginPageHTML() {
  return /*html*/ `
  <div id="loginMainContainer" class="loginMainContainer">
    <div class="blue-overlay d-none" id="blue-overlay">
        <div class="joinLogoWhite logo-animation" id="logo">
            <img src="./assets/img/logo-big_white.png" alt="logo">
        </div>
    </div>
    <header class="loginHeader">
        <div class="joinLogoBlue">
            <img src="./assets/img/logo-medium_blue.png" alt="logo">
        </div>
        <div class="signUpField">
            <span>Not a join user yet?</span>
            <button type="button" class="loginButtons signUpButton" data-action="goto-signup">Sign up</button>
        </div>
    </header>
    <div class=" login-page">
        <div class="login-box">
            <div class="h1LoginBox">
                <h1 class="loginH1">Log in</h1>
                <div class="horizontalH1Underline"></div>
            </div>
            <div class="formDiv">
                <form data-submit-action="login-user">
                    <div class=" innerLoginBox">
                        <div class="loginEmailBox">
                            <label class="sr-only" for="loginEmailInput">Email</label>
                            <input type="email" id="loginEmailInput" placeholder="Email" autocomplete="email" required>
                            <div class="mailIcon"><img src="./assets/img/icon-mail.png" alt="letter"></div>
                        </div>

                        <div class="loginPasswordBox">
                            <label class="sr-only" for="loginPasswordInput">Password</label>
                            <input type="password" id="loginPasswordInput" placeholder="Password" autocomplete="current-password" required>
                            <div class="mailIcon"><img src="./assets/img/icon-lock.png" alt="lock"></div>
                        </div>
                    </div>
                    <div class="checkboxBox">
                        <label for="rememberMe" class="custom-checkbox">
                            <img src="./assets/img/icon-check_button_unchecked.png" alt="checkbox image">
                            Remember me</label><br>
                    </div>
                    <div class="loginButtonsBox">
                        <button type="submit" class="loginButtons loginButtonUser">Log in</button>
                        <!--TODO-->
                        <button type="button" class="loginButtons loginButtonGuest" data-action="login-guest">Guest log in</button>
                    </div>
                </form>
                <!-- TODO darf nur angzeigt werden, wenn Nachricht wirklich da (z.B. you are signed up now!) -->
                <div id="msgBox"></div>
            </div>
        </div>
        <div class="signUpField-mobile ">
            <span>Not a join user yet?</span>
            <button type="button" class="loginButtons signUpButton signUpButton-mobile" data-action="goto-signup">Sign up</button>
        </div>
        <div class="loginFooter">
            <a class="privacyPolicy" href="./privacy_external.html" target="_blank" rel="noopener noreferrer"><span>Privacy policy</span></a>
            <a class="legalNotice" href="./legal_notice_external.html" target="_blank" rel="noopener noreferrer"><span>Legal notice</span></a>
        </div>
    </div>
</div>`;
}

/**
 * Returns the HTML for the sign up page.
 * @return {string} HTML for the sign up page.
 */
function renderSignUpPageHTML() {
  return /*html*/ `
    <div id="signUpMainContainer" class="signUpMainContainer">

        <header class="loginHeader">
            <div class="joinLogoSignUpWhite">
                <img class="signUpLogo" src="./assets/img/logo-medium_white.png" alt="logo">
            </div>

        </header>
        <div class="signUp-page">
            <div class="signUp-box">
                <button type="button" class="arrowLeft" data-action="redirect-to-login" aria-label="Back to login"><img src="./assets/img/icon-arrow_left.png" alt="arrow left"></button>

                <div class="h1SignUpBox">
                    <h1 class="signUpH1">Sign up</h1>
                    <div class="horizontalH1UnderlineSignUp"></div>
                </div>

                <div class="formDiv">
                    <form data-submit-action="add-new-user">
                        <div class="innerSignUpBox">
                            <div class="signUpEmailBox">
                                <label class="sr-only" for="signUpEmailInput">Email</label>
                                <input type="email" id="signUpEmailInput" placeholder="Email" autocomplete="email" required>
                                <div class="mailIcon"><img src="./assets/img/icon-mail.png" alt="letter"></div>
                            </div>

                            <div class="signUpPasswordBox">
                                <label class="sr-only" for="signUpPasswordInput">Password</label>
                                <input type="password" id="signUpPasswordInput" placeholder="Password" autocomplete="new-password" required>
                                <div class="mailIcon"><img src="./assets/img/icon-lock.png" alt="lock"></div>
                            </div>
                        </div>
                        <input type="checkbox" value="acceptingPrivacyPolicy" id="acceptingPrivacyPolicy">
                        <label for="acceptingPrivacyPolicy">I accept the <a href="#">Privacy Policy</a> </label><br>

                        <button class="signUpButtons signUpButtonUser">Sign up</button>

                        <!--TODO-->
                    </form>
                </div>
            </div>

            <div class="signUpFooter">
                <a class="privacyPolicySignUp" href="./privacy_external.html" target="_blank" rel="noopener noreferrer"><span>Privacy policy</span></a>
                <a class="legalNoticeSignUp" href="./legal_notice_external.html" target="_blank" rel="noopener noreferrer"><span>Legal notice</span></a>
            </div>


        </div>
    </div>`;
}

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
        <div class="subTaskOutputDiv" id="subtask${safeSubtaskId}" data-dblclick-action="edit-subtask" data-subtask-id="${safeSubtaskId}">
        <div class="subtaskText">${safeSubtaskText}</div>
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
