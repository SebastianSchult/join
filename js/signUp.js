// --- Globale Variablen und User-Objekt ---
let newUsername = '';
let newMail = '';
let newPassword = '';
let newPasswordConfirm = '';

function getInputValues() {
    newUsername = document.getElementById('signUpNameInput').value.trim();
    newMail = document.getElementById('signUpEmailInput').value.trim();
    newPassword = document.getElementById('signUpPasswordInput').value;
    newPasswordConfirm = document.getElementById('signUpPasswordInputConfirm').value;
}

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
    } else if (checkMailExist(newMail)) {
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

function checkMailExist(mailToCheck) {
    const normalizedMail = normalizeAuthEmail(mailToCheck);
    for (let i = 0; i < users.length; i++) {
        if (normalizeAuthEmail(users[i].mail) === normalizedMail) {
            return true;
        }
    }
    return false;
}

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

function checkPrivacyPolicyConfirmation() {
    let privacyCheckbox = document.getElementById('privacyCheckbox');
    return privacyCheckbox.checked;
}

function redirectToLogin() {
    switchPage('index.html');
}

function setNewUsersToLocalStorage() {
    localStorage.setItem('newUsers', JSON.stringify(newUsers));
}

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

function checkPasswordsEqual() {
    return newPassword === newPasswordConfirm;
}

// --- Neue Validierungsfunktionen (mit onBlur und Fehlermeldung unterhalb der Input-Box) ---

// Fügt die Fehlermeldung als Geschwisterelement (unterhalb des Containers) ein.
function showError(inputElement, message) {
  const container = inputElement.closest('.signUpInputField');
  let errorEl = container.nextElementSibling;
  if (!errorEl || !errorEl.classList.contains('error-message')) {
      errorEl = document.createElement('span');
      errorEl.className = 'error-message';
      container.parentNode.insertBefore(errorEl, container.nextSibling);
  }
  errorEl.textContent = message;
  inputElement.classList.add('error');
}

function clearError(inputElement) {
  const container = inputElement.closest('.signUpInputField');
  let errorEl = container.nextElementSibling;
  if (errorEl && errorEl.classList.contains('error-message')) {
      errorEl.textContent = '';
  }
  inputElement.classList.remove('error');
}

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
