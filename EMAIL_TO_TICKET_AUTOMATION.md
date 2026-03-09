# AI Email-to-Ticket Automation

This document defines the repository-side contract for AI-driven email intake into the Join board.

## Goal

- External stakeholders can create board tasks via email.
- AI parsing maps email content to structured task fields.
- Resulting tasks appear in the `E-Mails` board column (`category-4`).
- AI-created tasks are clearly marked and reviewable in UI.

## End-to-end flow (n8n + Join)

1. Incoming email triggers n8n workflow.
2. n8n checks daily quota (max `10` AI requests per day, Europe/Berlin day boundary).
3. n8n sends email content to Gemini with strict JSON output schema.
4. n8n validates/parses model output and maps it to Join task payload.
5. n8n writes task into Firebase tasks collection (`FIREBASE_TASKS_ID`).
6. Join board renders task in `E-Mails` column with AI/external badges.

## Required task payload contract

Use this minimum payload in Firebase for AI email tickets:

```json
{
  "id": 123456,
  "type": "User Story",
  "title": "Short task title",
  "description": "Parsed email summary",
  "subtasks": [],
  "assignedTo": [],
  "category": "category-4",
  "priority": "medium",
  "dueDate": "",
  "images": [],
  "source": "email-ai",
  "aiGenerated": true,
  "externalCreatorName": "Max Mustermann",
  "externalCreatorEmail": "max@example.com"
}
```

### Notes

- `category` must be one of `category-0` to `category-4`.
- `source` supports `manual` and `email-ai`.
- `source: email-ai` is rendered with `AI Generated Ticket` badge in board UI.
- `externalCreatorName`/`externalCreatorEmail` are shown as `Externer` metadata in task details.

## n8n environment variables

Set these on the n8n host (do not hardcode in workflow JSON):

- `GEMINI_API_KEY`
- `GEMINI_MODEL` (for example `gemini-2.0-flash`)
- `JOIN_BASE_URL` (with trailing slash, Firebase base URL)
- `JOIN_FIREBASE_TASKS_ID`
- `JOIN_EMAIL_TASK_CATEGORY` (current default: `category-4`)
- `N8N_TZ=Europe/Berlin`

## Workflow versioning and export

Versioned n8n artifacts live in `automation/n8n/`:

- main workflow export:
  - `automation/n8n/workflows/email-to-ticket.main.workflow.json`
- production workflow export (real email intake):
  - `automation/n8n/workflows/email-to-ticket.production.workflow.json`
- dead-letter workflow export:
  - `automation/n8n/workflows/email-to-ticket.dead-letter.workflow.json`
- strict Gemini output schema:
  - `automation/n8n/schemas/gemini-ticket.schema.json`
- deterministic fixtures:
  - `automation/n8n/fixtures/*.json`

Import order in n8n:

1. Import production workflow export for real IMAP-triggered intake.
2. Import dead-letter workflow export.
3. Optional for local dry-runs: import main workflow export (manual trigger + sample payload).
4. Configure env vars and credentials.
5. Run one test execution.

After workflow edits in n8n:

1. Re-export JSON from n8n.
2. Overwrite versioned file(s) in `automation/n8n/workflows/`.
3. Commit the export together with docs/fixture updates.

## Daily limit strategy (Gemini Free Plan)

Implement quota guard in n8n before Gemini call:

1. Build day key in `Europe/Berlin`, for example `email-ai:2026-03-08`.
2. Read current count from persistent n8n storage (Data Store or workflow static data in n8n DB).
3. If count `>= 10`, stop workflow and log/notify `Daily limit reached`.
4. Otherwise increment count and continue with Gemini parsing.

This ensures deterministic daily caps independent of mail volume.

## Error handling and observability

Classify and log errors by class:

- `validation`: model output missing required fields or invalid enum values.
- `quota`: daily limit reached.
- `transport`: network/timeout issues to Gemini or Firebase.
- `auth`: invalid API key / unauthorized Firebase write.
- `unknown`: fallback for uncategorized failures.

Recommended behavior:

- Do not write partial tasks when required fields are invalid.
- Add a structured error log entry with workflow execution id and message-id.
- Keep original email metadata in logs for manual replay.

## Review checklist for AI-generated tasks

- Title is concise and actionable.
- Priority is valid (`low`, `medium`, `urgent`).
- Category is `category-4`.
- Task shows `AI Generated Ticket` badge.
- Task details show `Externer` metadata.
- Sensitive data from email body is not copied verbatim if not needed.

## Local schema check (deterministic)

Run this command before opening a PR:

```bash
npm run test:n8n-email-ticket
```

It validates that:

- valid fixture payload passes strict schema checks,
- invalid fixtures fail as expected,
- Join task mapping still writes `source=email-ai`, `aiGenerated=true`, `category-4`.
