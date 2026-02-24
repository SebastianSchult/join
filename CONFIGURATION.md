# Runtime Configuration

This project no longer stores storage credentials directly in source files.

## Local setup

1. Create local config file from template:

```bash
cp js/config.example.js js/config.js
```

2. Fill `js/config.js` with your real values:
- `STORAGE_TOKEN`
- `STORAGE_URL`
- `BASE_URL`
- `FIREBASE_TASKS_ID`
- `FIREBASE_USERS_ID`

3. Start the app as usual.

## Security note

- `js/config.js` is gitignored and must never be committed.
- If credentials were previously exposed, rotate them in the provider systems.
