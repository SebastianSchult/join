#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-SebastianSchult/join}"
DRAFT_DIR="${2:-.github/issue-drafts}"

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: GitHub CLI (gh) not found."
  echo "Install gh or create the issues manually from ${DRAFT_DIR}."
  exit 1
fi

if [[ ! -d "${DRAFT_DIR}" ]]; then
  echo "Error: Draft directory not found: ${DRAFT_DIR}"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Error: gh is not authenticated. Run: gh auth login"
  exit 1
fi

echo "Repo: ${REPO}"
echo "Drafts: ${DRAFT_DIR}"
echo
echo "The following draft issues will be created:"
for draft in "${DRAFT_DIR}"/[0-9][0-9]-*.md; do
  [[ -f "${draft}" ]] || continue
  title="$(sed -n 's/^Title: //p' "${draft}" | head -n1)"
  echo "- ${title}"
done
echo
read -r -p "Continue and create issues? [y/N] " confirm
if [[ "${confirm}" != "y" && "${confirm}" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

created=0
for draft in "${DRAFT_DIR}"/[0-9][0-9]-*.md; do
  [[ -f "${draft}" ]] || continue
  title="$(sed -n 's/^Title: //p' "${draft}" | head -n1)"
  if [[ -z "${title}" ]]; then
    echo "Skip ${draft}: missing Title line"
    continue
  fi

  body_file="$(mktemp)"
  awk 'found { print } /^Body:$/ { found=1 }' "${draft}" > "${body_file}"

  echo "Creating: ${title}"
  gh issue create --repo "${REPO}" --title "${title}" --body-file "${body_file}" >/dev/null
  rm -f "${body_file}"
  created=$((created + 1))
done

echo
echo "Done. Created ${created} issues in ${REPO}."
