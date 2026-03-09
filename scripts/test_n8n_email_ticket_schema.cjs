"use strict";

const fs = require("fs");
const path = require("path");
const {
  normalizeGeminiTicketPayload,
  validateGeminiTicketPayload,
  mapGeminiTicketToJoinTask,
} = require("../automation/n8n/lib/email_ticket_schema_validation.cjs");

const FIXTURE_DIR = path.join(
  __dirname,
  "..",
  "automation",
  "n8n",
  "fixtures"
);
const WORKFLOW_DIR = path.join(
  __dirname,
  "..",
  "automation",
  "n8n",
  "workflows"
);

/**
 * Loads and parses a JSON fixture by file name.
 *
 * @param {string} fileName - Fixture file name.
 * @returns {Object}
 */
function readFixture(fileName) {
  const absolutePath = path.join(FIXTURE_DIR, fileName);
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

/**
 * Loads and parses a JSON file from the n8n workflows directory.
 *
 * @param {string} fileName - Workflow file name.
 * @returns {Object}
 */
function readWorkflow(fileName) {
  const absolutePath = path.join(WORKFLOW_DIR, fileName);
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

/**
 * Throws when condition is false.
 *
 * @param {boolean} condition - Assertion condition.
 * @param {string} message - Assertion message.
 * @returns {void}
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Ensures production workflow keeps the required trigger and persistent quota guard.
 *
 * @returns {void}
 */
function assertProductionWorkflowShape() {
  const productionWorkflow = readWorkflow("email-to-ticket.production.workflow.json");
  const nodes = Array.isArray(productionWorkflow.nodes) ? productionWorkflow.nodes : [];

  const emailTriggerNode = nodes.find(
    (node) => node && node.type === "n8n-nodes-base.emailReadImap"
  );
  assert(
    Boolean(emailTriggerNode),
    "Production workflow must include a real IMAP Email Trigger node."
  );

  const loadCounterNode = nodes.find(
    (node) => node && node.name === "Load Persistent Daily Counter"
  );
  const incrementCounterNode = nodes.find(
    (node) => node && node.name === "Increment Persistent Counter"
  );
  const dailyLimitNode = nodes.find(
    (node) => node && node.name === "If Daily Limit Reached"
  );

  assert(
    Boolean(loadCounterNode),
    "Production workflow must include 'Load Persistent Daily Counter'."
  );
  assert(
    Boolean(incrementCounterNode),
    "Production workflow must include 'Increment Persistent Counter'."
  );
  assert(
    Boolean(dailyLimitNode),
    "Production workflow must include 'If Daily Limit Reached'."
  );

  const loadCounterCode =
    typeof loadCounterNode?.parameters?.jsCode === "string"
      ? loadCounterNode.parameters.jsCode
      : "";
  const incrementCounterCode =
    typeof incrementCounterNode?.parameters?.jsCode === "string"
      ? incrementCounterNode.parameters.jsCode
      : "";

  assert(
    loadCounterCode.includes("getWorkflowStaticData('global')"),
    "Load-counter node must read persistent n8n workflow static data."
  );
  assert(
    incrementCounterCode.includes("getWorkflowStaticData('global')"),
    "Increment-counter node must write persistent n8n workflow static data."
  );
}

/**
 * Executes schema validation checks for fixture payloads.
 *
 * @returns {void}
 */
function run() {
  const validPayload = normalizeGeminiTicketPayload(
    readFixture("gemini-output.valid.json")
  );
  const missingTitlePayload = normalizeGeminiTicketPayload(
    readFixture("gemini-output.invalid-missing-title.json")
  );
  const invalidPriorityPayload = normalizeGeminiTicketPayload(
    readFixture("gemini-output.invalid-priority.json")
  );

  const validErrors = validateGeminiTicketPayload(validPayload);
  assert(validErrors.length === 0, `Valid fixture failed: ${validErrors.join(" | ")}`);

  const mappedTask = mapGeminiTicketToJoinTask(validPayload, {
    id: 1360001,
    category: "category-4",
    nowIso: "2026-03-09T00:00:00.000Z",
  });
  assert(mappedTask.source === "email-ai", "Mapped task source must be email-ai.");
  assert(mappedTask.aiGenerated === true, "Mapped task must be marked as AI-generated.");
  assert(mappedTask.category === "category-4", "Mapped task must target category-4.");
  assert(
    mappedTask.externalCreatorEmail === "claudia.baer@example.com",
    "Mapped creator email is not normalized as expected."
  );

  const missingTitleErrors = validateGeminiTicketPayload(missingTitlePayload);
  assert(
    missingTitleErrors.some((error) => error.includes("title")),
    "Missing-title fixture must fail with title error."
  );

  const invalidPriorityErrors = validateGeminiTicketPayload(invalidPriorityPayload);
  assert(
    invalidPriorityErrors.some((error) => error.includes("priority")),
    "Invalid-priority fixture must fail with priority error."
  );

  assertProductionWorkflowShape();

  console.log("n8n email-ticket schema fixture tests passed.");
}

run();
