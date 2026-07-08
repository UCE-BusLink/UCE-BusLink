#!/bin/sh
set -eu

ENABLE_HTTPS="${ENABLE_HTTPS:-true}"

if [ "${ENABLE_HTTPS}" = "true" ]; then
    DOMAIN="${DOMAIN:?DOMAIN is required when ENABLE_HTTPS=true}"
    CERT_DIR="/etc/letsencrypt/live/${DOMAIN}"

    mkdir -p "${CERT_DIR}"
    chown -R nginx:nginx /etc/letsencrypt

    # Bootstrap self-signed cert until Certbot issues the real one
    if [ ! -f "${CERT_DIR}/fullchain.pem" ]; then
        echo "[entrypoint] No cert for ${DOMAIN}, generating temporary self-signed one..."
        openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
            -keyout "${CERT_DIR}/privkey.pem" \
            -out "${CERT_DIR}/fullchain.pem" \
            -subj "/CN=${DOMAIN}"
        chown nginx:nginx "${CERT_DIR}"/*.pem
    fi

    envsubst '${DOMAIN}' < /etc/nginx/templates/nginx-https.conf.template > /etc/nginx/conf.d/app.conf
else
    # Local dev: no domain, no cert, no HTTPS redirect
    echo "[entrypoint] ENABLE_HTTPS=false, serving HTTP only."
    cp /etc/nginx/templates/nginx-http.conf.template /etc/nginx/conf.d/app.conf
fi

chown nginx:nginx /etc/nginx/conf.d/app.conf

exec nginx -g "daemon off;"
