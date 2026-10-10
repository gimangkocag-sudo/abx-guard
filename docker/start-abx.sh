#!/bin/sh
set -eu

if [ "${ABX_PROCESS:-web}" = "websocket" ]; then
    # Reverb reads its restart marker through Laravel's cache during startup.
    # Keep this process off the database cache so a missing DB_* setting cannot
    # make the WebSocket service fall back to SQLite inside the container.
    export CACHE_STORE=file
    exec php artisan reverb:start --host="${REVERB_SERVER_HOST:-0.0.0.0}" --port="${PORT:-${REVERB_SERVER_PORT:-8080}}"
fi

exec frankenphp run --config /etc/caddy/Caddyfile
