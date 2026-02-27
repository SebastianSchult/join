"use strict";

/**
 * Builds a minimal runtime object when `window.StorageRuntime` is unavailable.
 *
 * Compatibility rationale:
 * - Supports mixed-cache deploy phases where `storage_runtime.js` may be stale or missing.
 * - Reuses existing fallback factories from `StorageCompatFallbacks` where available.
 *
 * Side effects:
 * - Writes the synthesized runtime object to `window.StorageRuntime`.
 *
 * @returns {Object} Runtime facade containing config values and resolved storage modules.
 */
const createStorageRuntimeFallbackObject = () => {
  const joinAppConfig = window.JOIN_APP_CONFIG || {};
  const storageCompatFallbacks = window.StorageCompatFallbacks || null;

  const getCompatFactory = (factoryName) => {
    if (!storageCompatFallbacks || typeof factoryName !== "string") {
      return undefined;
    }
    const fallbackFactory = storageCompatFallbacks[factoryName];
    return typeof fallbackFactory === "function" ? fallbackFactory : undefined;
  };

  const resolveStorageDependency = (moduleName, fallbackFactoryName) => {
    const moduleRef = window[moduleName];
    if (moduleRef) {
      return moduleRef;
    }
    const fallbackFactory = getCompatFactory(fallbackFactoryName);
    if (
      storageCompatFallbacks &&
      typeof storageCompatFallbacks.resolveModule === "function"
    ) {
      return storageCompatFallbacks.resolveModule(moduleName, fallbackFactory);
    }
    return typeof fallbackFactory === "function" ? fallbackFactory() : null;
  };

  const readConfigValue = (key, fallback = "") => {
    const value = joinAppConfig[key];
    return typeof value === "string" ? value.trim() : fallback;
  };

  const ensureConfigValues = (requiredKeys) => {
    const missing = requiredKeys.filter((key) => {
      const value = joinAppConfig[key];
      return typeof value !== "string" || value.trim() === "";
    });
    if (missing.length > 0) {
      throw new Error(
        `Missing JOIN_APP_CONFIG values: ${missing.join(", ")}. Create js/config.js from js/config.example.js.`
      );
    }
  };

  const baseUrl = readConfigValue("BASE_URL");
  const runtime = {
    StorageErrorPolicy: resolveStorageDependency(
      "StorageErrorPolicy",
      "createStorageErrorPolicyFallback"
    ),
    StorageTransport: resolveStorageDependency(
      "StorageTransport",
      "createStorageTransportFallback"
    ),
    StorageFirebaseAdapter: resolveStorageDependency(
      "StorageFirebaseAdapter",
      "createStorageFirebaseAdapterFallback"
    ),
    STORAGE_TOKEN: readConfigValue("STORAGE_TOKEN"),
    STORAGE_URL: readConfigValue(
      "STORAGE_URL",
      "https://remote-storage.developerakademie.org/item"
    ),
    BASE_URL: baseUrl
      ? baseUrl.endsWith("/")
        ? baseUrl
        : `${baseUrl}/`
      : "",
    FIREBASE_TASKS_ID: readConfigValue("FIREBASE_TASKS_ID"),
    FIREBASE_USERS_ID: readConfigValue("FIREBASE_USERS_ID"),
    assertConfig: ensureConfigValues,
  };

  window.StorageRuntime = runtime;
  return runtime;
};

const storageRuntime = window.StorageRuntime || createStorageRuntimeFallbackObject();

const StorageErrorPolicy = storageRuntime.StorageErrorPolicy;
const StorageTransport = storageRuntime.StorageTransport;
const StorageFirebaseAdapter = storageRuntime.StorageFirebaseAdapter;

if (!StorageErrorPolicy || !StorageTransport || !StorageFirebaseAdapter) {
  throw new Error(
    "Missing storage dependencies. Ensure storage_* scripts are loaded before js/storage.js."
  );
}

