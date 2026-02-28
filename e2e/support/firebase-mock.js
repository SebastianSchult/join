"use strict";

const fs = require("node:fs");
const path = require("node:path");

const FIREBASE_REQUEST_PATTERN =
  /https:\/\/[^/]+\.(?:firebasedatabase\.app|firebaseio\.com)\/.+\.json(?:\?.*)?$/i;
const THIRD_PARTY_ASSET_PATTERN =
  /https:\/\/(?:cdnjs\.cloudflare\.com|consent\.cookiebot\.com|consentcdn\.cookiebot\.com)\//i;

const SMOKE_TEST_CREDENTIALS = Object.freeze({
  name: "Smoke User",
  email: "smoke.user@example.com",
  password: "Smoke123!",
});

const SMOKE_SEED_TASK_TITLE = "Smoke: Prepare release";

const SMOKE_SEED_USERS = Object.freeze([
  {
    id: 1001,
    name: SMOKE_TEST_CREDENTIALS.name,
    mail: SMOKE_TEST_CREDENTIALS.email,
    phone: "+49 170 0000001",
    contactColor: "#1FD7C1",
    passwordHash:
      "f907282c0f48b32998f7f00cdab1715ed2f65e1194d89405920881fce52356cf",
    passwordSalt: "00112233445566778899aabbccddeeff",
    passwordHashIterations: 120000,
    passwordHashVersion: "pbkdf2-sha256-v1",
  },
  {
    id: 1002,
    name: "Board Teammate",
    mail: "teammate@example.com",
    phone: "+49 170 0000002",
    contactColor: "#0038FF",
    passwordHash:
      "f907282c0f48b32998f7f00cdab1715ed2f65e1194d89405920881fce52356cf",
    passwordSalt: "00112233445566778899aabbccddeeff",
    passwordHashIterations: 120000,
    passwordHashVersion: "pbkdf2-sha256-v1",
  },
]);

const SMOKE_SEED_TASKS = Object.freeze([
  {
    id: 2001,
    type: "User Story",
    title: SMOKE_SEED_TASK_TITLE,
    description: "Seed task for deterministic smoke coverage.",
    subtasks: [],
    assignedTo: [1001],
    category: "category-0",
    priority: "urgent",
    dueDate: "2099-01-01",
    images: [],
  },
  {
    id: 2002,
    type: "Technical Task",
    title: "Smoke: Review inbox",
    description: "Secondary task to validate summary counters.",
    subtasks: [],
    assignedTo: [1002],
    category: "category-1",
    priority: "medium",
    dueDate: "2099-01-02",
    images: [],
  },
]);

function readFirebaseCollectionIds(options = {}) {
  const repoRoot = options.repoRoot || process.cwd();
  const configPath = path.join(repoRoot, "js", "config.js");
  const configSource = fs.readFileSync(configPath, "utf8");

  return {
    usersId: readConfigValue(configSource, "FIREBASE_USERS_ID"),
    tasksId: readConfigValue(configSource, "FIREBASE_TASKS_ID"),
  };
}

