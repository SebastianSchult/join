Title: [P0][Security]: Remove secrets from client-side storage configuration

Body:
### Priority
P0 - Critical

### Area
Storage

### Risk / Impact
API token and Firebase identifiers are embedded in frontend source code. Anyone with browser access can inspect and reuse these values. This increases risk of unauthorized read/write operations.

### Affected Files / Scope
- `js/storage.js`

### Proposed Mitigation
- Move secrets and sensitive runtime config out of client source code.
- Introduce secure config injection approach (server or environment-based build/release step).
- Rotate exposed token/credentials after migration.
- Add basic documentation for local development config.

### Acceptance Criteria
- [ ] No production secrets are stored in frontend repository files.
- [ ] Runtime configuration is injected securely.
- [ ] Existing exposed token/credentials are rotated.
- [ ] Local setup documentation for required environment values is available.
