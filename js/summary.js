"use strict";

let loggedUser;
let globalCapitalizedName;
let dayTime;
let mobileGreetingTimeoutId = null;
let summaryTasks = [];
const SUMMARY_CATEGORY_TO_AMOUNT_ID = Object.freeze({
    'category-0': 'amountTodo',
    'category-1': 'amountInProgress',
    'category-2': 'amountAwaitFeedback',
    'category-3': 'amountDone',
    'category-4': 'amountEmailTasks',
});


/**
 * Initializes the summary by including the HTML and getting the current date.
 */
async function summaryInit() {
    includeHTML();
    const tasksLoadResult = await loadSummaryTasksFromRemoteStorage();
    if (tasksLoadResult.error) {
        return;
    }
    getLoggedUser();
    getUserNameForGreeting();
    getDate();
    greetAccordingToDayTime();
    greetUserMobile();
    loadAmounts();
    getUrgentTasks();
    buttonEventListener();
}


/**
 * Retrieves the currently logged in user by calling the getCurrentUser function and assigns it to the loggedUser variable.
 */
function getLoggedUser() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        loggedUser = currentUser.username
    }
}


/**
 * Generates a greeting based on the current time.
 */
function greetAccordingToDayTime() {
    let nowTime = new Date();
    let hours = nowTime.getHours();

    if (hours <= 12) {
        dayTime = "Good Morning";
    } else if (hours <= 18) {
        dayTime = "Good Afternoon";
    } else if (hours > 18) {
        dayTime = "Good Evening";
    }

    document.getElementById('daytimeGreeting').innerHTML = '';
    loggedUser = getCurrentUser();
    if (loggedUser) {
        dayTime += ",";
    }
    document.getElementById('daytimeGreeting').innerHTML = `${dayTime} `;
}


/**
* Retrieves the current user's name and triggers personalized greeting.
*/
function getUserNameForGreeting() {
    if (loggedUser) {
        let capitalizedName = getCapitalizedDisplayName(loggedUser);
        greet(capitalizedName);
    }
}


/**
 * Greets the user with the capitalized name.
 * @param {string} capitalizedName - The capitalized name of the user to greet.
 */
function greet(capitalizedName) {
    let usernameForGreeting = document.getElementById("usernameForGreeting");
    usernameForGreeting.innerHTML = '';
    usernameForGreeting.innerHTML = capitalizedName;
    globalCapitalizedName = capitalizedName;
    adjustGreeting();
}


/**
 * Adjusts the greeting displayed on the page to "Good Morning, ".
 */
function adjustGreeting() {
    let daytimeGreeting = document.getElementById("daytimeGreeting");
    daytimeGreeting.innerHTML = '';
    daytimeGreeting.classList.remove("daytimeGreeting");
    daytimeGreeting.classList.add("userGreeting");
}


/**
 * get the actual date
 * @returns English (US) formatted Date
 */
function getDate() {
    let today = new Date();
    let options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    document.getElementById("date").innerHTML = today.toLocaleDateString("en-US", options);
}


/**
 * Loads and renders summary counts from category-grouped task totals.
 */
function loadAmounts() {
    const categoryAmounts = countSummaryTasksByCategory(summaryTasks);
    showAmounts(categoryAmounts);
}


/**
 * Counts tasks per category for all recognized board category keys.
 *
 * @param {Array<Object>} tasksToCount - Task list.
 * @returns {Object<string, number>} Category totals keyed by category id.
 */
function countSummaryTasksByCategory(tasksToCount) {
    const counts = {};
    const sourceTasks = Array.isArray(tasksToCount) ? tasksToCount : [];
    sourceTasks.forEach((task) => {
        if (!task || typeof task.category !== 'string') {
            return;
        }
        const normalizedCategory = task.category.trim();
        if (!/^category-\d+$/.test(normalizedCategory)) {
            return;
        }

        if (!Object.prototype.hasOwnProperty.call(counts, normalizedCategory)) {
            counts[normalizedCategory] = 0;
        }
        counts[normalizedCategory] += 1;
    });
    return counts;
}

/**
 * Updates summary widgets based on category totals.
 *
 * @param {Object<string, number>} categoryAmounts - Category totals keyed by category id.
 */
function showAmounts(categoryAmounts) {
    const normalizedAmounts = categoryAmounts && typeof categoryAmounts === 'object' ? categoryAmounts : {};
    Object.keys(SUMMARY_CATEGORY_TO_AMOUNT_ID).forEach((categoryKey) => {
        const elementId = SUMMARY_CATEGORY_TO_AMOUNT_ID[categoryKey];
        const targetElement = document.getElementById(elementId);
        if (!targetElement) {
            return;
        }
        const amount = Number(normalizedAmounts[categoryKey] || 0);
        targetElement.innerHTML = amount;
    });

    const amountAllBoardTasks = document.getElementById("amountAllBoardTasks");
    if (!amountAllBoardTasks) {
        return;
    }
    amountAllBoardTasks.innerHTML = Object.values(normalizedAmounts).reduce(
        (sum, current) => sum + Number(current || 0),
        0
    );
}


/** Retrieves the tasks with priority "urgent" from the tasks array.
* @return {Array} The array of tasks with priority "urgent".
*/
function getUrgentTasks() {
    let urgentTasks = [];
    for (let i = 0; i < summaryTasks.length; i++) {
        let task = summaryTasks[i];
        if (
            task &&
            task.priority === 'urgent' &&
            typeof task.category === 'string' &&
            /^category-\d+$/.test(task.category) &&
            task.category !== 'category-3'
        ) {
            urgentTasks.push(task);
        }
    }
    showUrgentTasks(urgentTasks);
    return urgentTasks;
}


