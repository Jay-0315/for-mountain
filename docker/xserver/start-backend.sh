#!/bin/sh
set -eu

ROOT_DIR="${ROOT_DIR:-$HOME/mountain-info.com}"
BACKEND_DIR="$ROOT_DIR/backend"
ENV_FILE="$ROOT_DIR/.env"
JAVA_BIN="${JAVA_BIN:-$HOME/jdk-17.0.10+7/bin/java}"
JAR_NAME="${JAR_NAME:-for-mountain-0.0.1-SNAPSHOT.jar}"
PID_FILE="$BACKEND_DIR/backend.pid"
LOG_FILE="$BACKEND_DIR/nohup.out"

cd "$BACKEND_DIR"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

if [ -f "$PID_FILE" ]; then
  OLD_PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    kill "$OLD_PID" 2>/dev/null || true
    sleep 2
    if kill -0 "$OLD_PID" 2>/dev/null; then
      kill -9 "$OLD_PID" 2>/dev/null || true
    fi
  fi
  rm -f "$PID_FILE"
fi

nohup "$JAVA_BIN" -Xms128M -Xmx256M -jar "$JAR_NAME" > "$LOG_FILE" 2>&1 &
NEW_PID=$!
echo "$NEW_PID" > "$PID_FILE"

echo "Backend started with PID $NEW_PID on port 8081"
