# Deployment Automation

Deployment runs automatically on every push to `main`:

- Workflow: `.github/workflows/deploy-on-main.yml`
- Trigger: merge to `main` (push event)

The workflow supports two modes:

1. SSH + rsync deploy
2. FTP/FTPS deploy (fallback when SSH secrets are not set)

## Set deployment secrets

Set secrets in:
`Settings -> Secrets and variables -> Actions -> Repository secrets`

### Option A: SSH deploy

- `DEPLOY_SSH_HOST`: server hostname or IP
- `DEPLOY_SSH_USER`: SSH username
- `DEPLOY_SSH_KEY`: private SSH key
- `DEPLOY_PATH`: target path on server

Optional:

- `DEPLOY_SSH_PORT`: SSH port (default `22`)
- `DEPLOY_POST_COMMAND`: remote command after upload

### Option B: FTP/FTPS deploy

- `DEPLOY_FTP_SERVER`: FTP host (example: `w01f67fb.kasserver.com`)
- `DEPLOY_FTP_USER`: FTP username
- `DEPLOY_FTP_PASSWORD`: FTP password
- `DEPLOY_FTP_DIR`: target directory (example: `/sebastian-schult-dev.de/join/`)

Optional:

- `DEPLOY_FTP_PORT`: port (default `21`)

FTP mode tries `ftps` first and automatically falls back to `ftp` if FTPS login/handshake fails.

For your ALL-INKL example, these values are typically:

- `DEPLOY_FTP_SERVER` = `w01f67fb.kasserver.com`
- `DEPLOY_FTP_USER` = `w01f67fb`
- `DEPLOY_FTP_DIR` = `/sebastian-schult-dev.de/join/`

## Runtime config secrets (for `js/config.js`)

The deploy workflow generates `js/config.js` on the runner from repository secrets and uploads it to the server on every deploy.

Required:

- `JOIN_APP_STORAGE_TOKEN`
- `JOIN_APP_BASE_URL`
- `JOIN_APP_FIREBASE_TASKS_ID`
- `JOIN_APP_FIREBASE_USERS_ID`
- `JOIN_APP_COOKIEBOT_ID`

Optional:

- `JOIN_APP_STORAGE_URL` (default: `https://remote-storage.developerakademie.org/item`)
- `JOIN_APP_COOKIEBOT_BLOCKING_MODE` (default: `auto`)

## What gets deployed

The workflow excludes:

- `.git/`
- `.github/`
- `.vscode/`
- `.DS_Store`
- `node_modules/`

## Project status sync

Workflow `.github/workflows/pr-issue-status.yml` updates linked issues:

- PR opened/reopened/ready/synchronize -> project status `Review`
- PR merged -> project status `Done`

It uses:

- repository variable `GH_PROJECT_URL`
- repository secret `PROJECT_TOKEN`
