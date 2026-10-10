#!/bin/sh
set -eu

if [ "${ABX_PROCESS:-web}" = "websocket" ]; then
    exec php artisan reverb:start --host="${REVERB_SERVER_HOST:-0.0.0.0}" --port="${PORT:-${REVERB_SERVER_PORT:-8080}}"
fi

exec frankenphp run --config /etc/caddy/Caddyfile
