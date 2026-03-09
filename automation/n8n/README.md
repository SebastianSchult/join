# n8n Infrastructure-as-Workflow

This folder contains versioned n8n artifacts for the Join email-to-ticket flow.

## Why this exists

- Workflows are stored in Git and reviewable in PRs.
- Retry/dead-letter behavior is explicit and reproducible.
- Fixture payloads provide deterministic local checks for schema changes.

## Folder structure

- `workflows/email-to-ticket.main.workflow.json`: local/dev workflow with `Manual Trigger` and sample payload.
- `workflows/email-to-ticket.production.workflow.json`: production workflow with real `Email Trigger (IMAP)` and persistent daily counter in n8n workflow static data (DB-backed).
- `workflows/email-to-ticket.dead-letter.workflow.json`: centralized dead-letter workflow via `Error Trigger`.
- `schemas/gemini-ticket.schema.json`: strict Gemini output contract.
- `fixtures/*.json`: test payloads for valid/invalid model output.
- `lib/email_ticket_schema_validation.cjs`: normalization + strict validator + Join mapping helper.

## Import in n8n

1. Open n8n -> `Workflows` -> `Import from file`.
2. For production, import `email-to-ticket.production.workflow.json`.
3. Optionally import `email-to-ticket.main.workflow.json` for local dry-runs with sample data.
4. Import `email-to-ticket.dead-letter.workflow.json`.
5. Set env vars on your n8n host:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL`
   - `JOIN_BASE_URL`
   - `JOIN_FIREBASE_TASKS_ID`
   - `JOIN_EMAIL_TASK_CATEGORY` (`category-4` default)
   - `N8N_TZ=Europe/Berlin`

## Versioning rule

- Any workflow node change must be exported back into `automation/n8n/workflows/`.
- Commit message should mention workflow scope, for example:
  - `chore(n8n): tune Gemini retry and schema error routing`

## Local deterministic checks

Run:

```bash
npm run test:n8n-email-ticket
```

This checks:

- valid fixture passes schema gate
- invalid fixtures fail with expected error class
- mapping to Join task contract is stable (`source=email-ai`, `category-4`, `aiGenerated=true`)
