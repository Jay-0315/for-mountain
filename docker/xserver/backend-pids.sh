#!/bin/sh
set -eu

ROOT_DIR="${ROOT_DIR:-$HOME/mountain-info.com}"
JAR_NAME="${JAR_NAME:-for-mountain-0.0.1-SNAPSHOT.jar}"

# Match the executable name first, then the exact -jar argument. A shell or
# pgrep command mentioning the JAR must never count as the running backend.
JAVA_PIDS="$(pgrep -u "$(id -u)" -x java || [ "$?" -eq 1 ])"
for backend_pid in $JAVA_PIDS; do
  [ -r "/proc/$backend_pid/cmdline" ] || continue
  if tr '\000' '\n' < "/proc/$backend_pid/cmdline" | awk \
    -v jar="$JAR_NAME" -v full_jar="$ROOT_DIR/backend/$JAR_NAME" '
      previous == "-jar" && ($0 == jar || $0 == full_jar) { found = 1 }
      { previous = $0 }
      END { exit !found }
    '; then
    printf '%s\n' "$backend_pid"
  fi
done
