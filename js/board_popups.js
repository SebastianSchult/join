/**
 * Opens a card with the specified task ID.
 *
 * @param {number} taskId - The ID of the task to open.
 */
function openCard(taskId){
    const opener = document.activeElement;
    if (!document.getElementById('openCardContainer')){
        let newDiv = document.createElement('div');
        setAttributes(newDiv, {
            'id': 'openCardContainer',
            'class': 'openCardContainer',
            'data-stop-propagation': 'true'
        });
        document.body.appendChild(newDiv);
    }
    let openCardContainer = document.getElementById('openCardContainer');
    let task = getTaskOutOfId(taskId);
    
    openCardContainer.classList.remove('d-none');
    openCardContainer.innerHTML = renderOpenCardHTML(task);
    
    setCardType(task);
    if (task.assignedTo.length != 0) {
        renderContactsToOpenCard(task);
    }
    if(task.subtasks.length != 0) {
        renderSubtasksToOpenCard(task);
    }
    if(task.images && task.images.length > 0) {
        renderOpenCardImages(task);
    }
    toggleBoardOverlay('close-card');
    activateFocusLayer(openCardContainer, {
        opener,
        initialFocus: '.boardAddTaskCloseHoverContainer',
        onEscape: () => {
            if (typeof closeOpenDropdowns === "function" && closeOpenDropdowns({ restoreFocus: true })) {
                return;
            }
            closeCard();
        },
    });
}


/**
 * Closes the open card by adding the 'd-none' class to the 'openCardContainer' element.
 *
 */
async function closeCard(){
    let openCardContainer = document.getElementById('openCardContainer');
    if (!openCardContainer) {
        deactivateFocusLayer({ restoreFocus: true });
        toggleBoardOverlay('disable');
        return;
    }
    deactivateFocusLayer({ restoreFocus: true });
    openCardContainer.remove();
    openCardContainer.classList.add('d-none');
    openCardContainer.removeAttribute('editing');

    await saveTasksToRemoteStorage();
    renderCategories(tasks);
    toggleBoardOverlay('disable');
}


/**
 * Renders the contacts assigned to a task in the open card.
 *
 * @param {Object} task - The task object containing the assigned contacts.
 */
function renderContactsToOpenCard(task) {
    let container = document.getElementById('openCardAssignedToContainer');
    container.innerHTML = `<span class="openCardText">Assigned To:</span><div class="openCardAssignedToContactsContainer" id="openCardAssignedToContactsContainer"></div>`;
    container.classList.add("openCardAssignedToContainer");
	let content = document.getElementById("openCardAssignedToContactsContainer");
	content.innerHTML = "";

	task["assignedTo"].forEach((id) => {
		contacts.filter((contact) => {
			if (contact["id"] == id) {
        const safeContactName = escapeHtml(contact["name"]);
				content.innerHTML += /*html*/ `
                    <div class="openCardAssignedToContact">${renderAssignedToButtonsHTML(contact)}${safeContactName}</div>`;
      }
		});
	});
}


/**
 * Renders the overlay for adding a task to the board.
 */
function renderBoardAddTaskOverlay(){
    let newDiv = document.createElement('div');
    setAttributes(newDiv, {'id': 'addTaskHoverContainer', 'class': 'addTaskHoverContainer', 'data-stop-propagation': 'true'});
    document.body.appendChild(newDiv);

    let container = document.getElementById('addTaskHoverContainer');
    container.innerHTML = renderBoardAddTaskHeaderHTML();
    container.innerHTML += renderAddTaskMainContentHTML();
    document.getElementById('addTaskBodyRight').innerHTML += renderAddTaskFooterHTML();
    setTodayDateAsMin();
    setPriority('medium');
    if (typeof registerAddTaskKeyboardAccessibility === "function") {
        registerAddTaskKeyboardAccessibility();
    }
    if (typeof initializeDropdownAccessibilityState === "function") {
        initializeDropdownAccessibilityState();
    }
    renderContactsToDropdown();
    checkValidity();
}


/**
 * Displays the add task container by rendering the overlay and adding the necessary classes to the container.
 * If the container does not exist, it will be created and rendered.
 */
function showAddTaskContainer(category='category-0') {
    const opener = document.activeElement;
    newTask.category = category;
    if (!document.getElementById('addTaskHoverContainer')) {
        renderBoardAddTaskOverlay();
        if (typeof initializeFilepickerUI === "function") {
            initializeFilepickerUI();
        } else {
            addFilepickerListener();
            setupDragAndDrop();
        }
    }
    let container = document.getElementById('addTaskHoverContainer');
    container.classList.add('showBoard');
    toggleBoardOverlay("hide-add-task-container");
    activateFocusLayer(container, {
        opener,
        initialFocus: '.boardAddTaskCloseHoverContainer, #addTaskEnterTitleInput',
        onEscape: () => {
            if (typeof closeOpenDropdowns === "function" && closeOpenDropdowns({ restoreFocus: true })) {
                return;
            }
            hideAddTaskContainer();
        },
    });
}


/**
 * Hides the add task container by removing classes, toggling overlay, and then removing the container after a delay.
 *
 */
function hideAddTaskContainer(){
    if(!document.getElementById('addTaskHoverContainer')){
        deactivateFocusLayer({ restoreFocus: true });
        toggleBoardOverlay('disable');
        return;
    }
    if(document.getElementById('addTaskHoverContainer')){
        let container = document.getElementById('addTaskHoverContainer');
        deactivateFocusLayer({ restoreFocus: true });
        container.classList.remove('showBoard');
        container.classList.add('hideBoard');
        toggleBoardOverlay('disable');
        setTimeout(() => {
            container.remove();
        },200)
    }
}


/**
 * Toggles the board overlay visibility based on the provided function to call.
 *
 * @param {string} actionName - Delegated action to trigger on overlay click.
 */
function toggleBoardOverlay(actionName){
    let overlay = document.getElementById('boardOverlay')
    if (overlay.classList.contains('d-none')){
        overlay.classList.remove('d-none')
        overlay.dataset.action = actionName;
    } else if (actionName == 'disable') {
        overlay.classList.add('d-none')
        delete overlay.dataset.action;
    }
}


/**
 * Function to show a success message on the webpage.
 */
function showSuccessMessage(){
    if (!document.getElementById('success-message-container')) createSuccessMessageContainer();
    let container = document.getElementById('success-message-container');
    container.classList.add('successIn');

    setTimeout(() => {
        hideAddTaskContainer();
        hideSuccesMessage();
        setTimeout(() => {
            if(window.location.href.includes('board.html')){
                renderCategories(tasks);
            } 
            else switchPage('board.html');
        },1000)
    }, 1000);
}


/**
 * A function to hide the success message container.
 */
function hideSuccesMessage(){
    let container = document.getElementById('success-message-container');
    container.classList.add('successOut');
    container.classList.remove('successIn');
    container.remove();

}


/**
 * Creates a success message container with a button and an image for task addition.
 *
 * @return {void} This function does not return a value.
 */
function createSuccessMessageContainer(){
    let div = document.createElement("div");

    div.id = "success-message-container";
    div.classList.add("createBtn", "addTaskBtn", "center", "disable");

    let span = document.createElement("span");
    span.classList.add("addTaskBtnText");
    span.textContent = "Task added to the board";


    let imgDiv = document.createElement("div");
    imgDiv.classList.add("addTaskBtnImg");

    div.appendChild(span);
    div.appendChild(imgDiv);

    document.body.appendChild(div);
}
