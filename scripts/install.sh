#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

MIN_NODE_MAJOR=20

log() {
  printf '[install] %s\n' "$1"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "Missing required command: $1"
    exit 1
  fi
}

check_node_version() {
  local version major
  version="$(node -v)"
  major="${version#v}"
  major="${major%%.*}"

  if [ "$major" -lt "$MIN_NODE_MAJOR" ]; then
    log "Node.js ${MIN_NODE_MAJOR}+ is required, current version is $version"
    exit 1
  fi
}

print_success() {
  cat <<EOF

[install] Done.
[install] App URL: http://${APP_HOST:-127.0.0.1}:${APP_PORT:-3000}
[install] Admin URL: http://${APP_HOST:-127.0.0.1}:${APP_PORT:-3000}/admin
[install] Default admin password: microwave-admin
[install] Use 'npm run app:status' to inspect the process
[install] Use 'npm run app:logs' to stream logs
[install] Use 'npm run app:down' to stop the app
EOF
}

require_command node
require_command npm
check_node_version

log "Node $(node -v)"
log "npm $(npm -v)"
log "Installing and starting AI 微波炉"

bash scripts/appctl.sh up

print_success
