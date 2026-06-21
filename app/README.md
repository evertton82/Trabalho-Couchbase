# App — CRUD em Node.js + Couchbase

Aplicação que demonstra:

- **CRUD** completo em três collections (`books`, `users`, `loans`)
- **Operadores N1QL/SQL++** equivalentes aos do MongoDB exigidos no enunciado: `find`, `$match`, `$project`, `$group`, `$lookup` (`JOIN`), `$unwind` (`UNNEST`)
- **Arrays** (autores, tags) e **subdocumentos** (reviews aninhadas, endereço do usuário)

## Pré-requisitos

- Node.js 20+ (`node --version`)
- Couchbase rodando (veja [../docker/README.md](../docker/README.md))

## Instalação

```powershell
cd app
npm install
```

## Configuração

Os defaults batem com o `docker-compose.yml`. Se quiser sobrescrever, copie `.env.example` para `.env` e edite. Ou exporte as variáveis:

```powershell
$env:COUCHBASE_CONNSTR = "couchbase://127.0.0.1"
$env:COUCHBASE_USER = "app"
$env:COUCHBASE_PASS = "app12345"
$env:COUCHBASE_BUCKET = "biblioteca"
```

> Não usamos a lib `dotenv` para manter zero dependências além do SDK. Quem quiser carregar o `.env` automaticamente pode usar `node --env-file=.env src/seed.js` (Node 20+).

## Comandos

### Popular dados de exemplo

```powershell
npm run seed
```

Limpa a bucket e insere ~6 livros, 4 usuários e 5 empréstimos com reviews aninhadas.

### Rodar a demo completa (recomendado para a apresentação)

```powershell
npm run demo
```

Executa **todos os operadores em sequência** com cabeçalhos explicativos. É o que vamos rodar ao vivo no dia 10/06.

### Rodar partes isoladas

| Comando | O que faz |
|---------|-----------|
| `npm run crud:books` | Insert, Get, Update e Delete em `books` |
| `npm run crud:users` | Mesmo para `users` |
| `npm run crud:loans` | Mesmo para `loans` |
| `npm run query:find` | `find` simples e por chave (KV) |
| `npm run query:match-project` | `WHERE` (`$match`) + projeção de campos (`$project`) |
| `npm run query:aggregate` | `GROUP BY` + funções agregadas (`$group`) |
| `npm run query:lookup` | `JOIN` entre collections (`$lookup`) |
| `npm run query:unwind` | `UNNEST` em array de reviews (`$unwind`) |

## Estrutura

```
app/
├── package.json
├── .env.example
└── src/
    ├── db.js                <- conexão singleton com o Couchbase
    ├── seed.js              <- popula a bucket
    ├── demo.js              <- runner que chama tudo em ordem
    ├── data/
    │   └── seed-data.js     <- dados de exemplo (livros, usuários, empréstimos)
    ├── crud/
    │   ├── books.js         <- C/R/U/D em books
    │   ├── users.js         <- idem users
    │   └── loans.js         <- idem loans
    └── queries/
        ├── find.js          <- SELECT simples + KV get
        ├── match-project.js <- WHERE + SELECT específico
        ├── aggregate.js     <- GROUP BY + agregações
        ├── lookup.js        <- JOIN entre 3 collections
        └── unwind.js        <- UNNEST em reviews
```

## Mapeamento MongoDB → N1QL (resumo de bolso)

| MongoDB (enunciado) | N1QL / SQL++ | Onde no código |
|---------------------|--------------|----------------|
| `find()` | `SELECT * FROM ... WHERE ...` | [src/queries/find.js](src/queries/find.js) |
| `aggregate([...])` | pipeline = SELECT com `GROUP BY`/`JOIN`/`UNNEST` | [src/queries/aggregate.js](src/queries/aggregate.js) |
| `$match` | `WHERE` | [src/queries/match-project.js](src/queries/match-project.js) |
| `$project` | colunas do `SELECT` | [src/queries/match-project.js](src/queries/match-project.js) |
| `$group` | `GROUP BY` + `COUNT`, `AVG`, `SUM` | [src/queries/aggregate.js](src/queries/aggregate.js) |
| `$lookup` | `JOIN ... ON` | [src/queries/lookup.js](src/queries/lookup.js) |
| `$unwind` | `UNNEST` | [src/queries/unwind.js](src/queries/unwind.js) |

## Notas técnicas

- Usamos **uma collection lógica por tipo** (`books`, `users`, `loans`) representada pelo campo `type` no documento + scope `_default`. Para escala real, valeria criar collections separadas, mas no CE 7.6 essa abordagem mostra os JOINs/UNNEST com a mesma sintaxe sem complicar o seed.
- A chave de cada documento segue o padrão `<tipo>::<id>` (ex.: `book::001`, `user::001`, `loan::001`).
- O bucket é único: `biblioteca`. Os scripts assumem que os índices criados pelo `init-cluster.sh` já existem.
