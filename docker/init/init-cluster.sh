#!/usr/bin/env bash
# Inicializa o cluster Couchbase, cria o bucket "biblioteca" e o usuário da aplicação.
# Pensado para rodar UMA vez logo após `docker compose up -d`.
# É idempotente: se o cluster já estiver inicializado, apenas avisa e segue.

set -euo pipefail

HOST="${COUCHBASE_HOST:-couchbase}"
ADMIN_USER="${COUCHBASE_ADMIN_USER:-Administrator}"
ADMIN_PASS="${COUCHBASE_ADMIN_PASS:-password123}"
BUCKET="${COUCHBASE_BUCKET:-biblioteca}"
BUCKET_RAM_MB="${COUCHBASE_BUCKET_RAM_MB:-256}"
APP_USER="${COUCHBASE_APP_USER:-app}"
APP_PASS="${COUCHBASE_APP_PASS:-app12345}"

CLI="/opt/couchbase/bin/couchbase-cli"

echo "==> Aguardando Couchbase responder em http://${HOST}:8091 ..."
for i in $(seq 1 60); do
  if curl -sf "http://${HOST}:8091/pools" >/dev/null; then
    echo "    OK"
    break
  fi
  sleep 2
done

# ----- 1. Inicializa cluster (se ainda não foi) -----
if curl -sf -u "${ADMIN_USER}:${ADMIN_PASS}" "http://${HOST}:8091/pools/default" \
     | grep -q '"name":"default"'; then
  echo "==> Cluster já inicializado — pulando."
else
  echo "==> Inicializando cluster..."
  "${CLI}" cluster-init \
    --cluster "${HOST}:8091" \
    --cluster-username "${ADMIN_USER}" \
    --cluster-password "${ADMIN_PASS}" \
    --services data,index,query,fts \
    --cluster-ramsize 512 \
    --cluster-index-ramsize 256 \
    --cluster-fts-ramsize 256 \
    --index-storage-setting default
fi

# ----- 2. Cria bucket -----
if "${CLI}" bucket-list -c "${HOST}:8091" \
     -u "${ADMIN_USER}" -p "${ADMIN_PASS}" 2>/dev/null \
   | grep -q "^${BUCKET}$"; then
  echo "==> Bucket '${BUCKET}' já existe — pulando."
else
  echo "==> Criando bucket '${BUCKET}'..."
  "${CLI}" bucket-create \
    -c "${HOST}:8091" \
    -u "${ADMIN_USER}" -p "${ADMIN_PASS}" \
    --bucket "${BUCKET}" \
    --bucket-type couchbase \
    --bucket-ramsize "${BUCKET_RAM_MB}" \
    --bucket-replica 0 \
    --wait
fi

# ----- 3. Cria usuário da aplicação -----
# OBS: a edição Community NÃO tem os papéis granulares (query_select, data_writer, etc).
# Usamos bucket_full_access, que cobre KV + N1QL + índices no bucket.
if "${CLI}" user-manage --list \
     -c "${HOST}:8091" \
     -u "${ADMIN_USER}" -p "${ADMIN_PASS}" 2>/dev/null \
   | grep -q "\"id\":\"${APP_USER}\""; then
  echo "==> Usuário '${APP_USER}' já existe — pulando."
else
  echo "==> Criando usuário da app '${APP_USER}'..."
  "${CLI}" user-manage \
    --set \
    -c "${HOST}:8091" \
    -u "${ADMIN_USER}" -p "${ADMIN_PASS}" \
    --rbac-username "${APP_USER}" \
    --rbac-password "${APP_PASS}" \
    --rbac-name "Aplicacao Biblioteca" \
    --roles "bucket_full_access[${BUCKET}]" \
    --auth-domain local
fi

# ----- 4. Cria índice primário para queries N1QL -----
echo "==> Criando índice primário (se necessário)..."
curl -sf -X POST "http://${HOST}:8093/query/service" \
  -u "${ADMIN_USER}:${ADMIN_PASS}" \
  -d "statement=CREATE PRIMARY INDEX IF NOT EXISTS ON \`${BUCKET}\`" \
  >/dev/null || echo "   (índice primário já existe ou criação adiada)"

# ----- 5. Cria índices secundários úteis para o trabalho -----
echo "==> Criando índices secundários..."
for stmt in \
  "CREATE INDEX IF NOT EXISTS idx_type ON \`${BUCKET}\`(type)" \
  "CREATE INDEX IF NOT EXISTS idx_book_genre ON \`${BUCKET}\`(genre) WHERE type='book'" \
  "CREATE INDEX IF NOT EXISTS idx_loan_user ON \`${BUCKET}\`(userId) WHERE type='loan'" \
  "CREATE INDEX IF NOT EXISTS idx_loan_book ON \`${BUCKET}\`(bookId) WHERE type='loan'"
do
  curl -sf -X POST "http://${HOST}:8093/query/service" \
    -u "${ADMIN_USER}:${ADMIN_PASS}" \
    --data-urlencode "statement=${stmt}" \
    >/dev/null || echo "   aviso: índice falhou — '${stmt}'"
done

echo ""
echo "================================================================"
echo " Couchbase pronto!"
echo "   Web Console : http://localhost:8091"
echo "   Admin       : ${ADMIN_USER} / ${ADMIN_PASS}"
echo "   App user    : ${APP_USER} / ${APP_PASS}"
echo "   Bucket      : ${BUCKET}"
echo "================================================================"
