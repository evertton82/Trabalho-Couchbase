# Roteiro de apresentação — Couchbase

> Tempo alvo: **15-20 minutos** + 5 de Q&A. Ajustar pelo que o professor pedir no dia.

## Divisão de fala

| Bloco | Quem | Duração |
|-------|------|---------|
| 1. Abertura e contexto | Éverton | 1 min |
| 2. Conceitos e classificação | Éverton | 3 min |
| 3. CAP e arquitetura | Éverton | 2 min |
| 4. Casos de uso | Pedro | 3 min |
| 5. Ecossistema e ferramentas | Pedro | 2 min |
| 6. Demo prática (Docker + CRUD) | Éverton conduz, Pedro narra | 5-6 min |
| 7. Encerramento | Pedro | 1 min |
| 8. Q&A | Ambos | 5 min |

---

## 1. Abertura (Éverton — 1 min)

> "Boa noite. Nosso trabalho é sobre **Couchbase**, um banco NoSQL multimodelo de alta performance. Vou começar pelos conceitos e o Pedro complementa com casos de uso e ecossistema; depois fazemos uma demo ao vivo com CRUD e os operadores de query que o enunciado pede."

- Slide com o nome do grupo, banco escolhido e o que será apresentado.

## 2. Conceitos (Éverton — 3 min)

Pontos a martelar:

- **NoSQL multimodelo:** documento + chave-valor + busca + analítico no mesmo produto.
- Origem: fusão Membase + CouchDB (2011).
- Hierarquia: **Cluster → Bucket → Scope → Collection → Documento JSON**.
- Cada documento tem uma **chave** + **conteúdo JSON arbitrário**.
- Mostrar um documento exemplo (book::001) — destacar **array** de autores/tags e **subdocumento** reviews.
- **N1QL / SQL++** = SQL para JSON. Sintaxe familiar, recursos modernos (UNNEST, JOIN, NEST).

> Apoio: [docs/01-conceitos-couchbase.md](../docs/01-conceitos-couchbase.md)

## 3. CAP + arquitetura (Éverton — 2 min)

- **CP** dentro do cluster (consistência forte por documento via active vBucket).
- **AP** entre clusters via XDCR.
- **Durabilidade configurável por operação** — pode escolher `none` até `persistToMajority`.
- **vBuckets** (1024 por bucket) explicam latência microssegundos.
- **Serviços separáveis por nó** (Data, Query, Index, FTS, Analytics, Eventing).

> Apoio: [docs/02-arquitetura-cap.md](../docs/02-arquitetura-cap.md)

## 4. Casos de uso (Pedro — 3 min)

Falar dos cenários onde Couchbase brilha — e onde **não** se usa:

- Perfis/sessões em alta escala (LinkedIn, eBay)
- Catálogos com busca (Marriott — hotéis)
- Personalização em tempo real
- **Mobile/offline** com Couchbase Lite + Sync Gateway (United, Carnival)
- Quando **não** usar: transações ACID multi-doc pesadas, modelos profundamente relacionais, grafos (Neo4j).
- Por que escolhemos para o nosso domínio (biblioteca): arrays, subdocs e joins exercitados naturalmente.

> Apoio: [docs/03-casos-de-uso.md](../docs/03-casos-de-uso.md)

## 5. Ecossistema (Pedro — 2 min)

- Couchbase Server (Community vs Enterprise vs Capella).
- Couchbase Lite + Sync Gateway (mobile).
- Web Console — abrir e mostrar rapidíssimo.
- SDKs em Node, Python, Java, Go, .NET — usamos **Node.js**.
- CLI: `cbq` (shell N1QL), `couchbase-cli`, `cbimport`/`cbexport`.

> Apoio: [docs/04-ecossistema.md](../docs/04-ecossistema.md)

## 6. Demo ao vivo (Éverton conduz, Pedro narra — 5-6 min)

**Roteiro exato — ler de cima para baixo:**

1. **Mostrar o Couchbase rodando:**
   ```powershell
   docker compose ps
   ```
   Abrir <http://localhost:8091> no navegador → mostrar o Dashboard, ir em **Documents** e abrir `book::001` para mostrar o JSON com array+subdoc.

2. **Mostrar o seed:**
   ```powershell
   cd app
   npm run seed
   ```
   (saída: ~6 livros, 4 usuários, 5 empréstimos)

3. **Rodar a demo completa:**
   ```powershell
   npm run demo
   ```
   Enquanto roda, **o Pedro vai narrando** cada seção (1 = KV, 2 = FIND, 3 = $match+$project, ..., 9 = pipeline completo).

4. **(Opcional, se sobrar tempo)** Abrir o **Query Workbench** no console (porta 8091, aba Query) e digitar ao vivo:
   ```sql
   SELECT b.title, AVG(r.rating) AS notaMedia
   FROM `biblioteca`.`_default`.`_default` b
   UNNEST b.reviews r
   WHERE b.type = "book"
   GROUP BY b.title
   ORDER BY notaMedia DESC;
   ```
   Mostra que dá pra explorar a base ad-hoc.

## 7. Encerramento (Pedro — 1 min)

Recapitular:
- O que vimos: multimodelo, CAP=CP/AP-configurável, ecossistema completo.
- Operadores demonstrados: `find`, `$match`, `$project`, `$group`, `$lookup` (JOIN), `$unwind` (UNNEST), arrays, subdocs.
- Conclusão honesta: Couchbase é poderoso em casos específicos (multi-modelo, mobile, KV+query), mas tem curva de adoção maior que MongoDB.

## 8. Q&A

Perguntas prováveis (e respostas curtas):

| Pergunta | Resposta |
|----------|----------|
| Por que não escolheram MongoDB? | Ambos atendem; Couchbase mostra um caso mais raro de multi-modelo + mobile sync nativo. |
| Como Couchbase escala? | Adição de nós sem downtime, rebalanceamento automático das vBuckets. |
| E se quebrar um nó? | Auto-failover promove réplicas; janela curta de indisponibilidade — trade-off do CP. |
| Em produção, Community ou Enterprise? | Community pra estudo; Enterprise pra produção (RBAC granular, XDCR, FTS avançado). |
| Quanta RAM precisa? | Documentos quentes ficam todos em RAM — dimensione por working set, não por total. |

---

## Checklist 30 min antes da apresentação

- [ ] Couchbase está rodando? (`docker compose ps`)
- [ ] Seed foi executado? (`npm run seed`)
- [ ] `npm run demo` foi testado e está sem erro?
- [ ] Web Console abre no <http://localhost:8091>?
- [ ] Slides estão no PowerPoint/Google Slides com a sequência acima?
- [ ] Pen drive ou Google Drive com cópia dos slides + repositório zipado?
- [ ] Adaptador HDMI/USB-C se precisar?
- [ ] Internet **não** é requisito (tudo roda local — bom argumento se a wifi da sala falhar).
