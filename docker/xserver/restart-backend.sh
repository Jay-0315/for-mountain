#!/bin/sh
set -eu

ROOT_DIR="$HOME/mountain-info.com"
BACKEND_DIR="$ROOT_DIR/backend"
ENV_FILE="$ROOT_DIR/.env"
JAVA_BIN="$HOME/jdk-17.0.10+7/bin/java"
JAR_NAME="for-mountain-0.0.1-SNAPSHOT.jar"
LOG_FILE="$BACKEND_DIR/nohup.out"

cd "$ROOT_DIR"

if [ -f "$ENV_FILE" ]; then
  set -a
  . "$ENV_FILE"
  set +a
fi

OLD_PIDS="$("$ROOT_DIR/script/backend-pids.sh")"
if [ -n "${OLD_PIDS:-}" ]; then
  printf "%s\n" "$OLD_PIDS" | xargs kill || true
  sleep 3
  LEFT_PIDS="$("$ROOT_DIR/script/backend-pids.sh")"
  if [ -n "${LEFT_PIDS:-}" ]; then
    printf "%s\n" "$LEFT_PIDS" | xargs kill -9 || true
    sleep 1
  fi
fi

cd "$BACKEND_DIR"
nohup "$JAVA_BIN" -Dspring.profiles.active=prod -Xms96m -Xmx224m -XX:MaxMetaspaceSize=128m -XX:ReservedCodeCacheSize=48m -Xss512k -XX:+UseSerialGC -jar "$JAR_NAME" > "$LOG_FILE" 2>&1 &
sleep 5

ps -u "$USER" -o pid=,args= | awk -v jar="$JAR_NAME" '/java/ && index($0, jar) { print }' || true
tail -n 30 "$LOG_FILE"
