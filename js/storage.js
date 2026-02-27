"use strict";

const storageRuntime = window.StorageRuntime;
if (!storageRuntime) {
  throw new Error(
    "Missing StorageRuntime. Ensure js/storage_runtime.js is loaded before js/storage.js."
  );
}

const StorageErrorPolicy = storageRuntime.StorageErrorPolicy;
const StorageTransport = storageRuntime.StorageTransport;
const StorageFirebaseAdapter = storageRuntime.StorageFirebaseAdapter;

const STORAGE_TOKEN = storageRuntime.STORAGE_TOKEN;
const STORAGE_URL = storageRuntime.STORAGE_URL;
const BASE_URL = storageRuntime.BASE_URL;
const FIREBASE_TASKS_ID = storageRuntime.FIREBASE_TASKS_ID;
const FIREBASE_USERS_ID = storageRuntime.FIREBASE_USERS_ID;

function assertConfig(requiredKeys) {
  storageRuntime.assertConfig(requiredKeys);
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

function showGlobalUserMessage(message) {
  return StorageErrorPolicy.showGlobalUserMessage(message);
}

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
