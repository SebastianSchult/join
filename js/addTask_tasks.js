let tempAssignedContacts = [];
let tempPriority = '';
let tempSubtasks = [];
let isValid = false;
let requiredInputFields = [
    {
        'id': 'addTaskEnterTitleInput',
        'requiredFieldId': 'requiredTitle',
        'idForRedUnderline':  'addTaskEnterTitleInput',
        'state': false
    },
    {
        'id': 'addTaskDueDateInput',
        'requiredFieldId': 'requiredDueDate',
        'idForRedUnderline': 'addTaskDueDateInputContainer',
        'state': false
    }
];

let newTask = 
    {
        'id': 999,
        'type': '',
        'title': '',
        'description': '',
        'subtasks': [],
        'assignedTo': [],
        'category': 'category-0',
        'priority': '',
        'dueDate': '',
        'images': []
};

let pendingTaskUpserts = new Set();
let pendingTaskDeletes = new Set();


/**
 * Adds a new subtask to the list of tasks.
 */
function addSubtask(){
    let subtaskInputField = document.getElementById('subtaskInputField');
    if(subtaskInputField.value != ''){

        newTask.subtasks.push({
            'id': newTask.subtasks.length,
            'subtaskText' : subtaskInputField.value,
            'completed': false
        })
    }
    renderSubtasks();
}


/**
 * Updates the HTML content of a subtask container with the HTML code for editing the subtask.
 *
 * @param {number} id - The ID of the subtask to be edited.
 */
function editSubtask(id){
    if (checkIfAnySubtaskIsInEditingMode()) {
        return;
    }
    let subtaskContainer = document.getElementById('subtask' + id);
    let subtask = newTask.subtasks.find(subtask => subtask.id == id);
    subtaskContainer.classList.add("editing")
    subtaskContainer.innerHTML = editSubtaskHTML(subtask);
}


/**
 * Updates the subtask text based on the provided ID.
 *
 * @param {number} id - The ID of the subtask to be updated.
 */
function saveEditSubtask(id){
    let newText = document.getElementById('subtaskEditInputField');
    newTask.subtasks.forEach(subtask => {
        if (subtask.id == id){
            subtask.subtaskText = newText.value;
        }
    })
    renderSubtasks();
}


/**
 * Deletes a subtask from the `newTask.subtasks` array based on the provided `subtaskId`.
 *
 * @param {number} subtaskId - The ID of the subtask to be deleted.
 */
function deleteSubtask(subtaskId){
    newTask.subtasks.forEach((subtask, index) => {
        if (subtask.id == subtaskId){
            newTask.subtasks.splice(index, 1);
        }
    })
    renderSubtasks();
}


/**
 * Fetches information for a new card by setting values for id, type, title, description, assignedTo, category, priority, and due date of a new task.
 */
function collectInformationsForNewCard(){
    if (!checkIfCardIsEditing()){
        newTask.id = getNewTaskId();
    }
    if (
        typeof AddTaskFormDomain === "object" &&
        typeof AddTaskFormDomain.mapTaskPayloadFromForm === "function"
    ) {
        AddTaskFormDomain.mapTaskPayloadFromForm(newTask, {
            assignedTo: tempAssignedContacts,
            defaultType: "User Story",
        });
        return;
    }

    newTask.title = document.getElementById('addTaskEnterTitleInput').value;
    newTask.description = document.getElementById('addTaskDescriptionInput').value;
    newTask.assignedTo = tempAssignedContacts;
    newTask.dueDate = document.getElementById('addTaskDueDateInput').value;
    if (newTask.type === '') newTask.type = 'User Story';
}


/**
 * Clears the form by resetting the values of the `newTask` object, the `tempAssignedContacts` array,
 * and renders the add task form HTML.
 */
function clearFormular(){
    newTask.id = 999;
    newTask.subtasks = [];
    tempAssignedContacts = [];
    renderAddTaskHTML();
}


/**
 * Function to create a new task.
 *
 * @return {Promise<void>} A Promise that resolves once the task is created.
 */
async function createTask(){
    const loadResult = await loadTasksFromRemoteStorage();
    if (loadResult.error) {
        return;
    }
    collectInformationsForNewCard();
    newTask.images = allImages.map(image => image.base64);
    tasks.push(newTask);
    queueTaskUpsert(newTask.id);
    await saveTasksToRemoteStorage();
    showSuccessMessage();
    resetNewTask();
    allImages = [];
}

/**
 * Resets the `newTask` object to its initial state and clears the `tempAssignedContacts` array.
 */
function resetNewTask(){
    newTask =
    {
        'id': 999,
        'type': '',
        'title': '',
        'description': '',
        'subtasks': [],
        'assignedTo': [],
        'category': 'category-0',
        'priority': '',
        'dueDate': '',
        'images': []
    };
    tempAssignedContacts = [];
}


