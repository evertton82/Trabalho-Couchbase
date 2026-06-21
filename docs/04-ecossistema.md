# 4. Ecossistema, ferramentas de gerenciamento e SDKs

## Produtos principais

| Produto | Para que serve |
|---------|----------------|
| **Couchbase Server** | O banco propriamente dito. Versões **Community** (gratuita, open source) e **Enterprise** (paga, com FTS avançado, XDCR, Eventing, etc) |
| **Couchbase Capella** | Versão DBaaS (Database as a Service) gerenciada pela própria Couchbase, roda na AWS/GCP/Azure |
| **Couchbase Lite** | Banco embarcado para mobile (iOS, Android), desktop (Windows, macOS, Linux) e IoT |
| **Sync Gateway** | Ponte entre Couchbase Lite e Couchbase Server. Lida com sync, resolução de conflito e autenticação |
| **Couchbase Mobile** | Termo guarda-chuva = Lite + Sync Gateway |

Para este trabalho usamos **Couchbase Server Community 7.6** em container.

## Ferramentas de gerenciamento

### Couchbase Web Console (interface web)

URL padrão: <http://localhost:8091>

Telas principais:
- **Dashboard** — saúde do cluster, métricas em tempo real
- **Buckets** — criar/configurar buckets, scopes, collections
- **Documents** — navegar e editar documentos JSON manualmente
- **Query Workbench** — executar N1QL/SQL++ com syntax highlighting
- **Indexes** — gerenciar índices GSI
- **Search** — criar índices FTS
- **Security** — usuários, papéis (RBAC) e auditoria
- **XDCR** — replicação entre clusters
- **Settings** — auto-failover, alertas, e-mail, logs

### CLI

| Ferramenta | Para que serve |
|------------|----------------|
| `couchbase-cli` | Administração do cluster (criar bucket, adicionar nó, failover) |
| `cbq` | Shell interativo de N1QL/SQL++ (estilo `psql` / `mongosh`) |
| `cbbackupmgr` | Backup e restore |
| `cbimport` / `cbexport` | Import/export de CSV e JSON |
| `cbcollect_info` | Coleta diagnóstico para suporte |
| `cbstats` | Estatísticas detalhadas dos buckets |

Exemplo de uso do `cbq` (que vamos demonstrar):

```bash
docker exec -it couchbase cbq -u Administrator -p password123
> SELECT title FROM `biblioteca`.`_default`.`books` LIMIT 3;
```

## SDKs oficiais

| Linguagem | Pacote |
|-----------|--------|
| Node.js | `couchbase` (npm) |
| Python | `couchbase` (pip) |
| Java | `com.couchbase.client:java-client` |
| .NET | `CouchbaseNetClient` |
| Go | `github.com/couchbase/gocb/v2` |
| PHP | `couchbase` (pecl) |
| Ruby | `couchbase` (gem) |
| C / C++ | `libcouchbase` |
| Kotlin / Scala | wrappers sobre o Java SDK |

**Nosso trabalho usa o SDK Node.js** (`couchbase`).

Padrão das APIs (independente de linguagem):

- **Cluster** → conexão com o cluster
- **Bucket** → escopo de dados
- **Scope / Collection** → sub-divisões lógicas
- **`cluster.query(...)`** → executa N1QL
- **`collection.get(key)`** / **`collection.upsert(key, doc)`** → KV ops
- **`collection.lookupIn(...)`** → leitura parcial de subdocumento (sub-doc API)
- **`collection.mutateIn(...)`** → modificação parcial de subdocumento

## Integrações relevantes

- **Kafka** — Couchbase Kafka Connector (source e sink)
- **Spark** — Couchbase Spark Connector
- **Elasticsearch** — conector para replicar dados ao ES
- **Tableau, Power BI** — driver ODBC
- **Prometheus / Grafana** — exporter nativo de métricas
- **Kubernetes** — Couchbase Autonomous Operator (gerencia cluster declarativamente)

## Versionamento e licenciamento

- **Community Edition (CE):** gratuita, releases ~1× por ano, sem suporte oficial, sem FTS avançado, sem XDCR, sem RBAC granular, sem Eventing/Analytics.
- **Enterprise Edition (EE):** licença comercial, releases trimestrais, suporte oficial, recursos completos.
- **Capella:** modelo pay-as-you-go gerenciado.

**Atenção (mudança recente):** desde a 7.6 a Community Edition tem mais limitações que antes (ex.: número máximo de nós no cluster). Para o trabalho — single-node em Docker — isso não impacta nada.

## Recursos para estudo

- Documentação oficial: <https://docs.couchbase.com>
- Tutoriais: <https://developer.couchbase.com>
- Playground N1QL: <https://query-tutorial.couchbase.com>
- Curso gratuito: Couchbase Academy — <https://learn.couchbase.com>
- GitHub: <https://github.com/couchbase>
