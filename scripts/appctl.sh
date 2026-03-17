#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

APP_HOST="${APP_HOST:-127.0.0.1}"
APP_PORT="${APP_PORT:-3000}"
RUNTIME_DIR="$ROOT_DIR/.runtime"
PID_FILE="$RUNTIME_DIR/app.pid"
LOG_FILE="$RUNTIME_DIR/app.log"
HEALTH_URL="http://127.0.0.1:${APP_PORT}/api/health"
COMMAND="${1:-up}"

mkdir -p "$RUNTIME_DIR"

log() {
  printf '[appctl] %s\n' "$1"
}

ensure_env_files() {
  if [ ! -f .env ] && [ -f .env.example ]; then
    cp .env.example .env
    log "Created .env from .env.example"
  fi

  if [ ! -f .env.local ] && [ -f .env.example ]; then
    cp .env.example .env.local
    log "Created .env.local from .env.example"
  fi
}

install_dependencies() {
  if [ -d node_modules ]; then
    return
  fi

  if [ -f package-lock.json ]; then
    log "Installing dependencies with npm ci"
    npm ci
  else
    log "Installing dependencies with npm install"
    npm install
  fi
}

load_env() {
  if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
  fi

  if [ -f .env.local ]; then
    set -a
    # shellcheck disable=SC1091
    source .env.local
    set +a
  fi
}

sqlite_db_path() {
  if [ -z "${DATABASE_URL:-}" ]; then
    return 1
  fi

  case "$DATABASE_URL" in
    file:*)
      local raw_path="${DATABASE_URL#file:}"
      if [[ "$raw_path" = /* ]]; then
        printf '%s\n' "$raw_path"
      else
        raw_path="${raw_path#./}"
        printf '%s\n' "$ROOT_DIR/prisma/$raw_path"
      fi
      ;;
    *)
      return 1
      ;;
  esac
}

bootstrap_database() {
  load_env

  local should_seed=0
  local db_path=""

  if db_path="$(sqlite_db_path 2>/dev/null)"; then
    if [ ! -f "$db_path" ]; then
      should_seed=1
    fi
  fi

  log "Syncing database schema"
  npm run db:push

  if [ "$should_seed" -eq 1 ]; then
    log "Seeding demo data for first boot"
    npm run db:seed
  fi
}

ensure_build() {
  log "Building production app"
  npm run build
}

read_pid() {
  if [ ! -f "$PID_FILE" ]; then
    return 1
  fi

  cat "$PID_FILE"
}

is_running() {
  local pid

  if ! pid="$(read_pid)"; then
    return 1
  fi

  kill -0 "$pid" >/dev/null 2>&1
}

cleanup_stale_pid() {
  if [ -f "$PID_FILE" ] && ! is_running; then
    rm -f "$PID_FILE"
  fi
}

wait_for_health() {
  local attempts=0

  while [ "$attempts" -lt 60 ]; do
    if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
      return 0
    fi

    attempts=$((attempts + 1))
    sleep 1
  done

  return 1
}

start_app() {
  cleanup_stale_pid

  if is_running; then
    log "App already running on PID $(read_pid)"
    log "Open http://${APP_HOST}:${APP_PORT}"
    return 0
  fi

  ensure_env_files
  install_dependencies
  bootstrap_database
  ensure_build

  : > "$LOG_FILE"
  log "Starting production app on http://${APP_HOST}:${APP_PORT}"
  nohup env NODE_ENV=production ./node_modules/.bin/next start --hostname "$APP_HOST" --port "$APP_PORT" \
    </dev/null >>"$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"

  if wait_for_health; then
    log "App is healthy"
    log "PID: $(read_pid)"
    log "Logs: $LOG_FILE"
    return 0
  fi

  log "Health check failed, showing recent logs"
  tail -n 80 "$LOG_FILE" || true
  stop_app
  return 1
}

stop_app() {
  cleanup_stale_pid

  if ! is_running; then
    log "App is not running"
    return 0
  fi

  local pid
  pid="$(read_pid)"
  log "Stopping app PID $pid"
  kill "$pid" >/dev/null 2>&1 || true

  local attempts=0
  while kill -0 "$pid" >/dev/null 2>&1; do
    attempts=$((attempts + 1))
    if [ "$attempts" -ge 20 ]; then
      log "Force killing app PID $pid"
      kill -9 "$pid" >/dev/null 2>&1 || true
      break
    fi
    sleep 1
  done

  rm -f "$PID_FILE"
  log "App stopped"
}

status_app() {
  cleanup_stale_pid

  if is_running; then
    log "Status: running"
    log "PID: $(read_pid)"
    log "URL: http://${APP_HOST}:${APP_PORT}"
    if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
      log "Health: ok"
    else
      log "Health: unreachable"
    fi
    return 0
  fi

  log "Status: stopped"
}

logs_app() {
  mkdir -p "$RUNTIME_DIR"
  touch "$LOG_FILE"
  tail -n 80 -f "$LOG_FILE"
}

case "$COMMAND" in
  up)
    start_app
    ;;
  down|stop)
    stop_app
    ;;
  restart)
    stop_app
    start_app
    ;;
  status)
    status_app
    ;;
  logs)
    logs_app
    ;;
  *)
    echo "Usage: bash scripts/appctl.sh {up|down|restart|status|logs}"
    exit 1
    ;;
esac
