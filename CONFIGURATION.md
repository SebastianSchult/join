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
- `COOKIEBOT_ID` (from your Cookiebot manager)
- optional: `COOKIEBOT_BLOCKING_MODE` (default: `auto`)

3. Start the app as usual.

## Local lint checks

Run these commands before pushing a branch:

```bash
npm install
npm run lint
```

What this checks:
- `lint:js`: ESLint on page-based script bundles (`no-undef`, `no-redeclare`)
- `lint:templates`: duplicate inline HTML attributes inside template/rendering JS

## Security note

- `js/config.js` is gitignored and must never be committed.
- If credentials were previously exposed, rotate them in the provider systems.

## CI/CD deploy note

For GitHub Actions deployment, `js/config.js` is generated during deploy from repository secrets:

- `JOIN_APP_STORAGE_TOKEN`
- `JOIN_APP_BASE_URL`
- `JOIN_APP_FIREBASE_TASKS_ID`
- `JOIN_APP_FIREBASE_USERS_ID`
- optional: `JOIN_APP_STORAGE_URL`
- `JOIN_APP_COOKIEBOT_ID`
- optional: `JOIN_APP_COOKIEBOT_BLOCKING_MODE` (default: `auto`)

## Cookiebot setup

1. Create/get your Cookiebot domain group ID in Cookiebot.
2. Add it to local `js/config.js` as `COOKIEBOT_ID`.
3. Add repository secret `JOIN_APP_COOKIEBOT_ID` for deploy.
4. Deploy to `main` and verify banner appears on first page load.

## Password handling

- New accounts store `passwordHash`, `passwordSalt`, `passwordHashIterations`, `passwordHashVersion`.
- Plaintext `password` is no longer written for signup or contact creation.
- During login, legacy users with plaintext `password` are migrated to hashed credentials and persisted.

### Basic abuse checks

1. Create a user, then inspect Firebase user JSON.
   Expected: no plaintext `password` field.
2. Try login with wrong password.
   Expected: login is rejected with invalid credentials message.
3. Create a new contact and inspect stored contact JSON.
   Expected: no predictable/default password is added.
