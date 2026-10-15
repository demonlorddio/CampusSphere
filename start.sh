#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="${CAMPUSSPHERE_STATE_DIR:-$ROOT_DIR/.local}"
PID_FILE="$STATE_DIR/campussphere-dev.pid"
PORT_FILE="$STATE_DIR/campussphere-dev.port"
LOG_FILE="$STATE_DIR/campussphere-dev.log"
HOST="${CAMPUSSPHERE_HOST:-127.0.0.1}"
DISPLAY_HOST="${CAMPUSSPHERE_DISPLAY_HOST:-localhost}"
PORT="${1:-${PORT:-3000}}"

if [[ ! "$PORT" =~ ^[0-9]+$ ]] || (( PORT < 1 || PORT > 65535 )); then
  printf 'Invalid port: %s\n' "$PORT" >&2
  printf 'Usage: %s [port]\n' "$(basename "$0")" >&2
  exit 2
fi

if ! command -v npm >/dev/null 2>&1; then
  printf 'npm was not found. Install Node.js 22+ and npm, then try again.\n' >&2
  exit 1
fi

if [[ ! -d "$ROOT_DIR/node_modules" ]]; then
  printf 'Dependencies are not installed. Run "npm install" in %s first.\n' "$ROOT_DIR" >&2
  exit 1
fi

mkdir -p "$STATE_DIR"

if [[ -f "$PID_FILE" ]]; then
  existing_pid="$(<"$PID_FILE")"
  if [[ "$existing_pid" =~ ^[0-9]+$ ]] && kill -0 "$existing_pid" 2>/dev/null; then
    existing_port="$PORT"
    if [[ -f "$PORT_FILE" ]]; then
      existing_port="$(<"$PORT_FILE")"
    fi
    printf 'CampusSphere is already running (PID %s).\n' "$existing_pid"
    printf 'Open: http://%s:%s\n' "$DISPLAY_HOST" "$existing_port"
    printf 'Log:  %s\n' "$LOG_FILE"
    exit 0
  fi

  rm -f "$PID_FILE"
fi

: > "$LOG_FILE"
printf '%s\n' "$PORT" > "$PORT_FILE"

# Start a new process group so stop.sh can stop this dev server and its Next.js
# child process together without touching unrelated local processes.
if command -v setsid >/dev/null 2>&1; then
  setsid npm run dev -- --hostname "$HOST" --port "$PORT" >>"$LOG_FILE" 2>&1 &
else
  npm run dev -- --hostname "$HOST" --port "$PORT" >>"$LOG_FILE" 2>&1 &
fi
pid=$!
printf '%s\n' "$pid" > "$PID_FILE"

if ! kill -0 "$pid" 2>/dev/null; then
  rm -f "$PID_FILE"
  rm -f "$PORT_FILE"
  printf 'CampusSphere did not start. Check the log at %s\n' "$LOG_FILE" >&2
  exit 1
fi

ready=0
if command -v curl >/dev/null 2>&1; then
  for _ in {1..20}; do
    if curl --fail --silent --show-error --max-time 1 "http://$HOST:$PORT/" >/dev/null 2>&1; then
      ready=1
      break
    fi

    if ! kill -0 "$pid" 2>/dev/null; then
      rm -f "$PID_FILE"
      rm -f "$PORT_FILE"
      printf 'CampusSphere stopped during startup. Check the log at %s\n' "$LOG_FILE" >&2
      exit 1
    fi

    sleep 1
  done
fi

if (( ready == 1 )); then
  printf 'CampusSphere is running.\n'
else
  printf 'CampusSphere is starting in the background.\n'
fi
printf 'Open: http://%s:%s\n' "$DISPLAY_HOST" "$PORT"
printf 'Stop: ./stop.sh\n'
printf 'Log:  %s\n' "$LOG_FILE"
