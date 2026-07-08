#!/bin/sh
set -eu

ENABLE_HTTPS="${ENABLE_HTTPS:-true}"

if [ "${ENABLE_HTTPS}" = "true" ]; then
    DOMAIN="${DOMAIN:?La variable de entorno DOMAIN es obligatoria cuando ENABLE_HTTPS=true}"
    CERT_DIR="/etc/letsencrypt/live/${DOMAIN}"

    mkdir -p "${CERT_DIR}"
    chown -R nginx:nginx /etc/letsencrypt

    # Si Certbot todavia no emitio el certificado real (primer arranque),
    # generamos uno autofirmado temporal para que Nginx pueda arrancar.
    # Certbot lo reemplaza despues en la misma ruta.
    if [ ! -f "${CERT_DIR}/fullchain.pem" ]; then
        echo "[entrypoint] No hay certificado para ${DOMAIN}, generando uno autofirmado temporal..."
        openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
            -keyout "${CERT_DIR}/privkey.pem" \
            -out "${CERT_DIR}/fullchain.pem" \
            -subj "/CN=${DOMAIN}"
        chown nginx:nginx "${CERT_DIR}"/*.pem
    fi

    envsubst '${DOMAIN}' < /etc/nginx/templates/nginx-https.conf.template > /etc/nginx/conf.d/app.conf
else
    # Desarrollo local: sin dominio publico, sin certificado, sin redirect a
    # HTTPS (docker-compose.local.yml no publica el puerto 443 al host).
    echo "[entrypoint] ENABLE_HTTPS=false, sirviendo solo HTTP (modo local)."
    cp /etc/nginx/templates/nginx-http.conf.template /etc/nginx/conf.d/app.conf
fi

chown nginx:nginx /etc/nginx/conf.d/app.conf

# El proceso maestro arranca como root (necesario para el setup de arriba).
# La directiva "user nginx;" del nginx.conf base hace que los workers -los
# que realmente atienden trafico externo- bajen a usuario no-root via fork(),
# sin reabrir archivos y sin el problema de permisos de su-exec/gosu con
# /dev/stderr. Es el mecanismo nativo de Nginx para esto.
exec nginx -g "daemon off;"
