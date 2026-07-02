#!/usr/bin/env bash
set -euo pipefail

output="$1"
mkdir -p "$(dirname "$output")"

set +o pipefail
pid="$(
  ps -axo pid=,command= |
    awk '/Google Chrome for Testing --user-data-dir=.*remote-debugging-port=6664/ && $0 !~ /Helper/ {print $1; exit}'
)"
set -o pipefail

if [ -z "$pid" ]; then
  echo "No Chrome for Testing browser PID found for CDP port 6664" >&2
  exit 1
fi

rm -f "$output"
capture-helper snapshot --pid "$pid" --output "$output" &
capture_pid=$!

for _ in $(seq 1 80); do
  if [ -s "$output" ]; then
    kill "$capture_pid" 2>/dev/null || true
    wait "$capture_pid" 2>/dev/null || true
    echo "Captured $output via capture-helper pid $pid"
    exit 0
  fi
  sleep 0.1
done

kill "$capture_pid" 2>/dev/null || true
wait "$capture_pid" 2>/dev/null || true

echo "capture-helper did not produce $output" >&2
exit 1
