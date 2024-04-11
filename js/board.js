let cards = [
    {
        'id': 1,
        'type':'User Story',
        'title':'Kochwelt Page & Recipe Recommender',
        'text': 'Build start page with recipe recommendation...',
        'subtasks': 2,
        'completedSubtasks': 1,
        'assignedTo': [21],
        'category': 'todo',
        'priority': 'low'
    },
    {
        'id': 2,
        'type':'Technical Task',
        'title':'HTML Base Template Creation',
        'text': 'Create reusable HTML base templates...',
        'subtasks': 2,
        'completedSubtasks': 0,
        'assignedTo': [21, 2, 5],
        'category': 'todo',
        'priority': 'medium'
    },
    {
        'id': 3,
        'type':'User Story',
        'title':'Daily Kochwelt Recipe',
        'text': 'Implement daily recipe and portion calculator...',
        'subtasks': 2,
        'completedSubtasks': 0,
        'assignedTo': [17],
        'category': 'inProgress',
        'priority': 'urgend'
    },
    {
        'id': 4,
        'type':'Technical Task',
        'title':'CSS Architecture Planning',
        'text': 'Define CSS naming conventions and structure...',
        'subtasks': 2,
        'completedSubtasks': 1,
        'assignedTo': [9, 18],
        'category': 'todo',
        'priority': 'low'
    },
    {
        'id': 5,
        'type':'Technical Task',
        'title':'Cooking lunch',
        'text': 'Define CSS naming conventions and structure...',
        'subtasks': 2,
        'completedSubtasks': 2,
        'assignedTo': [9],
        'category': 'done',
        'priority': 'low'
    }
]

/**
 * All available cards will be filtered for the category
 * @param {string} toFilterFor the category's name (e.g. 'done')
 * @returns array with cards fitting category
 */
function filterCardsForCategory(toFilterFor){
    let card = cards.filter(c => c['category'] == toFilterFor);
    return card;
}

/**
 * render the cards inside each category
 */
function renderCategories(){
    let categories = ['todo','inProgress','awaitFeedback','done']

    categories.forEach(category => {
        let content = document.getElementById(category);
        let filteredCards = cards.filter(card => card['category'] == category);
        
        renderCardsHTML(content, filteredCards)
    });
}

function getAssignedToButtons(arrAssignedTo){

    let assignedToButtons = [];
    console.log(arrAssignedTo.length);
    for (let i=0; i<arrAssignedTo.length; i++){
        assignedToButtons.push(`<div class="assignedToButton">${arrAssignedTo[i]}</div>`)
    }
    console.log(assignedToButtons);
    return assignedToButtons;
}


function getContactInformationsForAssignedToButtons(id){
    contacts.forEach(c => {
        if(c.id == id){ 
            console.log(getInitials(c.name));
        }
        else{
            return '??'
        }
    })
}

function setPriorityImage(cardPriority){
    if (cardPriority == 'low') return `<img src="assets/img/icon-priority_low.png">`
    else if (cardPriority == 'medium') return `<img src="assets/img/icon-priority_medium.png">`
    else return `<img src="assets/img/icon-priority_high.png">`
}


function searchTask(){
    console.log('TBD');
}


function renderSubtask(card){
    let countSubtasks = card['subtasks'];
    let completedSubtasks = card['completedSubtasks'];
    let completedPercent = completedSubtasks * 100 / countSubtasks;

    console.log(countSubtasks);
    if (countSubtasks == 0){
        return `Nothing`
    }else{
        return `<progress id="progressTodo" value="${completedPercent}" max="100"></progress><div class="cardSubtasksText">${card['completedSubtasks']}/${card["subtasks"]} Subtasks</div>`
    }

}