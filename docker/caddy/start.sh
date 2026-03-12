#!/bin/sh
set -eu

CONFIG_PATH="/etc/caddy/Caddyfile"

if [ -n "${SITE_DOMAIN:-}" ]; then
cat > "$CONFIG_PATH" <<EOF
${SITE_DOMAIN} {
    tls ${ACME_EMAIL}
    encode gzip zstd

    reverse_proxy frontend:3000
}
EOF
else
    cp /etc/caddy/Caddyfile.template "$CONFIG_PATH"
fi

exec caddy run --config "$CONFIG_PATH" --adapter caddyfile
