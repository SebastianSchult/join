"use strict";

let pendingTaskUpserts = new Set();
let pendingTaskDeletes = new Set();
const TASK_CATEGORY_MAX_ID = 4;
const TASK_DEFAULT_CATEGORY = "category-0";
const TASK_SOURCE_MANUAL = "manual";
const TASK_SOURCE_EMAIL_AI = "email-ai";

/**
 * Saves tasks to the remote storage.
 */
async function saveTasksToRemoteStorage() {
  deactivateButton("createBtn");

  const upsertIds = Array.from(pendingTaskUpserts);
  const deleteIds = Array.from(pendingTaskDeletes);

  if (upsertIds.length === 0 && deleteIds.length === 0) {
    activateButton("createBtn", "create-task");
    return;
  }

  try {
    const patchPayload = buildTaskPatchPayload(upsertIds);
    if (Object.keys(patchPayload).length > 0) {
      await firebasePatchCollection(patchPayload, FIREBASE_TASKS_ID);
    }

    for (let i = 0; i < deleteIds.length; i++) {
      await firebaseDeleteEntity(deleteIds[i], FIREBASE_TASKS_ID);
    }

    pendingTaskUpserts.clear();
    pendingTaskDeletes.clear();
  } catch (error) {
    console.error("Failed to persist task changes:", error);
    showGlobalUserMessage("Could not save task changes. Please try again.");
  } finally {
    activateButton("createBtn", "create-task");
  }
}

/**
 * Loads tasks from remote storage and updates task properties if necessary.
 *
 * @returns {Promise<{data:Array,error:Error|null}>} Safe load result.
 */
async function loadTasksFromRemoteStorage() {
  const loadResult = await firebaseGetArraySafe(FIREBASE_TASKS_ID, {
    context: "tasks",
    errorMessage: "Could not load tasks. Please try again.",
  });
  tasks = loadResult.data.map((task) => normalizeTaskEntity(task));
  return loadResult;
}

/**
 * Returns a normalized task entity with deterministic core/metadata fields.
 *
 * @param {Object} task - Raw task payload from storage.
 * @returns {Object} Normalized task object.
 */
function normalizeTaskEntity(task) {
  const normalizedTask = task && typeof task === "object" ? task : {};
  if (!Array.isArray(normalizedTask.subtasks)) normalizedTask.subtasks = [];
  if (!Array.isArray(normalizedTask.assignedTo)) normalizedTask.assignedTo = [];
  if (!Array.isArray(normalizedTask.images)) normalizedTask.images = [];
  normalizedTask.category = normalizeTaskCategory(normalizedTask.category);
  normalizeTaskAutomationMetadata(normalizedTask);
  return normalizedTask;
}

/**
 * Keeps task category within the board's supported columns.
 *
 * @param {string} category - Raw category key.
 * @returns {string} Valid category key.
 */
function normalizeTaskCategory(category) {
  if (typeof category !== "string") {
    return TASK_DEFAULT_CATEGORY;
  }

  const match = /^category-(\d+)$/.exec(category.trim());
  if (!match) {
    return TASK_DEFAULT_CATEGORY;
  }

  const categoryId = Number(match[1]);
  if (!Number.isSafeInteger(categoryId) || categoryId < 0 || categoryId > TASK_CATEGORY_MAX_ID) {
    return TASK_DEFAULT_CATEGORY;
  }

  return `category-${categoryId}`;
}

/**
 * Normalizes AI/email-origin metadata used by board rendering and intake flows.
 *
 * @param {Object} task - Task entity to normalize in place.
 * @returns {void}
 */
function normalizeTaskAutomationMetadata(task) {
  const rawSource =
    typeof task.source === "string"
      ? task.source
      : typeof task.intakeSource === "string"
        ? task.intakeSource
        : "";
  const normalizedSource = normalizeTaskSource(rawSource);

  const rawCreatorName =
    typeof task.externalCreatorName === "string"
      ? task.externalCreatorName
      : typeof task.creatorName === "string"
        ? task.creatorName
        : typeof task.createdByName === "string"
          ? task.createdByName
          : "";
  const rawCreatorEmail =
    typeof task.externalCreatorEmail === "string"
      ? task.externalCreatorEmail
      : typeof task.creatorEmail === "string"
        ? task.creatorEmail
        : typeof task.createdByEmail === "string"
          ? task.createdByEmail
          : "";

  const normalizedCreatorName = rawCreatorName.trim();
  const normalizedCreatorEmail =
    typeof normalizeAuthEmail === "function"
      ? normalizeAuthEmail(rawCreatorEmail)
      : rawCreatorEmail.trim().toLowerCase();

  const aiGeneratedRaw =
    typeof task.aiGenerated === "boolean"
      ? task.aiGenerated
      : typeof task.isAiGenerated === "boolean"
        ? task.isAiGenerated
        : task.aiGenerated;
  let aiGenerated = normalizeBooleanLike(aiGeneratedRaw);
  let source = normalizedSource;

  if (
    source === TASK_SOURCE_MANUAL &&
    (aiGenerated || normalizedCreatorName !== "" || normalizedCreatorEmail !== "")
  ) {
    source = TASK_SOURCE_EMAIL_AI;
  }

  if (source === TASK_SOURCE_EMAIL_AI) {
    aiGenerated = true;
  }

  task.source = source;
  task.aiGenerated = aiGenerated;
  task.externalCreatorName = normalizedCreatorName;
  task.externalCreatorEmail = normalizedCreatorEmail;
}

/**
 * Maps source aliases to supported task source enum values.
 *
 * @param {string} source - Raw source string.
 * @returns {string} Normalized source value.
 */
function normalizeTaskSource(source) {
  if (typeof source !== "string" || source.trim() === "") {
    return TASK_SOURCE_MANUAL;
  }

  const normalized = source.trim().toLowerCase();
  if (normalized === TASK_SOURCE_EMAIL_AI || normalized === "email" || normalized === "ai-email") {
    return TASK_SOURCE_EMAIL_AI;
  }
  return TASK_SOURCE_MANUAL;
}

/**
 * Converts common bool-like payloads to booleans.
 *
 * @param {*} value - Candidate boolean value.
 * @returns {boolean} Normalized boolean.
 */
function normalizeBooleanLike(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false") {
      return false;
    }
  }

  return false;
}

/** Marks a task id for patch upsert and removes conflicting pending delete state. */
function queueTaskUpsert(taskId) {
  const normalizedId = Number(taskId);
  if (!Number.isSafeInteger(normalizedId)) {
    return;
  }
  pendingTaskDeletes.delete(normalizedId);
  pendingTaskUpserts.add(normalizedId);
}

/** Marks a task id for deletion and removes conflicting pending upsert state. */
function queueTaskDelete(taskId) {
  const normalizedId = Number(taskId);
  if (!Number.isSafeInteger(normalizedId)) {
    return;
  }
  pendingTaskUpserts.delete(normalizedId);
  pendingTaskDeletes.add(normalizedId);
}

/** Builds a sparse Firebase patch payload for the given task id list. */
function buildTaskPatchPayload(taskIds) {
  const payload = {};
  taskIds.forEach((id) => {
    const task = getTaskById(id);
    if (task) {
      payload[id] = normalizeTaskEntity(task);
    }
  });
  return payload;
}

/** Resolves a task entity by id from the in-memory tasks collection. */
function getTaskById(taskId) {
  for (let i = 0; i < tasks.length; i++) {
    if (Number(tasks[i].id) === Number(taskId)) {
      return tasks[i];
    }
  }
  return null;
}
