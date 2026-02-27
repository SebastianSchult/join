# CSS Guardrails (Stylelint)

## Purpose

This project uses Stylelint as a CSS guardrail to catch syntax and maintainability issues early in PRs and pushes.

## Local command

```bash
npm run lint:css
```

The command lints:

- `assets/css/**/*.css`
- `style.css`

## CI integration

The `PR Tests` workflow includes a dedicated `css-guardrails` job that runs the same command on:

- `push`
- `pull_request`

## Enforced baseline rules

The Stylelint config (`.stylelintrc.cjs`) checks for:

- unknown at-rules and properties
- invalid hex colors and unknown units
- duplicate declarations
- shorthand-overridden longhand collisions
- unspaced `calc()` operators
- duplicate font-family names

Stylelint output includes file path, line/column, and rule name to keep fixes actionable.

## Legacy exceptions

A small set of known legacy files is temporarily excluded from selected maintainability rules
(`declaration-block-no-duplicate-properties` and specific shorthand-override cases).
This keeps CI green while still enforcing the rules for newly touched/cleaner files.
