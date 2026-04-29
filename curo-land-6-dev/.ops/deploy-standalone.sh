#!/usr/bin/env bash

set -euo pipefail

require_var() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "Missing required environment variable: ${name}" >&2
    exit 1
  fi
}

require_var "DEPLOY_HOST"
require_var "DEPLOY_USER"
require_var "DEPLOY_PATH"
require_var "DEPLOY_SSH_PRIVATE_KEY_B64"

DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_SOURCE_DIR="${DEPLOY_SOURCE_DIR:-dist}"

decode_base64_to_file() {
  local payload="$1"
  local target_file="$2"

  if printf '' | base64 --decode >/dev/null 2>&1; then
    printf '%s' "${payload}" | base64 --decode > "${target_file}"
    return
  fi

  printf '%s' "${payload}" | base64 -D > "${target_file}"
}

if [[ ! -d "${DEPLOY_SOURCE_DIR}" ]]; then
  echo "Deploy source directory does not exist: ${DEPLOY_SOURCE_DIR}" >&2
  exit 1
fi

if [[ ! -f "${DEPLOY_SOURCE_DIR}/index.html" ]]; then
  echo "Deploy source directory is missing index.html: ${DEPLOY_SOURCE_DIR}" >&2
  exit 1
fi

SSH_DIR="${HOME}/.ssh"
KEY_PATH="${SSH_DIR}/id_ed25519_deploy"
KNOWN_HOSTS_PATH="${SSH_DIR}/known_hosts"

mkdir -p "${SSH_DIR}"
chmod 700 "${SSH_DIR}"

decode_base64_to_file "${DEPLOY_SSH_PRIVATE_KEY_B64}" "${KEY_PATH}"
chmod 600 "${KEY_PATH}"

if [[ -n "${DEPLOY_KNOWN_HOSTS:-}" ]]; then
  printf '%s\n' "${DEPLOY_KNOWN_HOSTS}" > "${KNOWN_HOSTS_PATH}"
else
  ssh-keyscan -p "${DEPLOY_PORT}" -H "${DEPLOY_HOST}" > "${KNOWN_HOSTS_PATH}"
fi
chmod 600 "${KNOWN_HOSTS_PATH}"

printf -v RSYNC_SSH 'ssh -i %q -o StrictHostKeyChecking=yes -o UserKnownHostsFile=%q -p %q' \
  "${KEY_PATH}" \
  "${KNOWN_HOSTS_PATH}" \
  "${DEPLOY_PORT}"

REMOTE_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"

echo "Deploying ${DEPLOY_SOURCE_DIR}/ to ${REMOTE_TARGET}"

ssh -i "${KEY_PATH}" \
  -o StrictHostKeyChecking=yes \
  -o UserKnownHostsFile="${KNOWN_HOSTS_PATH}" \
  -p "${DEPLOY_PORT}" \
  "${DEPLOY_USER}@${DEPLOY_HOST}" \
  "mkdir -p '${DEPLOY_PATH}'"

rsync -az --delete \
  -e "${RSYNC_SSH}" \
  "${DEPLOY_SOURCE_DIR}/" \
  "${REMOTE_TARGET}"

echo "Deploy completed for ${REMOTE_TARGET}"
