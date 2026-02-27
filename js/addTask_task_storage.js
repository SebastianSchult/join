"use strict";

let pendingTaskUpserts = new Set();
let pendingTaskDeletes = new Set();

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
  tasks = loadResult.data;
  tasks.forEach((task) => {
    if (!task.hasOwnProperty("subtasks")) task.subtasks = [];
    if (!task.hasOwnProperty("assignedTo")) task.assignedTo = [];
  });
  return loadResult;
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
      payload[id] = task;
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
