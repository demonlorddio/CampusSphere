#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="${CAMPUSSPHERE_STATE_DIR:-$ROOT_DIR/.local}"
PID_FILE="$STATE_DIR/campussphere-dev.pid"
PORT_FILE="$STATE_DIR/campussphere-dev.port"

if [[ ! -f "$PID_FILE" ]]; then
  printf 'CampusSphere is not running (no PID file).\n'
  exit 0
fi

pid="$(<"$PID_FILE")"
if [[ ! "$pid" =~ ^[0-9]+$ ]]; then
  printf 'The PID file is invalid; removing it.\n' >&2
  rm -f "$PID_FILE"
  rm -f "$PORT_FILE"
  exit 1
fi

if ! kill -0 "$pid" 2>/dev/null; then
  rm -f "$PID_FILE"
  rm -f "$PORT_FILE"
  printf 'CampusSphere is not running; removed a stale PID file.\n'
  exit 0
fi

command_line="$(ps -p "$pid" -o args= 2>/dev/null || true)"
if [[ "$command_line" != *"npm run dev"* && "$command_line" != *"next dev"* && "$command_line" != *"next-server"* ]]; then
  printf 'Refusing to stop PID %s because it does not look like the CampusSphere dev server.\n' "$pid" >&2
  printf 'Inspect or remove %s manually if it is stale.\n' "$PID_FILE" >&2
  exit 1
fi

process_group="$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d ' ' || true)"
if [[ "$process_group" == "$pid" ]]; then
  kill -TERM -- "-$pid" 2>/dev/null || true
else
  kill -TERM "$pid" 2>/dev/null || true
fi

for _ in {1..50}; do
  if ! kill -0 "$pid" 2>/dev/null; then
    rm -f "$PID_FILE"
    rm -f "$PORT_FILE"
    printf 'CampusSphere stopped.\n'
    exit 0
  fi
  sleep 0.1
done

if [[ "$process_group" == "$pid" ]]; then
  kill -KILL -- "-$pid" 2>/dev/null || true
else
  kill -KILL "$pid" 2>/dev/null || true
fi

rm -f "$PID_FILE"
rm -f "$PORT_FILE"
printf 'CampusSphere stopped forcefully after it did not exit cleanly.\n'
