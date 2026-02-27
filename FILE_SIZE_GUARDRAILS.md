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
| CSS default (`.css`) | > 420 lines | > 700 lines |
| CSS base layer (`*.base.css`) | > 320 lines | > 500 lines |
| CSS components layer (`*.components.css`) | > 380 lines | > 560 lines |
| CSS responsive layer (`*.responsive.css`) | > 340 lines | > 620 lines |

Behavior:

- files above warning threshold are reported as warnings
- files above hard-fail threshold fail CI

Layering note:

- layer-specific thresholds override CSS default thresholds
- files without layer suffixes (for example `login.css`, `help.css`) use CSS default thresholds

## Current Exceptions

No active exceptions are configured.
