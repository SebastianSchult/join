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

function normalizeFetchOptions(options = {}) {
    const normalizedOptions = { ...options };

    // Defensive normalization in case a caller accidentally uses `header` instead of `headers`.
    if (
        normalizedOptions.header &&
        !normalizedOptions.headers &&
        typeof normalizedOptions.header === "object"
    ) {
        normalizedOptions.headers = normalizedOptions.header;
    }

    delete normalizedOptions.header;
    return normalizedOptions;
}

function parseResponsePayload(responseText) {
    if (typeof responseText !== "string" || responseText.trim() === "") {
        return null;
    }

    try {
        return JSON.parse(responseText);
    } catch (error) {
        return responseText;
    }
}

function getResponseErrorDetail(payload) {
    if (!payload) {
        return "";
    }

    if (typeof payload === "string") {
        return payload;
    }

    if (typeof payload === "object") {
        if (typeof payload.message === "string") {
            return payload.message;
        }
        if (typeof payload.error === "string") {
            return payload.error;
        }
    }

    return "";
}

function createFetchHttpError(response, context, payload) {
    const statusText = response.statusText ? ` ${response.statusText}` : "";
    const detail = getResponseErrorDetail(payload);
    const detailSuffix = detail ? `: ${detail}` : "";
    const error = new Error(
        `${context} failed with status ${response.status}${statusText}${detailSuffix}`
    );

    error.status = response.status;
    error.context = context;
    error.payload = payload;
    return error;
}

async function fetchJson(url, options = {}, context = "fetchJson") {
    let response;

    try {
        response = await fetch(url, normalizeFetchOptions(options));
    } catch (error) {
        const networkError = new Error(`${context} network error: ${error.message}`);
        networkError.cause = error;
        throw networkError;
    }

    const responseText = await response.text();
    const payload = parseResponsePayload(responseText);

    if (!response.ok) {
        throw createFetchHttpError(response, context, payload);
    }

    return payload;
}

function getFirebaseUrl(path = "_") {
    assertConfig(["BASE_URL"]);
    return `${BASE_URL}${path}.json`;
}

function getFirebaseEntityPath(path = "_", entityId = "") {
    const normalizedPath = String(path || "_").replace(/\/+$/, "");
    const normalizedId = encodeURIComponent(String(entityId));
    return `${normalizedPath}/${normalizedId}`;
}

/**
 * Asynchronously creates an item in Firebase using the given JSON array and path.
 *
 * @param {Array} jsonArray - The JSON array to be posted.
 * @param {string} [path="_"] - The path to the Firebase location where the item will be created. Defaults to "_".
 * @return {Promise<Object>} Firebase response payload.
 */
async function firebaseCreateItem(jsonArray, path = "_") {
    return fetchJson(
        getFirebaseUrl(path),
        {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonArray),
        },
        "firebaseCreateItem"
    );
}

/**
 * Updates an item in Firebase using a PUT request.
 *
 * @param {Object} jsonArray - The JSON array to update.
 * @param {string} [path="_"] - The path to the item in Firebase. Defaults to "_".
 * @return {Promise<Object>} Firebase response payload.
 */
async function firebaseUpdateItem(jsonArray, path = "_") {
    return fetchJson(
        getFirebaseUrl(path),
        {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonArray),
        },
        "firebaseUpdateItem"
    );
}

/**
 * Updates selected entries of a Firebase collection without overwriting the full node.
 *
 * @param {Object} patchPayload - Object map of key => value updates.
 * @param {string} [path="_"] - Collection path.
 * @returns {Promise<Object>} Firebase response payload.
 */
async function firebasePatchCollection(patchPayload, path = "_") {
    return fetchJson(
        getFirebaseUrl(path),
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(patchPayload),
        },
        "firebasePatchCollection"
    );
}

/**
 * Writes one entity to a collection path using its id.
 *
 * @param {Object} entity - Entity payload containing an `id`.
 * @param {string} [path="_"] - Collection path.
 * @returns {Promise<Object>} Firebase response payload.
 */
async function firebaseSetEntity(entity, path = "_") {
    if (!entity || typeof entity !== "object") {
        throw new Error("firebaseSetEntity requires an entity object.");
    }
    if (entity.id === null || entity.id === undefined || entity.id === "") {
        throw new Error("firebaseSetEntity requires entity.id.");
    }

    return fetchJson(
        getFirebaseUrl(getFirebaseEntityPath(path, entity.id)),
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(entity),
        },
        "firebaseSetEntity"
    );
}

