const JOIN_APP_CONFIG = window.JOIN_APP_CONFIG || {};

const STORAGE_TOKEN = getConfigValue("STORAGE_TOKEN");
const STORAGE_URL = getConfigValue(
    "STORAGE_URL",
    "https://remote-storage.developerakademie.org/item"
);
const BASE_URL = normalizeBaseUrl(getConfigValue("BASE_URL"));
const FIREBASE_TASKS_ID = getConfigValue("FIREBASE_TASKS_ID");
const FIREBASE_USERS_ID = getConfigValue("FIREBASE_USERS_ID");

function getConfigValue(key, fallback = "") {
    const value = JOIN_APP_CONFIG[key];
    if (typeof value === "string") {
        return value.trim();
    }
    return fallback;
}

function normalizeBaseUrl(baseUrl) {
    if (!baseUrl) {
        return "";
    }
    return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function assertConfig(requiredKeys) {
    const missing = requiredKeys.filter((key) => {
        const value = JOIN_APP_CONFIG[key];
        return typeof value !== "string" || value.trim() === "";
    });

    if (missing.length > 0) {
        throw new Error(
            `Missing JOIN_APP_CONFIG values: ${missing.join(", ")}. Create js/config.js from js/config.example.js.`
        );
    }
}

function assertResponseOk(response, context) {
    if (!response.ok) {
        throw new Error(`${context} failed with status ${response.status}`);
    }
}

function getFirebaseUrl(path = "_") {
    assertConfig(["BASE_URL"]);
    return `${BASE_URL}${path}.json`;
}

/**
 * Asynchronously creates an item in Firebase using the given JSON array and path.
 *
 * @param {Array} jsonArray - The JSON array to be posted.
 * @param {string} [path="_"] - The path to the Firebase location where the item will be created. Defaults to "_".
 * @return {Promise<Object>} Firebase response payload.
 */
async function firebaseCreateItem(jsonArray, path = "_") {
    const response = await fetch(getFirebaseUrl(path), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonArray),
    });
    assertResponseOk(response, "firebaseCreateItem");
    return response.json();
}

/**
 * Updates an item in Firebase using a PUT request.
 *
 * @param {Object} jsonArray - The JSON array to update.
 * @param {string} [path="_"] - The path to the item in Firebase. Defaults to "_".
 * @return {Promise<Object>} Firebase response payload.
 */
async function firebaseUpdateItem(jsonArray, path = "_") {
    const response = await fetch(getFirebaseUrl(path), {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonArray),
    });
    assertResponseOk(response, "firebaseUpdateItem");
    return response.json();
}

/**
 * Retrieves an item from Firebase using the provided path.
 *
 * @param {string} [path="_"] - The path (the id) to the item in Firebase.
 * @return {Promise<Object>} A Promise that resolves to the retrieved item as a JSON object.
 */
async function firebaseGetItem(path = "_") {
    const response = await fetch(getFirebaseUrl(path));
    assertResponseOk(response, "firebaseGetItem");
    return response.json();
}

/**
 *
 * @param {string} key - the key the values are stored in
 * @returns the users json
 */
async function remoteStorageGetItem(key) {
    assertConfig(["STORAGE_TOKEN"]);
    const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
    const response = await fetch(url);
    assertResponseOk(response, "remoteStorageGetItem");
    const responseAsJson = await response.json();
    if (responseAsJson.data) {
        return responseAsJson.data.value;
    }
    throw new Error(`Could not find data with the key "${key}"`);
}

/**
 * Sets the currently logged in user in the local storage.
 *
 * @param {Object} loggedUser - The user object representing the logged in user.
 * @return {void} This function does not return anything.
 */
function setCurrentUser(name) {
    sessionStorage.setItem("currentUser", JSON.stringify({ username: name }));
}

/**
 * Retrieves the currently logged in user from the local storage.
 *
 * @return {Object} The user object representing the logged in user, parsed from the local storage.
 */
function getCurrentUser() {
    const currentUserJSON = sessionStorage.getItem("currentUser");
    if (currentUserJSON) {
        const currentUser = JSON.parse(currentUserJSON);
        return currentUser;
    }
}

function restoreUsersOnFirebase() {
    firebaseUpdateItem(users_backup, FIREBASE_USERS_ID);
}

/**
 *
 * @param {string} key - the key the value can be found
 * @param {string} value - the value for the key
 * @returns
 */
async function remoteStorageSetItem(key, value) {
    assertConfig(["STORAGE_TOKEN"]);
    const payload = { key, value, token: STORAGE_TOKEN };
    const response = await fetch(STORAGE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    assertResponseOk(response, "remoteStorageSetItem");
    return response.json();
}
