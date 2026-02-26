/**
 * Renders the HTML for the summary page.
 *
 * @return {string} The HTML code for the summary page.
 */
function renderSummaryHTML() {
  return /*html*/ `
  <div class="sub-main-summary">
    <div class="summary-box box-shadow">
        <div id="h1GreetingUser" class="h1-box">
            <h1 id="daytimeGreeting" class="no-wrap">Good morning,</h1>
            <h1 id="usernameForGreeting"></h1>
        </div>
        <div id="h1GreetingGuest" class="h1-box" style="display: none;">
            <h1 class="no-wrap">Good morning</h1>
        </div>
        <div class="line1">
            <div class="urgentAndDate" id="urgentAndDate">
                <div class="urgentBox">
                    <div class="image-and-amount flex">
                        <img src="./assets/img/icon-blue-urgent_clock-with-border.png" alt="clock symbol"
                            class="white-border">
                        <span class="amount">1</span>
                    </div>
                    <span>Tasks Urgent</span>
                </div>
                <div class="verticalSeparaterLine"></div>
                <div class="dateBox">
                    <div class="date">${getDate()}</div>
                    <span>Upcoming Deadline</span>
                </div>
            </div>
            <div class="square-button">
                <div class="inner-square-button">
                    <div class="image-and-amount flex">
                        <img src="/assets/img/icon-blue-tasks_in_board.png" alt="file shelf">
                        <div class="amount">5</div>
                    </div>
                    <span>Task in Board</span>
                </div>
            </div>
        </div>
        <div class="line2">
            <div class="square-button">
                <div class="inner-square-button">
                    <div class="image-and-amount flex">
                        <img src="./assets/img/icon-blue-todo.png" alt="todo list">
                        <div class="amount">1</div>
                    </div>
                    <span class="no-wrap">Tasks To-do</span>
                </div>
            </div>
            <div class="square-button">
                <div class="inner-square-button">
                    <div class="image-and-amount flex">
                        <img src="/assets/img/icon-blue-in_progress.png" alt="rising chart">
                        <div class="amount">2</div>
                    </div>
                    <span>Task in Progress</span>
                </div>
            </div>
            <div class="square-button">
                <div class="inner-square-button">
                    <div class="image-and-amount flex">
                        <img src="/assets/img/icon-blue-awaiting_feedback.png" alt="feedback card">
                        <div class="amount">2</div>
                    </div>
                    <span>Awaiting Feedback</span>
                </div>
            </div>
            <div class="square-button">
                <div class="inner-square-button">
                    <div class="image-and-amount flex">
                        <img src="./assets/img/icon-blue-done.png" alt="thumbs up">
                        <div class="amount">1</div>
                    </div>
                    <span>Tasks<br>Done</span>
                </div>
            </div>
        </div>
    </div>
</div>`;
}

/**
 * Renders the HTML for the login page.
 *
 * @return {string} The HTML code for the login page.
 */
