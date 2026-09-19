#!/usr/bin/env bash
# Confere rotas, cabeçalhos e cache do site publicado.
# Uso: ./verificar-site.sh https://main.d1abc2def3.amplifyapp.com
#      ./verificar-site.sh https://awsstudentcommunitydays.com.br
set -uo pipefail
BASE="${1:?informe a URL base, sem barra no fim}"
FILTRO='^(HTTP/|location|cache-control|content-encoding|content-type|etag|strict-transport-security|x-content-type-options|referrer-policy|x-frame-options|content-security-policy|permissions-policy):'

echo "### 1. Status e cabeçalhos por rota"
for p in "/" "/belo-horizonte/" "/belo-horizonte" \
         "/styles.css" "/comum.js" "/edicao.js" "/dados.js" "/brasil-mapa.js" \
         "/sitemap.xml" "/robots.txt" "/nao-existe-mesmo"; do
  echo "--- ${BASE}${p}"
  curl -sSI -H 'Accept-Encoding: br,gzip' "${BASE}${p}" | grep -iE "$FILTRO" || echo "  (sem cabeçalhos esperados)"
done

echo
echo "### 2. O que tem que acontecer"
cat <<'ESPERADO'
  /                     -> 200
  /belo-horizonte/      -> 200   (URL limpa servindo belo-horizonte/index.html)
  /belo-horizonte       -> 301 ou 200 (o Amplify normaliza sozinho)
  /styles.css /comum.js /edicao.js /dados.js /brasil-mapa.js -> 200
      Se algum destes virar 404, a regra catch-all está disparando cedo demais.
  /sitemap.xml /robots.txt -> 200
  /nao-existe-mesmo     -> 404 servindo o conteúdo de /404.html
  Em todos: Cache-Control, HSTS, CSP e X-Content-Type-Options presentes.
  HTML/CSS/JS: Content-Encoding br ou gzip.
ESPERADO

echo
echo "### 3. Revalidação condicional (tem que dar 304)"
ETAG=$(curl -sSI "${BASE}/styles.css" | awk -F': ' 'tolower($1)=="etag"{print $2}' | tr -d '\r')
if [ -n "${ETAG}" ]; then
  curl -sS -o /dev/null -w '  styles.css com If-None-Match -> HTTP %{http_code}\n' \
    -H "If-None-Match: ${ETAG}" "${BASE}/styles.css"
else
  echo "  AVISO: /styles.css não devolveu ETag. Sem ETag, 'max-age=0, must-revalidate'"
  echo "  baixa o arquivo inteiro a cada visita em vez de um 304 barato."
fi

echo
echo "### 4. CSP — abra o site no navegador com o DevTools Console aberto."
echo "    A CSP deste projeto é estrita: NÃO tem 'unsafe-inline'."
echo "    Qualquer <script> inline novo será bloqueado e a página quebra."
echo "    Procure por 'Refused to ... Content Security Policy'."
