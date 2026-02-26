// --- Globale Variablen und User-Objekt ---
let newUsername = '';
let newMail = '';
let newPassword = '';
let newPasswordConfirm = '';
let users = [];

/**
 * Reads and stores current signup form values in module-scoped variables.
 *
 * @returns {void}
 */
function getInputValues() {
    newUsername = document.getElementById('signUpNameInput').value.trim();
    newMail = document.getElementById('signUpEmailInput').value.trim();
    newPassword = document.getElementById('signUpPasswordInput').value;
    newPasswordConfirm = document.getElementById('signUpPasswordInputConfirm').value;
}

/**
 * Builds a new user object with secure password credentials.
 *
 * @returns {Promise<Object>} User payload ready for persistence.
 */
async function buildNewUser() {
    const passwordCredentials = await createPasswordCredentials(newPassword);

    return {
        id: findFreeId(users),
        name: newUsername,
        mail: normalizeAuthEmail(newMail),
        contactColor: generateRandomColor(),
        phone: '+49 0123 456789',
        ...passwordCredentials,
    };
}

/**
 * Validates form state and creates a new user in remote storage.
 *
 * @returns {Promise<void>}
 */
async function addNewUser() {
    if (!checkPrivacyPolicyConfirmation()) {
        showUserMessage('Bitte akzeptieren Sie die Privacy Policy!');
        return;
    }
    
    const loadResult = await firebaseGetArraySafe(FIREBASE_USERS_ID, {
        context: 'users',
        errorMessage: 'Could not load users. Please try again.',
    });
    if (loadResult.error) {
        return;
    }
    users = loadResult.data;
    getInputValues();
    if (!checkPasswordsEqual()) {
        showUserMessage('Passwords do not match!');
    } else if (doesEmailExist(users, newMail)) {
        showUserMessage('The mail already exists!');
    } else {
        try {
            const userToCreate = await buildNewUser();
            localStorage.setItem('newMail', userToCreate.mail);
            localStorage.setItem('hasJustSignedUp','');
            users.push(userToCreate);
            await firebaseUpdateItem(users, FIREBASE_USERS_ID);
            showUserMessage('You Signed Up successfully!');
            setTimeout(() => {
                switchPage('index.html');
            }, 3000);
        } catch (error) {
            console.error('Failed to securely create user:', error);
            showUserMessage('Sign up failed. Please try again.');
        }
    }
}

/**
 * Validates signup email input against the allowed email pattern.
 *
 * @returns {boolean}
 */
function testMailinputWithRegex(){
    let inputMail = document.getElementById('signUpEmailInput');
    const regex = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$");
    return regex.test(inputMail.value);
}

/**
 * Checks if the form is valid by verifying the form's validity, the privacy policy confirmation,
 * und durch die individuellen Validierungsfunktionen.
 */
function checkIfFormIsValid() {
    let form = document.getElementById('login-form');
    let btn = document.getElementById('registerBtn');
    
    if (
        form.checkValidity() &&
        checkPrivacyPolicyConfirmation() &&  // Hier wird die Checkbox abgefragt
        testMailinputWithRegex() &&
        validateName() &&
        validateEmail() &&
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

/**
 * Toggles privacy checkbox icon and revalidates form state.
 *
 * @returns {void}
 */
function togglePrivacyPolicyCheckbox() {
    let privacyCheckbox = document.getElementById('privacyCheckbox');
    let checkBoxImage = document.getElementById('checkboxImage');

    if (privacyCheckbox.checked) {
        checkBoxImage.src = './assets/img/icon-check_button_checked.png';
    } else {
        checkBoxImage.src = './assets/img/icon-check_button_unchecked.png';
    }
    checkIfFormIsValid();
}

/**
 * Returns whether the privacy policy checkbox is checked.
 *
 * @returns {boolean}
 */
function checkPrivacyPolicyConfirmation() {
    let privacyCheckbox = document.getElementById('privacyCheckbox');
    return privacyCheckbox.checked;
}

/**
 * Navigates back to the login page.
 *
 * @returns {void}
 */
function redirectToLogin() {
    switchPage('index.html');
}

/**
 * Persists legacy new-user payload to local storage.
 *
 * @returns {void}
 */
function setNewUsersToLocalStorage() {
    localStorage.setItem('newUsers', JSON.stringify(newUsers));
}

/**
 * Shows a temporary signup feedback overlay message.
 *
 * @param {string} message - Message text displayed in the overlay.
 * @returns {void}
 */
function showUserMessage(message) {
    let overlay = document.createElement("div");
    overlay.id = "userMessageOverlay";

    let overlayInner = document.createElement("div");
    overlayInner.classList.add("signUp-successfully-created");
    overlayInner.innerHTML = message;

    overlay.appendChild(overlayInner);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlayInner.classList.add('slide-in');

        setTimeout(() => {
            overlayInner.classList.remove('slide-in');
            overlayInner.classList.add('slide-out');

            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 1000);
        }, 2000);
    });
}

