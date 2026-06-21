# 1. Conceitos do Couchbase

## O que é

**Couchbase** é um banco de dados NoSQL **distribuído**, **multimodelo** e de **alto desempenho**, projetado para aplicações modernas que exigem baixa latência e escala horizontal. Foi criado em 2011 da fusão entre os projetos **Membase** (key-value) e **CouchDB** (document-oriented), unindo o melhor dos dois mundos.

## Tipo de banco — classificação

Couchbase é classificado como **multimodelo**, atendendo simultaneamente a vários paradigmas NoSQL:

| Modelo | Como o Couchbase atende |
|--------|------------------------|
| **Documento (JSON)** | Documentos JSON arbitrários armazenados em buckets/scopes/collections |
| **Chave-valor** | Toda operação básica é, na prática, `key → document` com latência de microssegundos |
| **Cache distribuído** | Camada de cache em memória embutida (substitui Redis/Memcached em muitos casos) |
| **Busca textual** | Full-Text Search (FTS) nativo, similar ao Elasticsearch |
| **Analítico** | Couchbase Analytics Service para queries OLAP em paralelo |
| **Eventing** | Funções JavaScript reativas a mudanças em documentos |

Para esse trabalho focamos no **modelo documento** com queries via **N1QL** (SQL para JSON, hoje chamado de SQL++).

## Hierarquia de dados

```
Cluster
└── Bucket               (equivalente a um "database")
    └── Scope            (equivalente a um "schema")
        └── Collection   (equivalente a uma "tabela")
            └── Document (JSON, identificado por chave única)
```

No nosso projeto usamos:

```
Cluster: couchbase
└── Bucket: biblioteca
    └── Scope: _default
        ├── Collection: books
        ├── Collection: users
        └── Collection: loans
```

## Documento JSON — exemplo

Um livro no nosso modelo:

```json
{
  "type": "book",
  "isbn": "978-85-359-0277-5",
  "title": "Cem Anos de Solidão",
  "authors": ["Gabriel García Márquez"],
  "genre": "ficcao",
  "tags": ["realismo-magico", "classico", "latam"],
  "publishedYear": 1967,
  "copies": 3,
  "reviews": [
    { "user": "user::001", "rating": 5, "comment": "Obra-prima" },
    { "user": "user::042", "rating": 4, "comment": "Denso mas vale" }
  ]
}
```

Repare nos elementos exigidos pelo enunciado:

- **Array simples:** `authors`, `tags`
- **Array de subdocumentos:** `reviews`
- **Campos primitivos:** `title`, `genre`, `publishedYear`, `copies`

## N1QL / SQL++ — SQL para JSON

Couchbase suporta uma linguagem SQL-like chamada **N1QL** (lê-se "nickel"), recentemente renomeada para **SQL++**. Para quem vem do mundo relacional, a sintaxe é familiar:

```sql
-- find equivalente
SELECT title, genre
FROM `biblioteca`.`_default`.`books`
WHERE genre = "ficcao";

-- group / aggregate
SELECT genre, COUNT(*) AS total
FROM `biblioteca`.`_default`.`books`
GROUP BY genre;

-- unwind (UNNEST) — explode array de reviews em linhas
SELECT b.title, r.rating, r.comment
FROM `biblioteca`.`_default`.`books` b
UNNEST b.reviews r
WHERE r.rating >= 4;

-- lookup (JOIN entre collections)
SELECT u.name, b.title, l.dueDate
FROM `biblioteca`.`_default`.`loans` l
JOIN `biblioteca`.`_default`.`users` u ON l.userId = META(u).id
JOIN `biblioteca`.`_default`.`books` b ON l.bookId = META(b).id;
```

Mapeamento N1QL ↔ MongoDB (a referência do enunciado):

| MongoDB | N1QL / SQL++ |
|---------|--------------|
| `find()` | `SELECT ... WHERE` |
| `$match` | cláusula `WHERE` |
| `$project` | lista de colunas no `SELECT` |
| `$group` | `GROUP BY` + agregações |
| `$lookup` | `JOIN ... ON` |
| `$unwind` | `UNNEST` |
| `aggregate([...])` | pipeline = SELECT com `GROUP BY`/`UNNEST`/`JOIN` |

## Características diferenciais

- **Memory-first:** todo dado quente fica em RAM; persiste em disco de forma assíncrona.
- **Acesso por chave em microssegundos** (KV API).
- **Scope/Collection** desde a 7.0 (antes só havia bucket — era como ter só um schema gigante).
- **XDCR** (Cross Data Center Replication) — replicação entre clusters em datacenters distintos.
- **Couchbase Lite** — banco embedded para mobile/edge que sincroniza com o servidor via **Sync Gateway**. Único entre os NoSQL com essa stack ponta-a-ponta.
- **Durabilidade configurável por operação** (`majority`, `persistToMajority`, etc).
