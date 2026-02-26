# File-Size Guardrails

This repository enforces line-count guardrails for JavaScript and CSS files in PR CI.

Guardrail script:

- `scripts/check_file_size_guardrail.cjs`

Local command:

```bash
npm run lint:file-size
```

## Thresholds

| File type | Warning threshold | Hard-fail threshold |
| --- | --- | --- |
| JavaScript (`.js`) | > 300 lines | > 400 lines |
| CSS (`.css`) | > 800 lines | > 1000 lines |

Behavior:

- files above warning threshold are reported as warnings
- files above hard-fail threshold fail CI

## Current Exceptions

These are explicit temporary exceptions with higher hard-fail caps.

| File | Exception hard-fail cap | Reason |
| --- | --- | --- |
| `assets/templates/html_templates.js` | 650 lines | Legacy shared template bundle pending decomposition into focused template modules. |
| `assets/css/contacts.css` | 1200 lines | Legacy contacts stylesheet pending modular split by component/responsibility. |

When a refactor reduces one of these files below default limits, remove the exception.
