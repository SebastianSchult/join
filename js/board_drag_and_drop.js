/**
 * Sets the droppable containers for a given task ID based on its category.
 *
 * @param {string} taskId - The ID of the task element.
 */
function setDroppableContainers(taskId){
    let category = getTaskOutOfId(taskId)['category'].slice(-1)
    for (let i=0; i<4; i++){
        if (i != category){
           displayEmptyTask(taskId, i);
        }
    }
}


/**
 * Starts the dragging process for a task.
 *
 * @param {string} taskId - The ID of the task element being dragged.
 */
function startDragging(taskId){
    currentDraggedElement = taskId;
    document.getElementById(taskId).classList.add('dragging');
    setDroppableContainers(taskId)
}


/**
 * Stops the dragging process by removing the 'drag-area-highlight' class from all categories
 * and the 'dragging' class from all tasks.
 */
function stopDragging(){
    categories.forEach(category => {
        document.getElementById(Object.keys(category)[0]).classList.remove('drag-area-highlight');
    });

    tasks.forEach(task => {
        document.getElementById(task.id).classList.remove('dragging');
    });
}


/**
 * Prevents the default behavior of the event, which is to allow the browser to handle the drag and drop operation.
 *
 * @param {Event} event - The event object representing the drag and drop event.
 */
function allowDrop(event){
    event.preventDefault();
}


/**
 * Moves a task to a specified category.
 *
 * @param {string} category - The category to move the task to.
 */
function moveTo(category){
    let task = getTaskOutOfId(currentDraggedElement);
    task['category'] = category;
    queueTaskUpsert(task.id);
    renderCategories(tasks);
    saveTasksToRemoteStorage();
}