function readConfigValue(source, key) {
  const pattern = new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`);
  const match = source.match(pattern);
  if (!match) {
    throw new Error(`Could not resolve ${key} from js/config.js`);
  }
  return match[1].trim();
}

function createInitialCollectionStore(firebaseIds) {
  const store = Object.create(null);
  store[firebaseIds.usersId] = toCollectionMap(SMOKE_SEED_USERS);
  store[firebaseIds.tasksId] = toCollectionMap(SMOKE_SEED_TASKS);
  return store;
}

function toCollectionMap(entries) {
  const collection = Object.create(null);
  entries.forEach((entry) => {
    collection[String(entry.id)] = clone(entry);
  });
  return collection;
}

function parseFirebaseRequest(urlString) {
  const url = new URL(urlString);
  const pathWithoutLeadingSlash = url.pathname.replace(/^\/+/, "");
  if (!pathWithoutLeadingSlash.endsWith(".json")) {
    return null;
  }

  const pathWithoutSuffix = pathWithoutLeadingSlash.slice(
    0,
    pathWithoutLeadingSlash.length - ".json".length
  );
  const segments = pathWithoutSuffix
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));

  if (segments.length === 0) {
    return null;
  }

  return {
    collectionId: segments[0],
    entityId: segments.length > 1 ? segments.slice(1).join("/") : null,
  };
}

function ensureCollection(collectionStore, collectionId) {
  if (!collectionStore[collectionId]) {
    collectionStore[collectionId] = Object.create(null);
  }
  return collectionStore[collectionId];
}

function normalizeCollectionPayload(payload) {
  if (Array.isArray(payload)) {
    return toCollectionMap(payload);
  }
  if (payload && typeof payload === "object") {
    const normalized = Object.create(null);
    Object.entries(payload).forEach(([entityId, entity]) => {
      normalized[String(entityId)] = clone(entity);
    });
    return normalized;
  }
  return Object.create(null);
}

function safeParseJson(rawPayload) {
  if (!rawPayload) {
    return null;
  }
  return JSON.parse(rawPayload);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function stubThirdPartyAssets(page) {
  await page.route(THIRD_PARTY_ASSET_PATTERN, async (route) => {
    const resourceType = route.request().resourceType();

    if (resourceType === "stylesheet") {
      await route.fulfill({
        status: 200,
        contentType: "text/css; charset=utf-8",
        body: "",
      });
      return;
    }

    if (resourceType === "script") {
      await route.fulfill({
        status: 200,
        contentType: "application/javascript; charset=utf-8",
        body: "window.Cookiebot = window.Cookiebot || {};",
      });
      return;
    }

    await route.fulfill({
      status: 204,
      body: "",
    });
  });
}

async function installFirebaseMock(page, options = {}) {
  const firebaseIds = options.firebaseIds || readFirebaseCollectionIds(options);
  const collectionStore = createInitialCollectionStore(firebaseIds);

  await stubThirdPartyAssets(page);

  await page.route(FIREBASE_REQUEST_PATTERN, async (route) => {
    const request = route.request();
    const requestParts = parseFirebaseRequest(request.url());
    if (!requestParts) {
      await route.continue();
      return;
    }

    const { collectionId, entityId } = requestParts;
    const collection = ensureCollection(collectionStore, collectionId);
    const method = request.method().toUpperCase();
    const payload = safeParseJson(request.postData());

    if (method === "GET") {
      const result =
        entityId == null ? collection : Object.prototype.hasOwnProperty.call(collection, entityId) ? collection[entityId] : null;
      await route.fulfill({
        status: 200,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify(result),
      });
      return;
    }

    if (method === "PUT") {
      if (entityId == null) {
        collectionStore[collectionId] = normalizeCollectionPayload(payload);
      } else {
        ensureCollection(collectionStore, collectionId)[entityId] = clone(payload);
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify(payload || {}),
      });
      return;
    }

    if (method === "PATCH") {
      const nextPatch = payload && typeof payload === "object" ? payload : {};
      const targetCollection = ensureCollection(collectionStore, collectionId);

      Object.entries(nextPatch).forEach(([patchedEntityId, patchedEntity]) => {
        if (patchedEntity === null) {
          delete targetCollection[String(patchedEntityId)];
          return;
        }
        targetCollection[String(patchedEntityId)] = clone(patchedEntity);
      });

      await route.fulfill({
        status: 200,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify(nextPatch),
      });
      return;
    }

    if (method === "DELETE") {
      if (entityId != null) {
        delete collection[entityId];
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json; charset=utf-8",
        body: "null",
      });
      return;
    }

    await route.fulfill({
      status: 405,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify({
        error: `Unsupported method in Firebase mock: ${method}`,
      }),
    });
  });
}

module.exports = {
  installFirebaseMock,
  SMOKE_TEST_CREDENTIALS,
  SMOKE_SEED_TASK_TITLE,
};
