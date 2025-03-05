/**
 * Initializes the login process by including HTML, setting default inputs, and starting an animation.
 */
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
 * Asynchronously loads the users from the 'contacts' item in local storage and parses it into a JavaScript object.
 * @return {Promise<void>} A promise that resolves when the users have been loaded and parsed.
 */
async function loadUsers() {
    users = await firebaseGetItem(FIREBASE_USERS_ID);
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
 * Logs in a user by finding the user with matching email and password in the users array.
 * If a matching user is found, it sets the current user and switches the page to 'summary.html'.
 *
 * @return {boolean} Returns false to prevent the form from submitting again.
 */
async function loginUser() {
    let email = document.getElementById('loginEmailInput').value;
    let password = document.getElementById('loginPasswordInput').value;
    await loadUsers();
    let loggedUser = users.find(user => user.mail == email && user.password == password);
    users = [];
    if (loggedUser) {
        setCurrentUser(loggedUser.name); // sessionStorage
        setRememberMe(loggedUser.name); // localStorage
        switchPage('summary.html');
    } else {
        showUserMessage('Invalid email or password. Please try again.');
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

/**
 * Shows an error message for the given inputElement by creating a .error-message span and adding the message text to it.
 * Adds the 'error' class to the inputElement for CSS styling.
 * If an error message already exists, overwrites the text content of the existing error message.
 * @param {HTMLInputElement} inputElement - The element to show the error message for.
 * @param {string} message - The error message to display.
 */
function showError(inputElement, message) {
  const container = inputElement.closest('.signUpInputField');
  let errorEl = container.querySelector('.error-message');
  if (!errorEl) {
    errorEl = document.createElement('span');
    errorEl.className = 'error-message';
    container.appendChild(errorEl);
  }
  errorEl.textContent = message;
  inputElement.classList.add('error');
}

/**
 * Clears any error message for the given inputElement by removing the text content from the containing
 * .error-message span and removing the 'error' class from the inputElement.
 * @param {HTMLInputElement} inputElement - The element to clear any error message for.
 */
function clearError(inputElement) {
  const container = inputElement.closest('.signUpInputField');
  const errorEl = container.querySelector('.error-message');
  if (errorEl) {
    errorEl.textContent = '';
  }
  inputElement.classList.remove('error');
}

/**
 * Validates the name input field by checking against a regex pattern that allows letters and spaces.
 * Displays an error message if the input is empty or does not match the pattern.
 * Clears any error message if the input is valid.
 *
 * @return {boolean} Returns true if the name input is valid, false otherwise.
 */

function validateName() {
  const nameInput = document.getElementById('signUpNameInput');
  const nameValue = nameInput.value.trim();
  const nameRegex = /^[A-Za-zäöüÄÖÜß\s]+$/;
  if (nameValue === '' || !nameRegex.test(nameValue)) {
    showError(nameInput, 'Bitte geben Sie einen gültigen Namen ein.');
    return false;
  } else {
    clearError(nameInput);
    return true;
  }
}

/**
 * Validates the email input field by checking if the value matches a standard email format.
 * Displays an error message if the input is empty or does not match the regex pattern.
 * Clears the error message if the input is valid.
 * 
 * @return {boolean} Returns true if the email is valid, false otherwise.
 */

function validateEmail() {
  const emailInput = document.getElementById('signUpEmailInput');
  const emailValue = emailInput.value.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (emailValue === '' || !emailRegex.test(emailValue)) {
    showError(emailInput, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
    return false;
  } else {
    clearError(emailInput);
    return true;
  }
}

/**
 * Checks if the password input has a value.
 * If the password input is empty, an error message is displayed.
 * Clears any error message if the input has a value.
 * @return {boolean} true if the password input has a value, false if not.
 */
function validatePassword() {
  const passwordInput = document.getElementById('signUpPasswordInput');
  const passwordValue = passwordInput.value;
  if (passwordValue === '') {
    showError(passwordInput, 'Bitte geben Sie ein Passwort ein.');
    return false;
  } else {
    clearError(passwordInput);
    return true;
  }
}

/**
 * Validates that the password confirmation input matches the password input.
 * If the confirmation input is empty or does not match the password, an error message is displayed.
 * Clears any error message if the inputs match.
 *
 * @return {boolean} Returns true if the password confirmation matches the password, false otherwise.
 */

function validatePasswordConfirm() {
  const passwordInput = document.getElementById('signUpPasswordInput');
  const passwordConfirmInput = document.getElementById('signUpPasswordInputConfirm');
  const passwordValue = passwordInput.value;
  const confirmValue = passwordConfirmInput.value;
  if (confirmValue === '' || passwordValue !== confirmValue) {
    showError(passwordConfirmInput, 'Passwörter stimmen nicht überein.');
    return false;
  } else {
    clearError(passwordConfirmInput);
    return true;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('signUpNameInput').addEventListener('blur', validateName);
  document.getElementById('signUpEmailInput').addEventListener('blur', validateEmail);
  document.getElementById('signUpPasswordInput').addEventListener('blur', validatePassword);
  document.getElementById('signUpPasswordInputConfirm').addEventListener('blur', validatePasswordConfirm);
  
  document.getElementById('signUpNameInput').addEventListener('keyup', checkIfFormIsValid);
  document.getElementById('signUpEmailInput').addEventListener('keyup', checkIfFormIsValid);
  document.getElementById('signUpPasswordInput').addEventListener('keyup', checkIfFormIsValid);
  document.getElementById('signUpPasswordInputConfirm').addEventListener('keyup', checkIfFormIsValid);
});
  
/**
 * Checks if the form is valid by verifying the form's validity, the privacy policy confirmation,
 * und durch die individuellen Validierungsfunktionen.
 *
 * @return {boolean} Returns true if the form is valid and false otherwise.
 */
function checkIfFormIsValid() {
  const form = document.getElementById('login-form');
  const btn = document.getElementById('registerBtn');
  if (
    form.checkValidity() &&
    checkPrivacyPolicyConfirmation() &&
    validateEmail() &&
    validateName() &&
    validatePassword() &&
    validatePasswordConfirm()
  ) {
    btn.disabled = false;
    return true;
  } else {
    btn.disabled = true;
    return false;
  }
}


