# 3. Casos de uso e quando escolher Couchbase

## Quando Couchbase brilha

### 1. Perfis e sessões de usuário em alta escala

- Acesso por chave (`userId → profile`) em microssegundos.
- Documento JSON evolui com o schema da aplicação sem migration.
- Cache embutido = não precisa de Redis na frente.

**Quem usa:** LinkedIn (perfis de usuário), eBay (sessões), PayPal.

### 2. Catálogos de produtos e busca

- JSON aninhado representa naturalmente produtos com atributos variáveis.
- Full-Text Search nativo (FTS) permite busca por nome/descrição sem stack adicional.
- N1QL para filtros complexos (preço entre X e Y, com tag Z, do vendedor W).

**Quem usa:** GE Digital, Marriott (busca de hotéis).

### 3. Personalização em tempo real

- Latência sub-milissegundo permite consultar preferências do usuário a cada request.
- Eventing reage a mudanças (ex.: usuário curtiu um item → atualiza recomendações).

**Quem usa:** Comcast, Cisco (configuração de equipamentos).

### 4. Mobile / Edge / Offline-first

Único entre os NoSQL com stack completa:

```
[App mobile] — Couchbase Lite — Sync Gateway — Couchbase Server
```

Apps continuam funcionando offline e sincronizam quando voltar a rede. Inclui resolução de conflito.

**Quem usa:** United Airlines (apps de tripulação), Carnival Cruises (apps de bordo), Doctor on Demand.

### 5. IoT e telemetria

- Ingestão paralela em múltiplos nós.
- Eventing para alarmes em tempo real.
- Analytics Service para dashboards históricos sem impactar a operação.

### 6. Substituição de cache + DB tradicional

- Em vez de Redis (cache) + PostgreSQL (DB) + lógica de invalidação,
- usa-se Couchbase como **DB com cache embutido**, eliminando a camada de cache.

## Quando **não** usar Couchbase

| Cenário | Por quê | Alternativa |
|---------|---------|-------------|
| Transações ACID multi-documento complexas (banco, contabilidade) | Couchbase suporta transações multi-doc desde a 6.5, mas isso não é seu forte | PostgreSQL, Oracle |
| Modelos altamente relacionais com muitos JOINs | N1QL faz JOINs, mas a performance é melhor em SQL puro nesses casos | PostgreSQL, MySQL |
| Grafos com travessias profundas (rede social, fraude) | Modelo de grafo é mais natural | Neo4j, ArangoDB |
| Time-series puro (métricas de servidor a cada 1s) | Compressão e queries de time-series são otimizadas em DBs dedicados | InfluxDB, TimescaleDB |
| Dataset pequeno (< 10GB) em servidor único | Couchbase é overkill — vale só se já precisar dos diferenciais (FTS, mobile, etc) | SQLite, PostgreSQL |

## Caso de uso do nosso trabalho — biblioteca digital

| Operação | Por que casa com Couchbase |
|----------|---------------------------|
| Buscar livro por ISBN | Acesso KV direto, microssegundos |
| Listar livros por gênero | Index GSI + N1QL |
| Ver reviews aninhadas no livro | Subdocumento JSON — sem JOIN |
| Empréstimos com usuário e livro | N1QL JOIN entre 3 collections |
| Estatísticas (livro mais emprestado) | N1QL GROUP BY |
| Busca por título "parecido com" | FTS (não usamos no trabalho, mas dá pra mencionar) |
| App mobile do bibliotecário trabalhando offline | Couchbase Lite + Sync Gateway (idem) |

A escolha do domínio foi deliberada para mostrar que mesmo um caso "óbvio para relacional" (biblioteca) ganha vantagens com Couchbase: schema flexível para tipos de mídia futuros (audiobook, e-book com DRM, periódico), reviews como subdocumento, e potencial para o app móvel offline.

## Empresas usando Couchbase em produção

- **Tecnologia/Mídia:** LinkedIn, eBay, Marriott, Comcast, Cisco, BD (Becton Dickinson)
- **Viagem/Hospitalidade:** United Airlines, Carnival Cruises, Marriott
- **Financeiro/Gov:** PayPal, BNY Mellon
- **Varejo:** Tesco, Lord & Taylor
- **Telecom:** Verizon, Vodafone

Fonte: [couchbase.com/customers](https://www.couchbase.com/customers/)
