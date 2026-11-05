#!/bin/sh
set -eu

ROOT_DIR="${ROOT_DIR:-$HOME/mountain-info.com}"
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

# Serialize cron checks so overlapping checks cannot launch duplicate backends.
exec 9> "$ROOT_DIR/backend/keepalive.lock"
flock -n 9 || exit 0

BACKEND_PIDS="$("$SCRIPT_DIR/backend-pids.sh")"
[ -z "$BACKEND_PIDS" ] || exit 0

printf '%s Backend process missing; restarting\n' "$(date '+%Y-%m-%dT%H:%M:%S%z')"
"$SCRIPT_DIR/restart-backend.sh" 9>&-