const STORAGE_TOKEN = storageRuntime.STORAGE_TOKEN;
const STORAGE_URL = storageRuntime.STORAGE_URL;
const BASE_URL = storageRuntime.BASE_URL;
const FIREBASE_TASKS_ID = storageRuntime.FIREBASE_TASKS_ID;
const FIREBASE_USERS_ID = storageRuntime.FIREBASE_USERS_ID;

/**
 * Validates presence of required runtime config keys.
 *
 * @param {Array<string>} requiredKeys - Keys expected in `JOIN_APP_CONFIG`.
 * @returns {void}
 * @throws {Error} Throws when one or more keys are missing.
 */
function assertConfig(requiredKeys) {
  storageRuntime.assertConfig(requiredKeys);
}

/**
 * Executes JSON HTTP requests through the storage transport layer.
 *
 * @param {string} url - Request URL.
 * @param {RequestInit} [options={}] - Fetch options.
 * @param {string} [context="fetchJson"] - Context label used for error mapping.
 * @returns {Promise<Object>} Parsed JSON response payload.
 */
async function fetchJson(url, options = {}, context = "fetchJson") {
  return StorageTransport.fetchJson(url, options, context, StorageErrorPolicy);
}

/**
 * Resolves a Firebase URL for the configured base endpoint.
 *
 * @param {string} [path="_"] - Firebase path suffix.
 * @returns {string} Full Firebase JSON endpoint URL.
 */
function getFirebaseUrl(path = "_") {
  assertConfig(["BASE_URL"]);
  return StorageFirebaseAdapter.buildFirebaseUrl(BASE_URL, path);
}

/**
 * Asynchronously creates an item in Firebase using the given JSON array and path.
 *
 * @param {Array} jsonArray - The JSON array to be posted.
 * @param {string} [path="_"] - The path to the Firebase location where the item will be created.
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
 * @param {string} [path="_"] - The path to the item in Firebase.
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
 * @return {Promise<Object>} Retrieved item payload.
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

/**
 * Displays a user-facing global storage message via the configured error policy.
 *
 * @param {string} message - Message text shown to the user.
 * @returns {void}
 */
function showGlobalUserMessage(message) {
  return StorageErrorPolicy.showGlobalUserMessage(message);
}

/**
 * Reads a Firebase collection and normalizes it to a safe array result.
 *
 * @param {string} [path="_"] - Firebase collection path.
 * @param {Object} [options={}] - Adapter options (context, fallback messages, etc.).
 * @returns {Promise<{data:Array,error:Error|null}>} Safe load result.
 */
async function firebaseGetArraySafe(path = "_", options = {}) {
  return StorageFirebaseAdapter.firebaseGetArraySafe(path, options, {
    firebaseGetItem,
    normalizeFirebaseArrayPayload: StorageFirebaseAdapter.normalizeFirebaseArrayPayload,
    errorPolicy: StorageErrorPolicy,
  });
}

/**
 * Reads a value from remote storage by key.
 *
 * @param {string} key - Storage key.
 * @returns {Promise<*>} Stored value payload.
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
 * Sets the currently logged in user in session storage.
 *
 * @param {string} name - Username to store.
 */
function setCurrentUser(name) {
  sessionStorage.setItem("currentUser", JSON.stringify({ username: name }));
}

/**
 * Retrieves the currently logged in user from session storage.
 *
 * @return {{username:string}|undefined} Current user object.
 */
function getCurrentUser() {
  const currentUserJSON = sessionStorage.getItem("currentUser");
  if (currentUserJSON) {
    const currentUser = JSON.parse(currentUserJSON);
    return currentUser;
  }
}

/**
 * Restores user backup data into Firebase users collection.
 *
 * Side effects:
 * - Issues a Firebase write call using global `users_backup` content.
 *
 * @returns {void}
 */
function restoreUsersOnFirebase() {
  firebaseUpdateItem(users_backup, FIREBASE_USERS_ID);
}

/**
 * Stores a key/value entry in remote storage.
 *
 * @param {string} key - Storage key.
 * @param {string} value - Serialized value.
 * @returns {Promise<Object>} Storage API response.
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
