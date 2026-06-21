# 2. Arquitetura e classificação no Teorema CAP

## Lembrando o teorema CAP

Brewer (2000) afirma que um sistema distribuído só pode garantir **2 das 3** propriedades a seguir na presença de uma partição de rede:

- **C — Consistency (Consistência):** toda leitura retorna a escrita mais recente.
- **A — Availability (Disponibilidade):** todo request recebe uma resposta (sem erro), mesmo durante falhas.
- **P — Partition Tolerance (Tolerância a partições):** o sistema continua operando apesar de mensagens perdidas entre nós.

Como partições de rede são inevitáveis em sistemas distribuídos reais, a escolha real é entre **CP** (consistência) e **AP** (disponibilidade).

## Onde Couchbase se encaixa

Couchbase é geralmente classificado como **CP** dentro de um cluster único, com fortes garantias de consistência por documento (cada documento tem um nó "ativo" que serializa as escritas). Ao mesmo tempo, oferece configurações que o aproximam de **AP** quando se ativa replicação entre datacenters (XDCR).

### Cluster local (single-cluster)

- **Strong consistency por chave:** toda operação KV em um documento passa pelo nó ativo (active vBucket) daquele documento, garantindo leituras consistentes.
- **Auto-failover:** se um nó cai, suas vBuckets ativas são promovidas a partir dos réplicas (replica vBuckets). Durante o failover há uma janela curta de indisponibilidade — é o preço pago para manter consistência.
- **Durabilidade configurável por operação:**
  - `none` — escreve só na RAM do nó ativo
  - `majority` — espera replicação para a maioria dos réplicas
  - `majorityAndPersistToActive` — maioria + persistido em disco no ativo
  - `persistToMajority` — persistido em disco na maioria dos nós

  Isso permite escolher o trade-off CAP **por operação**, não pelo cluster inteiro.

### Multi-cluster (XDCR)

- **XDCR** replica dados entre clusters de datacenters distintos de forma **assíncrona** e **eventually consistent**.
- Nessa topologia, Couchbase se aproxima de **AP**: cada cluster permanece disponível mesmo se a comunicação inter-DC cair, e converge depois.

## Resumo prático

| Cenário | Classificação |
|---------|---------------|
| Cluster único, durabilidade `majority` ou maior | **CP** |
| Cluster único, durabilidade `none` | mais próximo de AP (escritas confirmadas antes da replicação) |
| Multi-DC com XDCR | **AP** entre DCs, **CP** dentro de cada DC |

> Para o trabalho diremos: **Couchbase é primariamente CP em cluster único, com flexibilidade para AP via XDCR e durabilidade ajustável por operação.**

## Arquitetura interna — serviços do Couchbase

Cada nó do cluster pode rodar um ou mais dos seguintes **serviços** (separação de cargas):

| Serviço | Função |
|---------|--------|
| **Data Service** | Armazena e serve os documentos JSON / KV (sempre presente) |
| **Query Service** | Executa queries N1QL/SQL++ |
| **Index Service** | Mantém índices secundários (GSI — Global Secondary Indexes) |
| **Search Service** | Full-Text Search (FTS) |
| **Analytics Service** | OLAP / queries analíticas em paralelo |
| **Eventing Service** | Funções JavaScript reativas a mudanças em documentos |
| **Backup Service** | Agenda e executa backups |

Para o nosso setup (Docker single-node), todos os serviços rodam no mesmo container.

## vBuckets — particionamento físico

- Cada bucket é internamente dividido em **1024 vBuckets** (partições virtuais).
- Cada vBucket tem **1 ativo** + **0..N réplicas** (configurável, geralmente 1).
- O cluster distribui as vBuckets entre os nós; quando um nó cai, as réplicas viram ativas.
- O cliente (SDK) sabe exatamente em qual nó está cada vBucket, então não há proxy/coordenador — vai direto no nó certo. Isso explica as **latências de microssegundos** para acesso KV.

## Consistência de queries N1QL — `scan_consistency`

Queries N1QL podem ler de índices GSI, que são atualizados de forma assíncrona em relação ao dado. O SDK permite escolher:

| Modo | Comportamento |
|------|---------------|
| `not_bounded` (default) | Lê do índice como está agora — pode estar atrás (eventual consistency, mais rápido) |
| `request_plus` | Espera o índice incorporar todas as mutações até o momento do request — consistência forte |
| `at_plus` | Espera até um token específico de mutação — controle fino |

Outro exemplo de "consistência configurável" — você escolhe o trade-off por query.