function renderLoginPageHTML() {
  return /*html*/ `
  <div id="loginMainContainer" class="loginMainContainer">
    <div class="blue-overlay d-none" id="blue-overlay">
        <div class="joinLogoWhite logo-animation" id="logo">
            <img src="./assets/img/logo-big_white.png" alt="logo">
        </div>
    </div>
    <header class="loginHeader">
        <div class="joinLogoBlue">
            <img src="./assets/img/logo-medium_blue.png" alt="logo">
        </div>
        <div class="signUpField">
            <span>Not a join user yet?</span>
            <button type="button" class="loginButtons signUpButton" data-action="goto-signup">Sign up</button>
        </div>
    </header>
    <div class=" login-page">
        <div class="login-box">
            <div class="h1LoginBox">
                <h1 class="loginH1">Log in</h1>
                <div class="horizontalH1Underline"></div>
            </div>
            <div class="formDiv">
                <form data-submit-action="login-user">
                    <div class=" innerLoginBox">
                        <div class="loginEmailBox">
                            <label class="sr-only" for="loginEmailInput">Email</label>
                            <input type="email" id="loginEmailInput" placeholder="Email" autocomplete="email" required>
                            <div class="mailIcon"><img src="./assets/img/icon-mail.png" alt="letter"></div>
                        </div>

                        <div class="loginPasswordBox">
                            <label class="sr-only" for="loginPasswordInput">Password</label>
                            <input type="password" id="loginPasswordInput" placeholder="Password" autocomplete="current-password" required>
                            <div class="mailIcon"><img src="./assets/img/icon-lock.png" alt="lock"></div>
                        </div>
                    </div>
                    <div class="checkboxBox">
                        <label for="rememberMe" class="custom-checkbox">
                            <img src="./assets/img/icon-check_button_unchecked.png" alt="checkbox image">
                            Remember me</label><br>
                    </div>
                    <div class="loginButtonsBox">
                        <button type="submit" class="loginButtons loginButtonUser">Log in</button>
                        <!--TODO-->
                        <button type="button" class="loginButtons loginButtonGuest" data-action="login-guest">Guest log in</button>
                    </div>
                </form>
                <!-- TODO darf nur angzeigt werden, wenn Nachricht wirklich da (z.B. you are signed up now!) -->
                <div id="msgBox"></div>
            </div>
        </div>
        <div class="signUpField-mobile ">
            <span>Not a join user yet?</span>
            <button type="button" class="loginButtons signUpButton signUpButton-mobile" data-action="goto-signup">Sign up</button>
        </div>
        <div class="loginFooter">
            <a class="privacyPolicy" href="./privacy_external.html" target="_blank" rel="noopener noreferrer"><span>Privacy policy</span></a>
            <a class="legalNotice" href="./legal_notice_external.html" target="_blank" rel="noopener noreferrer"><span>Legal notice</span></a>
        </div>
    </div>
</div>`;
}

/**
 * Returns the HTML for the sign up page.
 * @return {string} HTML for the sign up page.
 */
function renderSignUpPageHTML() {
  return /*html*/ `
    <div id="signUpMainContainer" class="signUpMainContainer">

        <header class="loginHeader">
            <div class="joinLogoSignUpWhite">
                <img class="signUpLogo" src="./assets/img/logo-medium_white.png" alt="logo">
            </div>

        </header>
        <div class="signUp-page">
            <div class="signUp-box">
                <button type="button" class="arrowLeft" data-action="redirect-to-login" aria-label="Back to login"><img src="./assets/img/icon-arrow_left.png" alt="arrow left"></button>

                <div class="h1SignUpBox">
                    <h1 class="signUpH1">Sign up</h1>
                    <div class="horizontalH1UnderlineSignUp"></div>
                </div>

                <div class="formDiv">
                    <form data-submit-action="add-new-user">
                        <div class="innerSignUpBox">
                            <div class="signUpEmailBox">
                                <label class="sr-only" for="signUpEmailInput">Email</label>
                                <input type="email" id="signUpEmailInput" placeholder="Email" autocomplete="email" required>
                                <div class="mailIcon"><img src="./assets/img/icon-mail.png" alt="letter"></div>
                            </div>

                            <div class="signUpPasswordBox">
                                <label class="sr-only" for="signUpPasswordInput">Password</label>
                                <input type="password" id="signUpPasswordInput" placeholder="Password" autocomplete="new-password" required>
                                <div class="mailIcon"><img src="./assets/img/icon-lock.png" alt="lock"></div>
                            </div>
                        </div>
                        <input type="checkbox" value="acceptingPrivacyPolicy" id="acceptingPrivacyPolicy">
                        <label for="acceptingPrivacyPolicy">I accept the <a href="#">Privacy Policy</a> </label><br>

                        <button class="signUpButtons signUpButtonUser">Sign up</button>

                        <!--TODO-->
                    </form>
                </div>
            </div>

            <div class="signUpFooter">
                <a class="privacyPolicySignUp" href="./privacy_external.html" target="_blank" rel="noopener noreferrer"><span>Privacy policy</span></a>
                <a class="legalNoticeSignUp" href="./legal_notice_external.html" target="_blank" rel="noopener noreferrer"><span>Legal notice</span></a>
            </div>


        </div>
    </div>`;
}
