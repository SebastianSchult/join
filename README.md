# Join

Join is a kanban-style task management web app (login, board, contacts, summary, add-task).

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create runtime config:

```bash
cp js/config.example.js js/config.js
```

3. Fill `js/config.js` with your local values (see [CONFIGURATION.md](./CONFIGURATION.md)).

4. Start a local static server (example):

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/index.html`.

## Quality checks

```bash
npm run lint
npm run lint:css
npm run lint:jsdoc
npm run lint:file-size
npm run a11y:audit
npm run a11y:ci
npm run a11y:report
```

## Documentation index

- Runtime config: [CONFIGURATION.md](./CONFIGURATION.md)
- Deployment pipeline: [DEPLOYMENT.md](./DEPLOYMENT.md)
- GitHub issue/PR/project/deploy automation: [GITHUB_AUTOMATION.md](./GITHUB_AUTOMATION.md)
- Accessibility checks: [ACCESSIBILITY_CHECKS.md](./ACCESSIBILITY_CHECKS.md)
- File-size guardrails: [FILE_SIZE_GUARDRAILS.md](./FILE_SIZE_GUARDRAILS.md)
- Page script dependency manifest: [PAGE_SCRIPT_DEPENDENCIES.md](./PAGE_SCRIPT_DEPENDENCIES.md)
- CSS guardrails (Stylelint): [CSS_GUARDRAILS.md](./CSS_GUARDRAILS.md)
- JSDoc guardrails: [JSDOC_GUARDRAILS.md](./JSDOC_GUARDRAILS.md)
- Content Security Policy baseline: [CSP_BASELINE.md](./CSP_BASELINE.md)
- UI tokens and breakpoints: [UI_TOKENS.md](./UI_TOKENS.md)
- Secure rendering / XSS rules: [SECURITY_RENDERING.md](./SECURITY_RENDERING.md)
- Refactor baseline and roadmap: [REFACTOR_RESEARCH.md](./REFACTOR_RESEARCH.md)
- Refactor regression matrix and smoke checklist: [REFACTOR_REGRESSION_MATRIX.md](./REFACTOR_REGRESSION_MATRIX.md)
- Engineering standards (docs, naming, ownership, refactor checklist): [ENGINEERING_STANDARDS.md](./ENGINEERING_STANDARDS.md)