/**
 * Updates the HTML element with the ID "amountUrgent" to display the number of urgent tasks.
 * @param {Array} urgentTasks - An array of urgent tasks.
  */

function showUrgentTasks(urgentTasks) {
    let amountUrgentTasksContainer = document.getElementById("amountUrgent");
    amountUrgentTasksContainer.innerHTML = urgentTasks.length;
}


/**
 * Attaches a click event listener to all elements with the class 'square-button' and 'urgentAndDate'.
 * When clicked, the function switches the page to 'board.html'.
 */
function buttonEventListener() {
    const summaryButtons = document.querySelectorAll('.square-button, .urgentAndDate');
    summaryButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchPage('board.html');
        });
    });
}


/**
 * Displays a mobile greeting overlay on tablet/mobile breakpoints.
 */
function greetUserMobile() {
    if (typeof getUiBreakpointValue !== 'function') {
        console.warn("Missing getUiBreakpointValue runtime helper.");
        return;
    }

    const mobileGreetingMaxWidth = getUiBreakpointValue('navigationTabletMax');

    if (window.innerWidth <= mobileGreetingMaxWidth && document.referrer.includes('index')) {
        const { greetingContainer, subMainSummary, bitGreeting, main } = getSummaryGreetingElements();
        if (!greetingContainer || !subMainSummary || !main) {
            return;
        }

        greetingContainer.style.display = 'flex';
        greetingContainer.classList.remove('d-none');
        main.classList.add('hide-scroll');
        if (bitGreeting) {
            bitGreeting.style.display = 'none';
        }
        subMainSummary.style.overflow = 'hidden';
        subMainSummary.classList.remove('sub-main-summary');
        subMainSummary.classList.add('d-none');

        mobileGreeting();
        if (mobileGreetingTimeoutId) {
            clearTimeout(mobileGreetingTimeoutId);
        }
        mobileGreetingTimeoutId = setTimeout(hideMobileGreeting, 2500);
    }
}


/**
 * Hides the mobile greeting by setting the display style of the 'greetingContainer' element to 'none'and adding 'sub-main-summary' class to 'subMainSummary' element and removing 'd-none' class.
 */
function hideMobileGreeting() {
    const { greetingContainer, subMainSummary, main } = getSummaryGreetingElements();
    if (!greetingContainer || !subMainSummary || !main) {
        return;
    }

    greetingContainer.style.display = 'none';
    greetingContainer.classList.add('d-none');
    main.classList.remove('hide-scroll');
    subMainSummary.classList.add('sub-main-summary');
    subMainSummary.classList.remove('d-none');
    subMainSummary.style.overflow = '';
    mobileGreetingTimeoutId = null;
}

/**
 * Returns DOM references required by summary greeting overlays.
 *
 * @returns {{greetingContainer: HTMLElement|null, subMainSummary: HTMLElement|null, bitGreeting: HTMLElement|null, main: HTMLElement|null}}
 */
function getSummaryGreetingElements() {
    return {
        greetingContainer: document.getElementById('greetingContainer'),
        subMainSummary: document.getElementById('subMainSummary'),
        bitGreeting: document.getElementById('h1GreetingUser'),
        main: document.getElementById('main'),
    };
}


/**
 * Sets the mobile greeting based on the current state of the application.
 */
function mobileGreeting() {
    const mobileGreeting = document.getElementById('mobileGreeting');
    const mobileGreetingUsername = document.getElementById('mobileGreetingUsername');
    if (!mobileGreeting || !mobileGreetingUsername) {
        return;
    }

    if (loggedUser) {
        mobileGreeting.innerHTML = `${dayTime},`;
        mobileGreeting.classList.remove('mobile-guest-greeting');
        mobileGreeting.style.fontWeight = '';
        mobileGreetingUsername.innerHTML = globalCapitalizedName;
    } else {
        mobileGreeting.innerHTML = `${dayTime}`;
        mobileGreeting.classList.add('mobile-guest-greeting');
        mobileGreeting.style.fontWeight = 'bold';
        mobileGreetingUsername.innerHTML = '';
    }
}

/**
 * Loads summary task data from Firebase and normalizes optional task fields.
 *
 * @returns {Promise<{data:Array,error:Error|null}>} Safe load result.
 */
async function loadSummaryTasksFromRemoteStorage() {
    const loadResult = await firebaseGetArraySafe(FIREBASE_TASKS_ID, {
        context: 'tasks',
        errorMessage: 'Could not load tasks for summary.',
    });
    summaryTasks = Array.isArray(loadResult.data) ? loadResult.data : [];
    summaryTasks.forEach((task) => {
        if (!task.hasOwnProperty('subtasks')) task.subtasks = [];
        if (!task.hasOwnProperty('assignedTo')) task.assignedTo = [];
    });
    return loadResult;
}

/**
 * Filters task entries by summary category key.
 *
 * @param {Array<Object>} tasksToFilter - Source tasks.
 * @param {string} category - Category key.
 * @returns {Array<Object>} Filtered tasks.
 */
function filterSummaryTasks(tasksToFilter, category) {
    return tasksToFilter.filter((task) => task && task.category === category);
}

/**
 * Returns a display-friendly name with capitalized first letters per word.
 *
 * @param {string} name - Raw user name.
 * @returns {string}
 */
function getCapitalizedDisplayName(name) {
    if (typeof name !== 'string' || name.trim() === '') {
        return '';
    }

    return name
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
