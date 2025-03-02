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
  return /*html*/ `
      <div draggable="true" ondragstart="startDragging(${
        task.id
      })" ondragend="stopDragging()" id="${
    task.id
  }" class="card" onclick="openCard(${task.id})">
          <div class="cardTopContainer">
              <div id="cardType${task.id}" class="cardType">${task.type}</div>
              <div class="cardTitle">${task.title}</div>
              <div id="cardText${task.id}" class="cardText">${
    task.description
  }</div>
          </div>
          <div class="cardBottomContainer">
              <div id="cardSubtask${task.id}" class="cardSubtasks"></div>
              <div class="assignedToAndPriority">
                  <div id="cardAssignedToContainerId${
                    task.id
                  }" class="cardAssignedToContainer"></div>
                  <div class="cardPriority">${setPriorityImage(
                    task.priority
                  )}</div>
              </div>
              <!-- Neuer Container für Bilder -->
              <div id="cardImagesContainer${
                task.id
              }" class="cardImagesContainer"></div>
          </div>
      </div>`;
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
  return /*html*/ `<div class="profile-badge-group" style="background-color: ${
    contact.contactColor
  }">${getInitials(contact.name)}</div>`;
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
            <button class="loginButtons signUpButton" onclick="renderSignUp()">Sign up</button>
        </div>
    </header>
    <div class=" login-page">
        <div class="login-box">
            <div class="h1LoginBox">
                <h1 class="loginH1">Log in</h1>
                <div class="horizontalH1Underline"></div>
            </div>
            <div class="formDiv">
                <form onsubmit="loginUser(); return false;">
                    <div class=" innerLoginBox">
                        <div class="loginEmailBox">
                            <input type="email" id="loginEmailInput" placeholder="Email" required>
                            <div class="mailIcon"><img src="./assets/img/icon-mail.png" alt="letter"></div>
                        </div>

                        <div class="loginPasswordBox">
                            <input type="password" id="loginPasswordInput" placeholder="Password" required>
                            <div class="mailIcon"><img src="./assets/img/icon-lock.png" alt="lock"></div>
                        </div>
                    </div>
                    <div class="checkboxBox">
                        <label for="rememberMe" class="custom-checkbox">
                            <img src="./assets/img/icon-check_button_unchecked.png" alt="checkbox image">
                            Remember me</label><br>
                    </div>
                    <div class="loginButtonsBox">
                        <button class="loginButtons loginButtonUser" onclick="login()">Log in</button>
                        <!--TODO-->
                        <button class="loginButtons loginButtonGuest">Guest log in</button>
                    </div>
                </form>
                <!-- TODO darf nur angzeigt werden, wenn Nachricht wirklich da (z.B. you are signed up now!) -->
                <div id="msgBox"></div>
            </div>
        </div>
        <div class="signUpField-mobile ">
            <span>Not a join user yet?</span>
            <button class="loginButtons signUpButton signUpButton-mobile" onclick="renderSignUpPage()">Sign up</button>
        </div>
        <div class="loginFooter">
            <div class="privacyPolicy" onclick=""><span>Privacy policy</span></div>
            <div class="legalNotice" onclick=""><span>Legal notice</span></div>
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
                <div class="arrowLeft"><img src="./assets/img/icon-arrow_left.png" alt="arrow left"></div>

                <div class="h1SignUpBox">
                    <h1 class="signUpH1">Sign up</h1>
                    <div class="horizontalH1UnderlineSignUp"></div>
                </div>

                <div class="formDiv">
                    <form onsubmit="addUser(); return false">
                        <div class="innerSignUpBox">
                            <div class="signUpEmailBox">
                                <input type="email" id="signUpEmailInput" placeholder="Email" required>
                                <div class="mailIcon"><img src="./assets/img/icon-mail.png" alt="letter"></div>
                            </div>

                            <div class="signUpPasswordBox">
                                <input type="password" id="signUpPasswordInput" placeholder="Password" required>
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
                <div class="privacyPolicySignUp" onclick=""><span>Privacy policy</span></div>
                <div class="legalNoticeSignUp" onclick=""><span>Legal notice</span></div>
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
    <div class="boardAddTaskCloseHoverContainer" onclick="hideAddTaskContainer()"></div>
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
                <input type="text" id="addTaskEnterTitleInput" placeholder="Enter a title" required>
                <div class="addTaskRequired" id="requiredTitle"></div>
            </div>
            <div class="addTaskDescription">
                <div class="addTaskTitles"><span class="bold">Description</span> (optional)</div>
                <div>
                <div class="textAreaContainer">
                    <textarea id="addTaskDescriptionInput" type="text" placeholder="Enter a description"></textarea>
                </div>
            </div>
            </div>
            <div class="addTaskDueDate ">
                <div class="addTaskTitles"><span class="bold">Due date</span></div>
                <div>
                    <div class="addTaskDueDateInputContainer border-bottom pointer" id="addTaskDueDateInputContainer" onclick="addTaskDueDateOpenCalendear()">
                        <input class="addTaskDueDateInput" id="addTaskDueDateInput" type="date"  value="">
                        <div class="addTaskDueDateImage"></div>
                    </div>
                    <div class="addTaskRequired" id="requiredDueDate"></div>
                </div>
            </div>
        </div>
        <div class="addTaskBodyBottom">
        <div class="addTaskPriority">
            <div class="addTaskTitles bold">Priority</div>
            <div class="addTaskPriorityButtonContainer">
                <div id="addTaskPriorityButtonurgent" class="addTaskPriorityButton"  onclick="setPriority('urgent')">
                    <div class="priorityButtonText">Urgent</div>
                    <img src="./assets/img/icon-priority_urgent.png" alt="Priority urgent">
                </div>
                <div id="addTaskPriorityButtonmedium" class="addTaskPriorityButton" onclick="setPriority('medium')">
                    <div class="priorityButtonText">Medium</div>
                    <img src="./assets/img/icon-priority_medium.png" alt="Priority medium">
                </div>
                <div id="addTaskPriorityButtonlow" class="addTaskPriorityButton"  onclick="setPriority('low')">
                    <div class="priorityButtonText">Low</div>
                    <img src="./assets/img/icon-priority_low.png" alt="Priority low">
                </div>

            </div>
        </div>
        <div class="addTaskContainer">
            <div class="addTaskTitle"><span class="bold">Assigned to</span> (optional)</div>
            <div class="addTask-dropdown-contact pointer border-bottom" onclick="doNotClose(event); renderArrow('custom-arrow-assignedTo', 'dropdown-content-assignedTo')">
                <div class="addTask-custom-select">
                    <span id="dropdown-assignedTo-title">Select contacts to assign</span>
                    <div class="addTask-custom-arrow" id="custom-arrow-assignedTo">
                        <img data-direction="down" src="./assets/img/icon-arrow_dropdown_down.png" alt="">
                    </div>
                </div>
            </div>
                <div class="addTask-dropdown-content d-none" onclick="doNotClose(event)" id="dropdown-content-assignedTo">
                </div>
                <div id="assignedContactsContainer" class="assignedContactsContainer cardAssignedToContainer d-none"></div>
        </div>
        <div class="addTaskContainer ">
            <div class="addTaskTitle bold">Category </div>
            <div class="addTask-dropdown-category pointer border-bottom" onclick="doNotClose(event); renderArrow('custom-arrow-category', 'dropdown-content-category')">
                <div class="addTask-custom-select">
                    <span id="dropdown-category-title">Select task category</span>
                        <div class="addTask-custom-arrow" id="custom-arrow-category">
                        <img data-direction="down" src="./assets/img/icon-arrow_dropdown_down.png" alt="">
                    </div>
                </div>
            </div>
            <div class="addTask-dropdown-content d-none no-scroll" onclick="doNotClose(event)" id="dropdown-content-category">
                <div class="dropdownOption" onclick="chooseCategory('Technical Task')">Technical Task</div>
                <div class="dropdownOption" onclick="chooseCategory('User Story')">User Story</div>
            </div>
        </div>
        <div class="addTaskContainer">
            <div class="addTaskTitles"><span class="bold">Subtasks</span> (optional)
            </div>
            <div id="subtaskBottom" class="subtaskBottom border-bottom" onclick="renderSubtaskInputField()">
                <div id="subtaskInputFieldDiv">Add new subtask</div>
                <div id="subtaskImgAddPlus" class="subtaskImgDiv pointer"></div>
            </div>
            <div id="subtasksOutputContainer"></div>
        </div>


        <div class="addTaskContainer">
            <div class="addTaskTitles"><span class="bold">Attachments</span> (optional)</div>
            <div id="addImageBottom" class="addImageBottom border-bottom">
            <img src="./assets/img/upload.png" alt="upload" onclick="openFilepicker()">
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
                <div class="clearBtn addTaskBtn" onclick="clearFormular()">
                    <span class="addTaskBtnText">Clear</span>
                    <div class="clearBtnImg"></div>
                </div>
                <div id="createBtn" class="createBtn addTaskBtn disabled">
                    <span class="addTaskBtnText">Create Task</span>
                    <div class="createBtnImg"></div>
                </div>
        </div>`;
}

/**
 * Renders the HTML for the open card based on the given task object.
 *
 * @param {Object} task - The task object containing the details to render.
 * @return {string} The HTML string for the open card.
 */
function renderOpenCardHTML(task) {
  return /*html*/ `
      <div class="boardAddTaskCloseHoverOuterContainer">
          <div class="boardAddTaskCloseHoverContainer" onclick="closeCard()"></div>
      </div>
      <div class="openCardInnerContainer">
          <div id="openCardType${task.id}" class="cardType">${task.type}</div>
          <div class="cardTitle">${task.title}</div>
          <div class="openCardDescription">${task.description}</div>
          <div class="openCardTextBox">
              <span class="openCardText">Due Date:</span>
              <span class="openCardValue">${task.dueDate}</span>
          </div>
          <div class="openCardTextBox">
              <span class="openCardText">Priority:</span>
              <div class="openCardPriority">
                  <span class="openCardValue">${task.priority}</span>
                  <div class="openCardPriorityImage">${setPriorityImage(
                    task.priority
                  )}</div>
              </div>
          </div>
          <div id="openCardAssignedToContainer"></div>
          <div id="openCardSubtasksContainer"></div>
          <div id="openCardImagesContainer" class="openCardImagesContainer"></div>
          <div class="openCardDeleteEditContainer">
              <div class="openCardDeleteContainer" onclick='openCardDelete(${
                task.id
              })'>
                  <div class="openCardImgDiv pointer" id="openCardImgDelete"></div>
                  <span>Delete</span>
              </div>
              <div class="vLine"></div>
              <div class="openCardEditContainer" onclick='openCardEdit(${
                task.id
              })'>
                  <div class="openCardImgDiv pointer" id="openCardImgEdit"></div>
                  <span>Edit</span>
              </div>
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
  return /*html*/ `
        <input type="text" id="subtaskEditInputField" value="${subtask.subtaskText}">
        <div class="subtaskCheckboxes">
        <div class="subtaskImgDiv pointer" id="subtaskImgDelete" onclick="deleteSubtask(${subtask.id})"> </div><div class="vLine"></div>
            <div class="subtaskImgDiv pointer" id="subtaskImgAddCheck" onclick="saveEditSubtask(${subtask.id})"> </div>
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
     <input type="text" id="subtaskInputField" placeholder="Add new subtask" onclick="doNotClose(event)">
     <div class="subtaskAddOrCancel">
         <div id="subtaskImgAddCheck" class="subtaskImgDiv pointer" onclick="subtaskAddOrCancel('add'); doNotClose(event)"></div>
         <div class="vLine"></div>
         <div id="subtaskImgAddCancel" class="subtaskImgDiv pointer" onclick="subtaskAddOrCancel('cancel'); doNotClose(event)"></div>
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
  outputContainer.innerHTML += /*html*/ `
        <div class="subTaskOutputDiv" id="subtask${subtask.id}" ondblclick="editSubtask(${subtask.id})">
        <div class="subtaskText">${subtask.subtaskText}</div>
            <div class="subtaskCheckboxes">
                <div class="subtaskImgDiv pointer" id="subtaskImgEdit" onclick="editSubtask(${subtask.id})"> </div>
                <div class="vLine"></div>
                <div class="subtaskImgDiv pointer" id="subtaskImgDelete" onclick="deleteSubtask(${subtask.id})"> </div>
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
  return /*html*/ `<div id="subtaskInputFieldDiv">Add new subtask</div>
    <div id="subtaskImgAddPlus" class="subtaskImgDiv pointer"></div>
    `;
}
