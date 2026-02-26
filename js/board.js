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