/**
 * Checks whether password and confirmation values match.
 *
 * @returns {boolean}
 */
function checkPasswordsEqual() {
    return newPassword === newPasswordConfirm;
}

// --- Neue Validierungsfunktionen (mit onBlur und Fehlermeldung unterhalb der Input-Box) ---

// Fügt die Fehlermeldung als Geschwisterelement (unterhalb des Containers) ein.
/**
 * Displays an inline validation error for a signup input.
 *
 * @param {HTMLInputElement} inputElement - Input field to annotate.
 * @param {string} message - Human-readable validation message.
 * @returns {void}
 */
function showError(inputElement, message) {
  const container = inputElement.closest('.signUpInputField');
  let errorEl = container.nextElementSibling;
  if (!errorEl || !errorEl.classList.contains('error-message')) {
      errorEl = document.createElement('span');
      errorEl.className = 'error-message';
      container.parentNode.insertBefore(errorEl, container.nextSibling);
  }
  if (!errorEl.id && inputElement.id) {
      errorEl.id = `${inputElement.id}Error`;
  }
  errorEl.setAttribute('role', 'alert');
  errorEl.setAttribute('aria-live', 'polite');
  if (errorEl.id) {
      inputElement.setAttribute('aria-describedby', errorEl.id);
  }
  inputElement.setAttribute('aria-invalid', 'true');
  errorEl.textContent = message;
  inputElement.classList.add('error');
}

/**
 * Clears the inline validation error from a signup input.
 *
 * @param {HTMLInputElement} inputElement - Input field to reset.
 * @returns {void}
 */
function clearError(inputElement) {
  const container = inputElement.closest('.signUpInputField');
  let errorEl = container.nextElementSibling;
  if (errorEl && errorEl.classList.contains('error-message')) {
      errorEl.textContent = '';
      if (errorEl.id) {
          inputElement.setAttribute('aria-describedby', errorEl.id);
      }
  }
  inputElement.setAttribute('aria-invalid', 'false');
  inputElement.classList.remove('error');
}

/**
 * Validates the signup name field.
 *
 * @returns {boolean}
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
 * Validates the signup email field.
 *
 * @returns {boolean}
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
 * Validates the signup password field.
 *
 * @returns {boolean}
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
 * Validates the signup password confirmation field.
 *
 * @returns {boolean}
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
    const nameInput = document.getElementById('signUpNameInput');
    if (nameInput) {
        nameInput.addEventListener('blur', validateName);
        nameInput.addEventListener('keyup', checkIfFormIsValid);
    }
    
    const emailInput = document.getElementById('signUpEmailInput');
    if (emailInput) {
        emailInput.addEventListener('blur', validateEmail);
        emailInput.addEventListener('keyup', checkIfFormIsValid);
    }
    
    const passwordInput = document.getElementById('signUpPasswordInput');
    if (passwordInput) {
        passwordInput.addEventListener('blur', validatePassword);
        passwordInput.addEventListener('keyup', checkIfFormIsValid);
    }
    
    const passwordConfirmInput = document.getElementById('signUpPasswordInputConfirm');
    if (passwordConfirmInput) {
        passwordConfirmInput.addEventListener('blur', validatePasswordConfirm);
        passwordConfirmInput.addEventListener('keyup', checkIfFormIsValid);
    }
});
