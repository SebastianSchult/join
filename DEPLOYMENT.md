# Deployment Automation

Deployment runs automatically on every push to `main`:

- Workflow: `.github/workflows/deploy-on-main.yml`
- Trigger: merge to `main` (push event)

## Required repository secrets

Set these in:
`Settings -> Secrets and variables -> Actions -> Repository secrets`

- `DEPLOY_SSH_HOST`: server hostname or IP
- `DEPLOY_SSH_USER`: SSH username
- `DEPLOY_SSH_KEY`: private SSH key (for the deploy user)
- `DEPLOY_PATH`: target path on server (for example `/var/www/join`)

Optional:

- `DEPLOY_SSH_PORT`: SSH port (default is `22`)
- `DEPLOY_POST_COMMAND`: remote command after upload

## What gets deployed

The workflow uploads repository files with `rsync` and excludes:

- `.git/`
- `.github/`
- `.vscode/`
- `.DS_Store`
- `node_modules/`
- `js/config.js`

## Project status sync

Workflow `.github/workflows/pr-issue-status.yml` updates linked issues:

- PR opened/reopened/ready/synchronize -> project status `Review`
- PR merged -> project status `Done`

It uses:

- repository variable `GH_PROJECT_URL`
- repository secret `PROJECT_TOKEN`
