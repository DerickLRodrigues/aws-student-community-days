#!/usr/bin/env bash
# Verifica a delegação de DNS e o domínio no Amplify.
# Uso: ./verificar-dns.sh [dominio] [amplify-app-id]
set -uo pipefail
DOMINIO="${1:-awsstudentcommunitydays.com.br}"
APP_ID="${2:-}"

echo "=== ${DOMINIO} ==="

echo
echo "--- 1. NS publicados pelo .br ---"
dig +noall +authority +answer NS "${DOMINIO}" @a.dns.br

echo
echo "--- 2. NS vistos por um resolver público ---"
dig NS "${DOMINIO}" +short @8.8.8.8

echo
echo "--- 3. DNSSEC (registro DS no pai) ---"
DS=$(dig DS "${DOMINIO}" +short @a.dns.br)
if [ -n "${DS}" ]; then
  echo "${DS}"
  echo ">> ATENÇÃO: existe DS publicado. Com a zona no Route 53 SEM DNSSEC"
  echo ">> assinado, todo resolver validante devolve SERVFAIL e o domínio"
  echo ">> some da internet. Remova o DS no Registro.br antes de delegar."
else
  echo "(nenhum DS — ok para Route 53 sem DNSSEC)"
fi

echo
echo "--- 4. Apex: tem que ser A (registro ALIAS) ---"
dig A "${DOMINIO}" +short @8.8.8.8

echo
echo "--- 5. www ---"
dig CNAME "www.${DOMINIO}" +short @8.8.8.8

echo
echo "--- 6. MX e SPF (precisam sobreviver à migração) ---"
dig MX "${DOMINIO}" +short @8.8.8.8
dig TXT "${DOMINIO}" +short @8.8.8.8

echo
echo "--- 7. HTTPS ---"
for host in "${DOMINIO}" "www.${DOMINIO}"; do
  code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "https://${host}/" 2>/dev/null || echo "ERRO")
  echo "https://${host}/ -> ${code}"
done
echo "(depois do redirect configurado, www deve dar 301, não 200)"

echo
echo "--- 8. Certificado TLS ---"
echo | openssl s_client -connect "${DOMINIO}:443" -servername "${DOMINIO}" 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates 2>/dev/null \
  || echo "(handshake TLS ainda não completa)"

if [ -n "${APP_ID}" ]; then
  echo
  echo "--- 9. Status do domínio no Amplify ---"
  aws amplify get-domain-association --app-id "${APP_ID}" --domain-name "${DOMINIO}" \
    --query 'domainAssociation.{status:domainStatus,motivo:statusReason}' --output table
fi
