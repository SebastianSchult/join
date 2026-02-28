#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-SebastianSchult/join}"
DRAFT_DIR="${2:-.github/issue-drafts}"
TOKEN="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
API_URL="https://api.github.com/repos/${REPO}/issues"

if [[ -z "${TOKEN}" ]]; then
  echo "Error: Missing token."
  echo "Set GITHUB_TOKEN or GH_TOKEN, for example:"
  echo "  export GITHUB_TOKEN=ghp_xxx"
  exit 1
fi

if [[ ! -d "${DRAFT_DIR}" ]]; then
  echo "Error: Draft directory not found: ${DRAFT_DIR}"
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "Error: curl not found."
  exit 1
fi

if ! command -v ruby >/dev/null 2>&1; then
  echo "Error: ruby not found."
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
read -r -p "Continue and create issues via GitHub API? [y/N] " confirm
if [[ "${confirm}" != "y" && "${confirm}" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

created=0
failed=0

for draft in "${DRAFT_DIR}"/[0-9][0-9]-*.md; do
  [[ -f "${draft}" ]] || continue

  title="$(sed -n 's/^Title: //p' "${draft}" | head -n1)"
  if [[ -z "${title}" ]]; then
    echo "Skip ${draft}: missing Title line"
    failed=$((failed + 1))
    continue
  fi

  body_file="$(mktemp)"
  response_file="$(mktemp)"

  awk 'found { print } /^Body:$/ { found=1 }' "${draft}" > "${body_file}"
  payload="$(ruby -rjson -e 'title = ARGV[0]; body = File.read(ARGV[1]); puts JSON.generate({title: title, body: body})' "${title}" "${body_file}")"

  echo "Creating: ${title}"
  http_code="$(
    curl -sS \
      -o "${response_file}" \
      -w "%{http_code}" \
      -X POST "${API_URL}" \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      -d "${payload}"
  )"

  if [[ "${http_code}" =~ ^2[0-9][0-9]$ ]]; then
    issue_url="$(ruby -rjson -e 'j = JSON.parse(STDIN.read); puts(j["html_url"] || "")' < "${response_file}")"
    echo "  OK: ${issue_url}"
    created=$((created + 1))
  else
    error_msg="$(ruby -rjson -e 'j = JSON.parse(STDIN.read) rescue {}; puts(j["message"] || "unknown error")' < "${response_file}")"
    echo "  FAIL (${http_code}): ${error_msg}"
    failed=$((failed + 1))
  fi

  rm -f "${body_file}" "${response_file}"
done

echo
echo "Finished. Created: ${created}, Failed: ${failed}"
if [[ "${failed}" -gt 0 ]]; then
  exit 1
fi
