# Docker — setup do Couchbase

Sobe um Couchbase Server Community 7.6 single-node, inicializa cluster, bucket, usuário da aplicação e índices.

## Pré-requisitos

- Docker Desktop (Windows/Mac) ou Docker Engine (Linux) — versão recente
- ~2 GB de RAM livres
- Portas livres na máquina host: `8091–8096`, `11210`, `11211`, `18091`, `18093`

## Subir tudo

```powershell
# a partir de docker/
docker compose up -d

# inicializa cluster + bucket + user + índices (idempotente, pode rodar várias vezes)
docker compose --profile setup run --rm init
```

> O `--profile setup` é para o serviço `init` rodar **só quando explicitamente pedido**, não toda vez que `docker compose up` for chamado.

Após isso:

- Web Console: <http://localhost:8091>
- Admin: `Administrator` / `password123`
- Usuário da app: `app` / `app12345`
- Bucket: `biblioteca`

## Verificar se está OK

```powershell
docker compose ps
docker compose logs couchbase --tail 50
curl http://localhost:8091/pools
```

A resposta do `curl` deve ser um JSON com `"isAdminCreds":true` (ou similar).

## Parar / limpar

```powershell
# parar (mantém os dados)
docker compose down

# parar e APAGAR dados (volume incluso)
docker compose down -v
```

## Acessar o shell N1QL (`cbq`) dentro do container

Útil para a apresentação — dá para mostrar queries ao vivo.

```powershell
docker exec -it couchbase cbq -u Administrator -p password123
```

E dentro do shell:

```sql
\connect http://localhost:8091;
SELECT title FROM `biblioteca`.`_default`.`books` LIMIT 5;
```

## Troubleshooting

### `Connection refused` / `connect ECONNREFUSED`

O Couchbase demora ~30s pra ficar pronto na primeira vez. Aguarde e tente de novo, ou veja `docker compose logs couchbase`.

### `Address already in use` na porta 8091

Outro serviço está usando a porta. Mate-o, ou edite o `docker-compose.yml` para mapear `"8191:8091"` por exemplo.

### "Cluster initialization failed"

Normalmente é falta de RAM. Aumente o limite do Docker Desktop (Settings → Resources) para pelo menos 4 GB.

### `init-cluster.sh: permission denied`

Em Windows, o `bash` dentro do container já tem permissão. Se você editou o arquivo num editor que mudou o line-ending para CRLF, converta para LF:

```powershell
# converte CRLF -> LF
$content = Get-Content -Raw .\init\init-cluster.sh
[IO.File]::WriteAllText("$pwd\init\init-cluster.sh", ($content -replace "`r`n","`n"))
```

### Resetar tudo do zero

```powershell
docker compose down -v
docker compose up -d
docker compose --profile setup run --rm init
```
