# 5. Comparativo: Couchbase vs outros NoSQL

Tabela rápida para mostrar como Couchbase se posiciona frente aos principais NoSQL — útil se o professor perguntar "por que Couchbase em vez de MongoDB/Redis/Cassandra?".

## Visão geral

| Banco | Modelo | CAP típico | Linguagem de query | Forte em | Fraco em |
|-------|--------|------------|-------------------|----------|----------|
| **Couchbase** | Multimodelo (doc + KV + busca + analítico) | CP (cluster) / AP (XDCR) | N1QL/SQL++ | Multi-modelo num só, mobile sync, baixa latência KV+query | Setup inicial mais complexo, CE com mais limites |
| **MongoDB** | Documento | CP (com replica set) | MQL (`find`, `aggregate`) | Maior comunidade, schema flexível, ecossistema enorme | Menos performante em KV puro, sem cache embutido |
| **Redis** | Chave-valor (com estruturas) | AP / CP (com Sentinel) | Comandos próprios | Latência mínima, estruturas ricas (lista, set, stream) | Não é um DB persistente "primário" tradicional, pouco JOIN |
| **Cassandra** | Wide-column | AP | CQL (SQL-like) | Escrita massiva, multi-DC nativo, escala linear | Queries limitadas (precisa modelar para o read pattern), sem JOIN |
| **DynamoDB** | KV + doc (gerenciado AWS) | CP/AP configurável | API própria + PartiQL | Totalmente gerenciado, escala automática | Vendor lock-in, custo cresce com escala |
| **Neo4j** | Grafo | CP | Cypher | Relacionamentos profundos, padrões grafo | Volume muito alto / casos não-grafo |

## Couchbase vs MongoDB (comparação direta — a mais comum)

| Aspecto | Couchbase | MongoDB |
|---------|-----------|---------|
| Linguagem de query | N1QL/SQL++ (sintaxe SQL) | MQL (`find()`, `aggregate([...])`) |
| Cache | Embutido, memory-first | Externo (ex.: Redis) ou WiredTiger cache |
| Mobile/Offline | Couchbase Lite + Sync Gateway (oficial) | Realm (após aquisição) |
| Indexação | GSI + memory-optimized indexes | B-tree / hashed |
| Transações multi-doc | Sim (desde 6.5) | Sim (desde 4.0) |
| Full-text search | FTS nativo | Atlas Search (cloud) ou integração externa |
| Hierarquia de dados | Cluster > Bucket > Scope > Collection | Cluster > Database > Collection |
| Modelo CAP | CP (intra-cluster), AP (XDCR) | CP (replica set) |
| Licença CE | Apache 2.0 (gratuito) | SSPL (não é OSI-aprovado) |

## Quando escolher cada um (resumo prático)

- **MongoDB** → equipe nova, comunidade grande importa, prototipagem rápida.
- **Couchbase** → precisa de KV super rápido + query SQL-like + cache + mobile, tudo num só produto.
- **Redis** → cache, fila, contadores, leaderboards, sessões.
- **Cassandra** → escrita massiva multi-datacenter (telemetria, logs).
- **DynamoDB** → você já está na AWS e quer zero ops.
- **Neo4j** → relacionamentos são o ponto central do problema.

## Argumento para o nosso trabalho

> "Escolhemos Couchbase porque é um caso interessante de NoSQL **multimodelo**: ele permite mostrar tanto o paradigma documento quanto o KV num só sistema, suporta N1QL (que torna queries familiares para quem vem do SQL) e oferece operadores equivalentes a todos os exigidos no enunciado (`$match`, `$project`, `$lookup`, `$unwind`, `$group`) via uma sintaxe consistente."
