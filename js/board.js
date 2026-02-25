let tasks = [];

let currentDraggedElement;

let categories = [
    {'category-0': "To do"},
    {'category-1': "In progress"}, 
    {'category-2': "Await Feedback"}, 
    {'category-3': "Done"}
];


/**
 * Initializes the board by including HTML, loading contacts and tasks from remote storage,
 * and rendering the categories.
 */
async function boardInit() {
    includeHTML();
    await getContactsFromRemoteStorage();
    getContactsOutOfUsers();
    await loadTasksFromRemoteStorage();
    renderCategories(tasks);
}



  /**
   * Renders the categories by iterating through each category, filtering the tasks by the current category,
   * and rendering the tasks in the category container.
   *
   * @param {Array} arrayToSearchIn - The array of tasks to search through.
   */
function renderCategories(arrayToSearchIn) {
    categories.forEach(category => {
      let categoryContainer = document.getElementById(Object.keys(category)[0]);
      categoryContainer.innerHTML = "";
      let filteredTasks = filterTasks(arrayToSearchIn, Object.keys(category)[0]);
      if (filteredTasks.length != 0) {
        filteredTasks.forEach(taskData => {
          let task = getTaskOutOfId(taskData.id);
          categoryContainer.innerHTML += renderTasksHTML(task);
          setCardType(task);
          renderTaskDescription(task);
          renderSubtask(task);
          renderAssignedToButtons(task);
          setTimeout(() => {
            renderTaskImages(task);
          }, 0);
        });
      } else {
        renderEmptyCategory(categoryContainer, Object.values(category)[0]);
      }
    });
  }


 /**
 * Renders the task description by splitting it into words and limiting the length of each word to 46 characters.
 * If the description is longer than the limit, it adds an ellipsis at the end.
 *
 * @param {Object} task - The task object containing the description to be rendered.
 * @return {void} This function does not return anything.
 */
function renderTaskDescription(task){
    let descriptionContainer = document.getElementById('cardText' + task['id']);
    if (!descriptionContainer) return;

    const taskDescription =
      task && typeof task.description === "string" ? task.description : "";
    let cardText = "";
    let taskDescriptionSplitted = taskDescription.split(' ');

    taskDescriptionSplitted.forEach((word) => {
        if (cardText.length + word.length <= 46) cardText = cardText + " " + word;
    })

    cardText = cardText.substring(1);

    if (cardText.length != taskDescription.length) cardText = cardText + " ..."; 

    descriptionContainer.textContent = cardText;
}


/**
 * Filters an array of tasks based on a specified category.
 *
 * @param {Array} arrayToSearchIn - The array of tasks to search through.
 * @param {string} category - The category to filter the tasks by.
 * @return {Array} An array of tasks that match the specified category.
 */
function filterTasks(arrayToSearchIn, category) {
    let filteredTasks = [];
    arrayToSearchIn.forEach((task) => {
        if (task['category'] == category) {
            filteredTasks.push(task);
        }
    });
    return filteredTasks;
}


/**
 * Renders the icons with the initials of the user's name on each card.
 *
 * @param {object} card - The card object containing information about the card
 */
function renderAssignedToButtons(task) {
    let assignedToContainer = document.getElementById('cardAssignedToContainerId' + task['id']);
    let assignedToContacts = task['assignedTo'];

    for (let i = 0; i < assignedToContacts.length; i++) {
        for (let j = 0; j < contacts.length; j++) {
            if (contacts[j]['id'] == assignedToContacts[i])
                assignedToContainer.innerHTML += renderAssignedToButtonsHTML(contacts[j]);
        }
    }
}


/**
 * 
 * @param {object} categoryContainer html-object from the (emtpy) category
 */
function renderEmptyCategory(categoryContainer, name) {
    categoryContainer.innerHTML = renderEmptyCategoryHTML(name);
}


/**
 * 
 * @param {string} taskPriority 
 * @returns html-image-tag
 */
function setPriorityImage(taskPriority) {
    if (taskPriority == 'low') return `<img src="assets/img/icon-priority_low.png">`
    else if (taskPriority == 'medium') return `<img src="assets/img/icon-priority_medium.png">`
    else return `<img src="assets/img/icon-priority_urgent.png">`
}


/**
 * Searches for tasks based on the value of the search input.
 *
 */
function searchTask() {
    let searchInput = document.getElementById('findTask');
    if(searchInput == null) return;
    let foundTasks = tasks.filter(task => task['title'].toLowerCase().includes(searchInput.value) || task['description'].toLowerCase().includes(searchInput.value));
    renderCategories(foundTasks);
}