/**
* Saves tasks to the remote storage.
*
*/
async function saveTasksToRemoteStorage(){
  deactivateButton('createBtn');

  const upsertIds = Array.from(pendingTaskUpserts);
  const deleteIds = Array.from(pendingTaskDeletes);

  if (upsertIds.length === 0 && deleteIds.length === 0) {
      activateButton('createBtn', 'create-task');
      return;
  }

  try {
      const patchPayload = buildTaskPatchPayload(upsertIds);
      if (Object.keys(patchPayload).length > 0) {
          await firebasePatchCollection(patchPayload, FIREBASE_TASKS_ID);
      }

      for (let i = 0; i < deleteIds.length; i++) {
          await firebaseDeleteEntity(deleteIds[i], FIREBASE_TASKS_ID);
      }

      pendingTaskUpserts.clear();
      pendingTaskDeletes.clear();
  } catch (error) {
      console.error('Failed to persist task changes:', error);
      showGlobalUserMessage('Could not save task changes. Please try again.');
  } finally {
      activateButton('createBtn', 'create-task');
  }
}


/**
* Loads tasks from remote storage and updates task properties if necessary.
*
*/
async function loadTasksFromRemoteStorage(){
   const loadResult = await firebaseGetArraySafe(FIREBASE_TASKS_ID, {
      context: 'tasks',
      errorMessage: 'Could not load tasks. Please try again.',
   });
   tasks = loadResult.data;
   tasks.forEach(task => {
       if(!task.hasOwnProperty('subtasks')) task.subtasks = []; 
       if(!task.hasOwnProperty('assignedTo')) task.assignedTo = [];
   })
   return loadResult;
}


/**
 * Assigns a contact to a task based on the provided id.
*
* @param {number} id - The id of the task to assign the contact to.
*/
function assignContactToTask(id){
    if (contacts.find(contact => contact.id == id)){
        let dropdownContact = document.getElementById('assignedToContact' + id);
        let dropdownCheckboxImage = dropdownContact.lastElementChild;

        setDropdownContactAppearance(dropdownContact, dropdownCheckboxImage);
        toggleAssignedContactsContainer();
        pushContactToTempAssignedContacts(id);
        renderAssignedContactsContainer();
    }
}


/**
 * Pushes the given ID to the temporary assigned contacts array if it is not already present.
 * If the ID is already present, it removes it from the array.
 *
 * @param {number} id - The ID to be pushed or removed from the temporary assigned contacts array.
 */
function pushContactToTempAssignedContacts(id){
    if (tempAssignedContacts.indexOf(id) == -1){
        tempAssignedContacts.push(id)
    }else{
        tempAssignedContacts.splice(tempAssignedContacts.indexOf(id), 1)
    }
}


/**
 * Retrieves the new task ID based on the length of the tasks array.
 *
 * @return {number} The new task ID.
 */
function getNewTaskId(){
    return generateCollisionSafeId(tasks);
}

function queueTaskUpsert(taskId){
    const normalizedId = Number(taskId);
    if (!Number.isSafeInteger(normalizedId)) {
        return;
    }
    pendingTaskDeletes.delete(normalizedId);
    pendingTaskUpserts.add(normalizedId);
}

function queueTaskDelete(taskId){
    const normalizedId = Number(taskId);
    if (!Number.isSafeInteger(normalizedId)) {
        return;
    }
    pendingTaskUpserts.delete(normalizedId);
    pendingTaskDeletes.add(normalizedId);
}

function buildTaskPatchPayload(taskIds){
    const payload = {};
    taskIds.forEach((id) => {
        const task = getTaskById(id);
        if (task) {
            payload[id] = task;
        }
    });
    return payload;
}

function getTaskById(taskId){
    for (let i = 0; i < tasks.length; i++) {
        if (Number(tasks[i].id) === Number(taskId)) {
            return tasks[i];
        }
    }
    return null;
}


/**
 * Sets the priority for a new card.
 *
 * @param {string} priority - The priority level of the new card.
 */
function setPriorityForNewCard(priority){
    newTask.priority = priority;
}


/**
 * Toggles the required message based on the state of the required input field.
 *
 * @param {Object} requiredInputField - The required input field object containing necessary ids and state.
 */
function toggleRequiredMessage(requiredInputField){
    let requiredMessageField = document.getElementById(requiredInputField.requiredFieldId);
    let toUnderline = document.getElementById(requiredInputField.idForRedUnderline);
    let inputField = document.getElementById(requiredInputField.id);

    if (inputField) {
        inputField.setAttribute('aria-describedby', requiredInputField.requiredFieldId);
    }

    if (getStateOfRequriredField(requiredInputField)){
        requiredInputField.state = true;
        toUnderline.classList.remove('is-invalid');
        if (inputField) {
            inputField.setAttribute('aria-invalid', 'false');
        }
        requiredMessageField.textContent = "";
    } else {
        requiredInputField.state = false;
        toUnderline.classList.add('is-invalid');
        if (inputField) {
            inputField.setAttribute('aria-invalid', 'true');
        }
        requiredMessageField.textContent = "This field is required";
    }
    setCreateBtnState();
}
