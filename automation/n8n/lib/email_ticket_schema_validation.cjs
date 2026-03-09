"use strict";

const GEMINI_PRIORITY_VALUES = Object.freeze(["low", "medium", "urgent"]);
const GEMINI_LABEL_VALUES = Object.freeze(["User Story", "Technical Task"]);
const GEMINI_MAX_TEXT_LENGTH = 2000;
const GEMINI_MAX_TITLE_LENGTH = 120;
const DEFAULT_EMAIL_CATEGORY = "category-4";

/**
 * Returns true when the value is a non-null object (excluding arrays).
 *
 * @param {*} value - Value to check.
 * @returns {boolean}
 */
function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Returns a trimmed string or an empty string for non-string values.
 *
 * @param {*} value - Value to normalize.
 * @returns {string}
 */
function toTrimmedString(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

/**
 * Normalizes email values.
 *
 * @param {*} value - Raw email input.
 * @returns {string}
 */
function normalizeEmail(value) {
  return toTrimmedString(value).toLowerCase();
}

/**
 * Normalizes incoming Gemini output into a deterministic object shape.
 *
 * @param {*} rawPayload - Untrusted model output.
 * @returns {{title:string,label:string,creatorName:string,creatorEmail:string,priority:string,description:string}}
 */
function normalizeGeminiTicketPayload(rawPayload) {
  const source = isPlainObject(rawPayload) ? rawPayload : {};
  return {
    title: toTrimmedString(source.title),
    label: toTrimmedString(source.label),
    creatorName: toTrimmedString(source.creatorName),
    creatorEmail: normalizeEmail(source.creatorEmail),
    priority: toTrimmedString(source.priority).toLowerCase(),
    description: toTrimmedString(source.description),
  };
}

/**
 * Validates normalized Gemini output with strict constraints.
 *
 * @param {{title:string,label:string,creatorName:string,creatorEmail:string,priority:string,description:string}} payload - Normalized payload.
 * @returns {string[]} Validation errors. Empty when valid.
 */
function validateGeminiTicketPayload(payload) {
  const errors = [];
  if (!isPlainObject(payload)) {
    return ["Payload must be an object."];
  }

  if (payload.title.length < 3 || payload.title.length > GEMINI_MAX_TITLE_LENGTH) {
    errors.push(
      `title must be between 3 and ${GEMINI_MAX_TITLE_LENGTH} characters.`
    );
  }

  if (!GEMINI_LABEL_VALUES.includes(payload.label)) {
    errors.push(`label must be one of: ${GEMINI_LABEL_VALUES.join(", ")}.`);
  }

  if (payload.creatorName.length < 2 || payload.creatorName.length > 120) {
    errors.push("creatorName must be between 2 and 120 characters.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.creatorEmail)) {
    errors.push("creatorEmail must be a valid email address.");
  }

  if (!GEMINI_PRIORITY_VALUES.includes(payload.priority)) {
    errors.push(`priority must be one of: ${GEMINI_PRIORITY_VALUES.join(", ")}.`);
  }

  if (payload.description.length < 3 || payload.description.length > GEMINI_MAX_TEXT_LENGTH) {
    errors.push(
      `description must be between 3 and ${GEMINI_MAX_TEXT_LENGTH} characters.`
    );
  }

  return errors;
}

/**
 * Maps a validated Gemini payload into the Join task contract.
 *
 * @param {{title:string,label:string,creatorName:string,creatorEmail:string,priority:string,description:string}} payload - Normalized payload.
 * @param {{category?:string,id?:number,nowIso?:string}} [options={}] - Mapping options.
 * @returns {{id:number,type:string,title:string,description:string,subtasks:Array,assignedTo:Array,category:string,priority:string,dueDate:string,images:Array,source:string,aiGenerated:boolean,externalCreatorName:string,externalCreatorEmail:string,createdAt:string}}
 */
function mapGeminiTicketToJoinTask(payload, options = {}) {
  const normalized = normalizeGeminiTicketPayload(payload);
  const validationErrors = validateGeminiTicketPayload(normalized);
  if (validationErrors.length > 0) {
    throw new Error(`Gemini payload validation failed: ${validationErrors.join(" | ")}`);
  }

  const category =
    typeof options.category === "string" && /^category-\d+$/.test(options.category)
      ? options.category
      : DEFAULT_EMAIL_CATEGORY;
  const idCandidate = Number(options.id);
  const taskId = Number.isSafeInteger(idCandidate) ? idCandidate : Date.now();
  const createdAt =
    typeof options.nowIso === "string" && options.nowIso.trim() !== ""
      ? options.nowIso
      : new Date().toISOString();

  return {
    id: taskId,
    type: normalized.label,
    title: normalized.title,
    description: normalized.description,
    subtasks: [],
    assignedTo: [],
    category,
    priority: normalized.priority,
    dueDate: "",
    images: [],
    source: "email-ai",
    aiGenerated: true,
    externalCreatorName: normalized.creatorName,
    externalCreatorEmail: normalized.creatorEmail,
    createdAt,
  };
}

module.exports = Object.freeze({
  DEFAULT_EMAIL_CATEGORY,
  GEMINI_LABEL_VALUES,
  GEMINI_PRIORITY_VALUES,
  mapGeminiTicketToJoinTask,
  normalizeGeminiTicketPayload,
  validateGeminiTicketPayload,
});
