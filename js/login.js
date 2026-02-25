"use strict";

/**
 * Initializes the login process by including HTML, setting default inputs, and starting an animation.
 */
let users = [];

async function loginInit() {
    checkIfUserIsRemembered();

    if (!checkIfUserWasPreviouslyRegistered()) {
        addBlueOverlay()
        showOverlay();
    };
}

/**
 * Adds a blue overlay to the 'blueOverlay' element by setting its inner HTML to the result of addBlueOverlayHTML and adding a 'blue-overlay' class to it.
 *
 * @return {void} 
 */
function addBlueOverlay(){
    let overlay = document.getElementById('blueOverlay');
    overlay.classList.add('blue-overlay');
    overlay.innerHTML = addBlueOverlayHTML();
}

/**
 * Generates HTML code for adding a blue overlay element with a logo image.
 *
 * @return {string} The HTML code for the blue overlay element.
 */
function addBlueOverlayHTML(){
    return /*html*/`<div id="logo">
        <img src="./assets/img/logo-big_white.png" alt="logo" class="joinLogoWhite logo-animation">
    </div>`
}

/**
 * Checks if a user was previously registered by retrieving the 'newMail' item from localStorage.
 * If the item exists, it sets the value of the 'loginEmailInput' element to the retrieved email and removes the 'newMail' item from localStorage.
 */
function checkIfUserWasPreviouslyRegistered() {
    if (localStorage.getItem('newMail')) {
        document.getElementById('loginEmailInput').value = localStorage.getItem('newMail');
        localStorage.removeItem('newMail');
        return true;
    }
}

/**
 * Asynchronously loads users from Firebase and migrates legacy plaintext passwords.
 *
 * @return {Promise<void>} A promise that resolves when users are loaded and migrated if needed.
 */
async function loadUsers() {
    const loadResult = await firebaseGetArraySafe(FIREBASE_USERS_ID, {
        context: "users",
        showErrorMessage: false,
    });
    users = loadResult.data;

    if (loadResult.error) {
        throw loadResult.error;
    }

    if (!Array.isArray(users)) {
        users = [];
        return;
    }

    const migration = await migrateLegacyPlaintextPasswords(users);
    if (migration.changed) {
        await firebaseUpdateItem(users, FIREBASE_USERS_ID);
    }
}

function findUserByEmail(email) {
    const normalizedEmail = normalizeAuthEmail(email);
    return users.find(
        (user) => normalizeAuthEmail(user.mail) === normalizedEmail
    );
}

/**
 * Shows the overlay if the user is not logged in.
 */
function showOverlay() {
    // document.getElementById("blueOverlay").style.display = "flex";
    if (!getCurrentUser()) {
        document.getElementById('main').classList.add('hide-scroll');

        startAnimation();
    } else {
        switchPage('summary.html');
    }
}

/**
 * Executes an animation by displaying a blue overlay and adding a logo animation class to the logo element after a delay of 3 seconds.
 */
async function startAnimation() {
    return new Promise(resolve => {
        setTimeout(() => {
            const logo = document.getElementById("logo");
            logo.classList.add("goal");
            setTimeout(() => {
                resolve();
                hideOverlay();
            }, 500);
        }, 500);
    });
}

/**
 * Hiding the blue overlay
 */
function hideOverlay() {
    // document.getElementById('loginMainContainer').style.overflow = 'auto';
    document.getElementById('main').classList.remove('hide-scroll');
    document.getElementById("blueOverlay").style.display = "none";
}

/**
 * Logs in a user by verifying the password hash stored for the account.
 * If a matching user is found, it sets the current user and switches the page to 'summary.html'.
 *
 * @return {boolean} Returns false to prevent the form from submitting again.
 */
async function loginUser() {
    const email = document.getElementById('loginEmailInput').value;
    const password = document.getElementById('loginPasswordInput').value;

    try {
        await loadUsers();
        const user = findUserByEmail(email);
        const isValidPassword = user
            ? await verifyPasswordCredentials(user, password)
            : false;
        users = [];

        if (isValidPassword) {
            setCurrentUser(user.name); // sessionStorage
            setRememberMe(user.name); // localStorage
            switchPage('summary.html');
        } else {
            showGlobalUserMessage('Invalid email or password. Please try again.');
        }
    } catch (error) {
        users = [];
        console.error('Login failed:', error);
        showGlobalUserMessage('Login failed. Please try again.');
    }

    return false;
}

/**
 * Sets the value of the 'rememberedUser' key in the localStorage if the 'loginCheckbox' element has the 'checked' attribute.
 * @param {string} name - The username to be stored in the 'rememberedUser' object.
 */
function setRememberMe(name) {
    if (document.getElementById('loginCheckbox').hasAttribute('checked')) {
        localStorage.setItem('rememberedUser', JSON.stringify({ username: name }));
    }
}

/**
 * Toggles the appearance of the remember me checkbox image when clicked.
 */
function toggleRememberMeCheckbox() {
    let loginCheckbox = document.getElementById('loginCheckbox');
    let loginCheckboxImg = document.getElementById('loginCheckboxImg');

    if (loginCheckbox.hasAttribute('checked')) {
        loginCheckboxImg.src = './assets/img/icon-check_button_unchecked.png';
        loginCheckbox.removeAttribute('checked');
    } else {
        loginCheckboxImg.src = './assets/img/icon-check_button_checked.png';
        loginCheckbox.setAttribute('checked', '');
    };
}

/**
 * Switches the page to the summary page for guest login.
 */
function loginAsGuest() {
    switchPage('summary.html');
}

/**
 * Switches the page to the sign up page.
 */
function gotoSignUp() {
    switchPage('signUp.html');
}