/**
 * Renders a subtask progress bar and text based on the number of completed subtasks in a task.
 *
 * @param {object} task - The task object containing subtasks.
 * @return {string} The HTML code for the subtask progress bar and text.
 */
function renderSubtask(task) {
    let subtaskContainer = document.getElementById('cardSubtask' + task['id']);
    let countSubtasks = +Object.keys(task['subtasks']).length;
    let completedSubtasks = task['subtasks'].filter(subtask => subtask['completed'] == true).length;
    let completedPercent = completedSubtasks * 100 / countSubtasks;

    if (countSubtasks != 0) {
        subtaskContainer.innerHTML = /*html*/`<progress id="progressTodo" value="${completedPercent}" max="100"></progress><div class="cardSubtasksText">${completedSubtasks}/${countSubtasks} Subtasks</div>`
    }else{
        subtaskContainer.remove();
    }
}


/**
 * Returns the task object with the specified taskId from the tasks array.
 *
 * @param {number} taskId - The ID of the task to retrieve.
 * @return {Object|undefined} The task object with the specified taskId, or undefined if no task is found.
 */
function getTaskOutOfId(taskId){
    return tasks.filter(task => task['id'] == taskId)[0]
}


/**
 * Sets the card type based on the task type.
 *
 * @param {Object} task - The task object containing the type and id.
 * @return {void} This function does not return a value.
 */
function setCardType(task){
    let cardType = document.getElementById(`cardType${task['id']}`);
    let openCardType = document.getElementById(`openCardType${task['id']}`)


    if (task.type == "User Story") {
        cardType.classList.add("cardTypeUserStory");
        if (openCardType) openCardType.classList.add("cardTypeUserStory");
    }else if (task.type == "Technical Task") {
        cardType.classList.add('cardTypeTechnicalTask')
        if (openCardType) openCardType.classList.add("cardTypeTechnicalTask");
    }
}


/**
 * Renders subtasks to the open card based on the task object.
 *
 * @param {object} task - The task object containing subtasks to render.
 */
function renderSubtasksToOpenCard(task){
    let container = document.getElementById('openCardSubtasksContainer');
    if (!container) return;

    container.innerHTML = '';
    const title = document.createElement('span');
    title.className = 'openCardText';
    title.textContent = 'Subtasks:';
    const content = document.createElement('div');
    content.id = 'openCardSubtasks';

    container.appendChild(title);
    container.appendChild(content);
    container.classList.add("openCardSubtasksContainer");

    const safeTaskId = toSafeInteger(task && task.id);
    const subtasks = Array.isArray(task && task.subtasks) ? task.subtasks : [];

    subtasks.forEach((subtask, index) => {
        const subtaskRow = document.createElement('div');
        subtaskRow.className = 'openCardSubtask';
        if (subtask && subtask.completed === true) {
            subtaskRow.setAttribute('completed', '');
        }

        const checkbox = document.createElement('div');
        checkbox.className = 'openCardSubtaskImgContainer';
        checkbox.addEventListener('click', () => setSubtaskState(safeTaskId, index));

        const textNode = document.createElement('span');
        textNode.textContent =
            subtask && typeof subtask.subtaskText === 'string'
                ? subtask.subtaskText
                : '';

        subtaskRow.appendChild(checkbox);
        subtaskRow.appendChild(textNode);
        content.appendChild(subtaskRow);
    });
}


/**
 * Toggles the completion state of a subtask in a task.
 * Also setting the attribute "completed" on the subtask element so the css can handle the image.
 *
 * @param {number} taskId - The ID of the task containing the subtask.
 * @param {number} subtaskIndex - The index of the subtask in the task's subtasks array.
 */
function setSubtaskState(taskId, subtaskIndex){
    let task = getTaskOutOfId(taskId);
    task['subtasks'][subtaskIndex]['completed'] = !task['subtasks'][subtaskIndex]['completed'];
    queueTaskUpsert(taskId);
    let openCardSubtasks = document.getElementsByClassName('openCardSubtask');

    for (let i = 0; i < openCardSubtasks.length; i++) {
        if(i == subtaskIndex) {
            openCardSubtasks[i].getAttribute('completed') == null
            ? openCardSubtasks[i].setAttribute('completed', '') 
            : openCardSubtasks[i].removeAttribute('completed')
        }
    }
}


/**
 * Deletes a task from the tasks array based on the provided taskId.
 *
 * @param {number} taskId - The ID of the task to be deleted.
 */
function openCardDelete(taskId){
    for(let i=0; i<tasks.length; i++){
        if(tasks[i].id == taskId){
            tasks.splice(i, 1);
            break;
        }
    }
    queueTaskDelete(taskId);
    closeCard();
    renderCategories(tasks);
}


