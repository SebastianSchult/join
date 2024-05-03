let loggedUser;

/**
 * Initializes the summary by including the HTML and getting the current date.
 *
 * @return {void} This function does not return anything.
 */
async function summaryInit() {
    includeHTML();
    // highlightActivePage(0);
    getUserNameForGreeting();
    getDate();
    greetAccordingToDayTime();

}


/**
 * Generates a greeting based on the current time.
 */
function greetAccordingToDayTime() {
    let nowTime = new Date();
    let hours = nowTime.getHours();
    let status = (hours < 12) ? "Good Morning" :
        ((hours <= 18 && hours >= 12) ? "Good Afternoon" : "Good Night");

    document.getElementById('daytimeGreeting').innerHTML = '';
    loggedUser = getCurrentUser();
    console.log('loggedUser Fkt1', loggedUser);
    if (loggedUser) {
        status += ",";
    }
    document.getElementById('daytimeGreeting').innerHTML = `${status} `;
}


/**
* Retrieves the current user's name and triggers personalized greeting.
*/
function getUserNameForGreeting() {
    loggedUser = getCurrentUser();
    if (loggedUser) {
        let capitalizedName = getNameWithCapitalizedFirstLetter(loggedUser.name);
        console.log('loggedUser 2.Fkt', loggedUser);
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
    adjustGreeting();
}


/**
 * Adjusts the greeting displayed on the page to "Good Morning, ".
 */
function adjustGreeting() {
    let daytimeGreeting = document.getElementById("daytimeGreeting");
    daytimeGreeting.innerHTML = '';
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








