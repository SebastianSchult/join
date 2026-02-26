const JOIN_APP_CONFIG = window.JOIN_APP_CONFIG || {};
const StorageCompatFallbacks = window.StorageCompatFallbacks || null;

const StorageErrorPolicy = resolveStorageModule(
    "StorageErrorPolicy",
    "createStorageErrorPolicyFallback"
);
const StorageTransport = resolveStorageModule(
    "StorageTransport",
    "createStorageTransportFallback"
);
const StorageFirebaseAdapter = resolveStorageModule(
    "StorageFirebaseAdapter",
    "createStorageFirebaseAdapterFallback"
);

const STORAGE_TOKEN = getConfigValue("STORAGE_TOKEN");
const STORAGE_URL = getConfigValue(
    "STORAGE_URL",
    "https://remote-storage.developerakademie.org/item"
);
const BASE_URL = normalizeBaseUrl(getConfigValue("BASE_URL"));
const FIREBASE_TASKS_ID = getConfigValue("FIREBASE_TASKS_ID");
const FIREBASE_USERS_ID = getConfigValue("FIREBASE_USERS_ID");

function getCompatFallbackFactory(factoryName) {
    if (!StorageCompatFallbacks || typeof factoryName !== "string") {
        return undefined;
    }

    const fallbackFactory = StorageCompatFallbacks[factoryName];
    if (typeof fallbackFactory === "function") {
        return fallbackFactory;
    }

    return undefined;
}

function resolveStorageModule(moduleName, fallbackFactoryName) {
    const moduleRef = window[moduleName];
    if (moduleRef) {
        return moduleRef;
    }

    const fallbackFactory = getCompatFallbackFactory(fallbackFactoryName);
    if (
        StorageCompatFallbacks &&
        typeof StorageCompatFallbacks.resolveModule === "function"
    ) {
        return StorageCompatFallbacks.resolveModule(moduleName, fallbackFactory);
    }

    if (typeof fallbackFactory === "function") {
        console.warn(
            `${moduleName} missing. Falling back to compatibility implementation.`
        );
        return fallbackFactory();
    }

    throw new Error(
        `Missing ${moduleName}. Ensure storage module scripts are loaded before js/storage.js.`
    );
}

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

async function fetchJson(url, options = {}, context = "fetchJson") {
    return StorageTransport.fetchJson(url, options, context, StorageErrorPolicy);
}

function getFirebaseUrl(path = "_") {
    assertConfig(["BASE_URL"]);
    return StorageFirebaseAdapter.buildFirebaseUrl(BASE_URL, path);
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
        getFirebaseUrl(StorageFirebaseAdapter.getFirebaseEntityPath(path, entity.id)),
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
        getFirebaseUrl(StorageFirebaseAdapter.getFirebaseEntityPath(path, entityId)),
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

/**
 * Creates a high-entropy numeric ID and avoids collisions in a known list.
 *
 * @param {Array<Object>} [existingItems=[]] - Existing entities with `id`.
 * @returns {number} Collision-safe numeric id.
 */
function generateCollisionSafeId(existingItems = []) {
    return StorageFirebaseAdapter.generateCollisionSafeId(existingItems);
}

function showGlobalUserMessage(message) {
    return StorageErrorPolicy.showGlobalUserMessage(message);
}

async function firebaseGetArraySafe(path = "_", options = {}) {
    return StorageFirebaseAdapter.firebaseGetArraySafe(path, options, {
        firebaseGetItem,
        normalizeFirebaseArrayPayload:
            StorageFirebaseAdapter.normalizeFirebaseArrayPayload,
        errorPolicy: StorageErrorPolicy,
    });
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