/**
 * Opens the edit card for the task with the specified ID.
 *
 * @param {number} taskId - The ID of the task to edit.
 */
function openCardEdit(taskId){
    newTask = getTaskOutOfId(taskId);
    renderEditContainer();
    renderContactsToDropdown();
    renderAssignedContactsContainer();
    renderSubtasks()
    setTaskValuesToFields(newTask);
    renderEditCardImages(newTask);
}


/**
 * Renders the edit container by setting the 'editing' attribute, updating the HTML content of the 'openCardContainer' element, and appending the HTML code for the edit header, main content, and footer.
 */
function renderEditContainer(){
    let container = document.getElementById('openCardContainer');
    container.setAttribute('editing','');
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
 * Sets the values of the task fields in the edit card container.
 */
function setTaskValuesToFields(){
    tempAssignedContacts = [];
    document.getElementById('addTaskEnterTitleInput').value = newTask['title'];
    document.getElementById('addTaskDescriptionInput').value = newTask['description'];
    document.getElementById('addTaskDueDateInput').value = newTask['dueDate'];
    document.getElementById('dropdown-category-title').textContent = newTask['type'];
    setPriorityAppearance(newTask['priority']);
    renderEditCardAssignedContacts();
}


/**
 * Renders the assigned contacts in the edit card container.
 *
 * This function clears the contents of the 'assignedContactsContainer' element and then iterates over the 'assignedTo' array of the 'newTask' object. For each 'id' in the array, it calls the 'assignContactToTask' function to assign the corresponding contact to the task.
 */
function renderEditCardAssignedContacts(){
    document.getElementById('assignedContactsContainer').innerHTML = '';
    newTask['assignedTo'].forEach(id => {
        assignContactToTask(id);
    })
}


/**
 * Saves the edited task by collecting the necessary information, updating the task object,
 * saving the tasks to remote storage, closing the card, printing a confirmation message,
 * and printing the category values from each card.
 *
 * @param {number} taskId - The ID of the task to be saved.
 */
async function saveEditedTask(taskId) {
    const loadResult = await loadTasksFromRemoteStorage();
    if (loadResult.error) {
        return;
    }
    collectInformationsForNewCard();

    let taskToSaveIndex = findTaskIndex(taskId);
    if (taskToSaveIndex === -1) return;

    updateTaskDetails(taskToSaveIndex);
    updateTaskImages(taskToSaveIndex);
    
    await saveTasksToRemoteStorage();
    finalizeEdit();
}

/**
 * Finds the index of the task with the given ID in the 'tasks' array.
 * If no task is found, prints an error message to the console.
 *
 * @param {number} taskId - The ID of the task to find.
 * @return {number} The index of the task in the 'tasks' array, or -1 if no task is found.
 */
function findTaskIndex(taskId) {
    let index = tasks.findIndex(task => task.id === taskId);
    if (index === -1) {
        console.error("saveEditedTask: Kein Task gefunden für ID", taskId);
    }
    return index;
}

/**
 * Updates the task details at the specified index in the 'tasks' array with the values from 'newTask'.
 *
 * @param {number} index - The index of the task in the 'tasks' array to be updated.
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
 * Updates the task images at the specified index in the 'tasks' array with the values from 'newTask' and 'allImages'.
 * The images are concatenated and stored as base64 strings in the 'tasks[index].images' array.
 *
 * @param {number} index - The index of the task in the 'tasks' array to be updated.
 */
function updateTaskImages(index) {
    tasks[index].images = [...newTask.images, ...allImages.map(image => image.base64)];
}

/**
 * Finalizes the edit process by closing the card, displaying a success message,
 * and clearing the 'allImages' array.
 */

function finalizeEdit() {
    closeCard();
    showSuccessMessage();
    allImages = [];
}


/**
 * Generates the HTML code for the header of the edit task section.
 *
 * @return {string} The HTML code for the edit task header.
 */
function createEditHeader(){
    return /*html*/`
<div class="boardEditTaskHeader">
    <button type="button" class="boardAddTaskCloseHoverContainer" data-action="close-card" aria-label="Close edit card"></button>
 </div>
    `
}


/**
 * Generates the HTML code for the footer of the edit task section.
 *
 * @param {Object} task - The task object to be edited.
 * @return {string} The HTML code for the edit task footer.
 */
function createEditFooter(task){
    const safeTaskId = toSafeInteger(task && task.id);

    return /*html*/`
    <div class="addTaskBodyRight">
        <button type="button" class="createBtn addTaskBtn" data-action="save-edited-task" data-task-id="${safeTaskId}" data-stop-propagation="true">
            <span class="addTaskBtnText">Ok</span>
            <span class="createBtnImg"></span>
        </button>
    </div>`
}


/**
 * Creates empty cards and appends them to the specified categories.
 *
 * @param {string} taskId - The ID of the task element.
 * @param {Array<string>} categoryArr - An array of category IDs.
 */
function displayEmptyTask(taskId, categoryId){
    let cardHeight = "min-height: "+  document.getElementById(taskId).clientHeight + "px";
    // let cardHeight = "min-height: 100%";
    let cardWidth = "min-width: "+  document.getElementById(taskId).clientWidth + "px";
    let cardStyle = cardHeight + "; " + cardWidth;
    const boardColumnsMaxWidth =
      typeof getUiBreakpointValue === "function"
        ? getUiBreakpointValue("boardColumnsMax")
        : 1400;

    let newDiv = document.createElement('div');
    newDiv.classList.add('emptyCard');
    if(window.innerWidth <= boardColumnsMaxWidth){
        newDiv.classList.add('vertical')
    }

    newDiv.style = cardStyle;
    document.getElementById('category-' + categoryId).appendChild(newDiv);
}

/**
 * Renders the images of a task inside a container with the ID "cardImagesContainer<task.id>".
 *
 * @param {Object} task - The task object containing the images to be rendered.
 */
function renderTaskImages(task) {
    const container = document.getElementById(`cardImagesContainer${task.id}`);
    if (!container) return;
    container.innerHTML = ""; 
    if (task.images && task.images.length > 0) {
      task.images.forEach(base64 => {
        const img = document.createElement("img");
        img.src = base64;
        img.style.width = "100px";
        img.style.height = "100px";
        img.style.objectFit = "cover";
        img.style.margin = "5px"; 
        container.appendChild(img);
      });
    }
  }

  
/**
 * Renders the images of a task in the open card container.
 *
 * @param {Object} task - The task object containing the images to be rendered.
 */
  function renderOpenCardImages(task) {
    const container = document.getElementById('openCardImagesContainer');
    if (!container) return;
    container.innerHTML = "";
    if (task.images && task.images.length > 0) {
      task.images.forEach(base64 => {
        const img = document.createElement("img");
        img.src = base64;
        img.style.width = "100px";
        img.style.height = "100px";
        img.style.objectFit = "cover";
        img.style.margin = "5px";
        container.appendChild(img);
      });
    }
    const gallery = new Viewer(container);
  }

  
  /**
   * Gets the container element for the edit card images. If the element does not exist yet, it is created and appended to the open card container.
   *
   * @return {HTMLElement} The container element for the edit card images.
   */
  function getEditCardImagesContainer() {
    let container = document.getElementById('editCardImagesContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'editCardImagesContainer';
      container.className = 'editCardImagesContainer';
      const openCard = document.getElementById('openCardContainer');
      openCard.appendChild(container);
    }
    return container;
  }

  
  /**
   * Creates a thumbnail element with the given base64 image and delete button.
   *
   * @param {string} base64 - The base64 encoded image string.
   * @param {number} index - The index of the image in the task's images array.
   * @param {Object} task - The task object containing the images array.
   *
   * @return {HTMLElement} The created thumbnail element.
   */
  function createThumbnailElement(base64, index, task) {
    const thumb = document.createElement('div');
    thumb.className = 'editThumbnailWrapper';
    const img = document.createElement('img');
    img.src = base64;
    img.style.cssText = "width:100px;height:100px;object-fit:cover;margin:5px;";
    const btn = document.createElement('button');
    btn.textContent = 'X'; 
    btn.className = 'delete-edit-thumbnail';
    btn.setAttribute('aria-label', 'Delete attachment');
    btn.addEventListener('click', e => { 
      e.stopPropagation(); 
      task.images.splice(index, 1); 
      renderEditCardImages(task); 
    });
    thumb.appendChild(img); 
    thumb.appendChild(btn);
    return thumb;
  }

  
/**
 * Renders the images of a task in the edit card, displaying them as thumbnails with delete buttons.
 *
 * Clears the contents of the edit card images container and iterates over the task's images array.
 * For each image, it creates a thumbnail element using createThumbnailElement and appends it to the container.
 * If no images are present, it displays a message indicating no images are attached.
 *
 * @param {Object} task - The task object containing the images to be rendered.
 */

  function renderEditCardImages(task) {
    const container = getEditCardImagesContainer();
    container.innerHTML = "";
    if (task.images && task.images.length > 0) {
      task.images.forEach((base64, index) => {
        container.appendChild(createThumbnailElement(base64, index, task));
      });
    } else {
      container.innerHTML = '<p>No images attached.</p>';
    }
  }

  