/**
 * Deletes one entity from a collection path by id.
 *
 * @param {string|number} entityId - Entity id.
 * @param {string} [path="_"] - Collection path.
 * @returns {Promise<Object>} Firebase response payload.
 */
async function firebaseDeleteEntity(entityId, path = "_") {
    if (entityId === null || entityId === undefined || entityId === "") {
        throw new Error("firebaseDeleteEntity requires entityId.");
    }

    return fetchJson(
        getFirebaseUrl(getFirebaseEntityPath(path, entityId)),
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        },
        "firebaseDeleteEntity"
    );
}

/**
 * Retrieves an item from Firebase using the provided path.
 *
 * @param {string} [path="_"] - The path (the id) to the item in Firebase.
 * @return {Promise<Object>} A Promise that resolves to the retrieved item as a JSON object.
 */
async function firebaseGetItem(path = "_") {
    return fetchJson(getFirebaseUrl(path), {}, "firebaseGetItem");
}

function normalizeFirebaseArrayPayload(payload) {
    if (Array.isArray(payload)) {
        return payload.filter((item) => item !== null && item !== undefined);
    }

    if (payload && typeof payload === "object") {
        return Object.values(payload).filter(
            (item) => item !== null && item !== undefined
        );
    }

    return [];
}

/**
 * Creates a high-entropy numeric ID and avoids collisions in a known list.
 *
 * @param {Array<Object>} [existingItems=[]] - Existing entities with `id`.
 * @returns {number} Collision-safe numeric id.
 */
function generateCollisionSafeId(existingItems = []) {
    const knownIds = new Set();

    if (Array.isArray(existingItems)) {
        existingItems.forEach((item) => {
            const numericId = Number(item && item.id);
            if (Number.isSafeInteger(numericId)) {
                knownIds.add(numericId);
            }
        });
    }

    for (let attempt = 0; attempt < 10; attempt++) {
        const timestampPart = Date.now() * 1000000;
        const randomPart = getRandomInt(0, 999999);
        const candidateId = timestampPart + randomPart;

        if (Number.isSafeInteger(candidateId) && !knownIds.has(candidateId)) {
            return candidateId;
        }
    }

    return Date.now() * 1000 + getRandomInt(0, 999);
}

function getRandomInt(min, max) {
    const normalizedMin = Math.ceil(min);
    const normalizedMax = Math.floor(max);
    const range = normalizedMax - normalizedMin + 1;

    if (
        window.crypto &&
        typeof window.crypto.getRandomValues === "function" &&
        range > 0
    ) {
        const values = new Uint32Array(1);
        window.crypto.getRandomValues(values);
        return normalizedMin + (values[0] % range);
    }

    return normalizedMin + Math.floor(Math.random() * range);
}

function showGlobalUserMessage(message) {
    if (!message) {
        return;
    }

    if (typeof window.showUserMessage === "function") {
        try {
            window.showUserMessage(message);
            return;
        } catch (error) {
            console.error("showUserMessage failed:", error);
        }
    }

    const toastId = "joinGlobalMessageToast";
    const existingToast = document.getElementById(toastId);
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.id = toastId;
    toast.setAttribute("role", "alert");
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.bottom = "24px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.backgroundColor = "#2a3647";
    toast.style.color = "#fff";
    toast.style.padding = "12px 18px";
    toast.style.borderRadius = "10px";
    toast.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.25)";
    toast.style.zIndex = "9999";
    toast.style.fontSize = "14px";
    document.body.appendChild(toast);

    window.setTimeout(() => {
        toast.remove();
    }, 3200);
}

async function firebaseGetArraySafe(path = "_", options = {}) {
    const {
        context = "data",
        errorMessage = `Could not load ${context}. Please try again.`,
        showErrorMessage = true,
    } = options;

    try {
        const payload = await firebaseGetItem(path);
        return {
            data: normalizeFirebaseArrayPayload(payload),
            error: null,
        };
    } catch (error) {
        console.error(`Failed to load ${context}:`, error);
        if (showErrorMessage) {
            showGlobalUserMessage(errorMessage);
        }
        return {
            data: [],
            error,
        };
    }
}

/**
 *
 * @param {string} key - the key the values are stored in
 * @returns the users json
 */
async function remoteStorageGetItem(key) {
    assertConfig(["STORAGE_TOKEN"]);
    const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
    const responseAsJson = await fetchJson(url, {}, "remoteStorageGetItem");
    if (responseAsJson && responseAsJson.data) {
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
    return fetchJson(
        STORAGE_URL,
        {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        },
        "remoteStorageSetItem"
    );
}
