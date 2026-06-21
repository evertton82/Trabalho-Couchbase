# Trabalho — Bancos de Dados Não Relacionais (Couchbase)

> **Disciplina:** Bancos de Dados Não Relacionais
> **Professor:** Prof. Dr. Tassio Sirqueira
> **Banco escolhido:** [Couchbase](https://www.couchbase.com)
> **Entrega:** 10 de junho de 2026

---

## Visão geral

Este repositório contém o trabalho completo sobre **Couchbase**, dividido em três frentes que rodam em paralelo:

| # | Frente | Pasta | O que entrega |
|---|--------|-------|---------------|
| 1 | **Teoria** | [docs/](docs/) | Conceitos, CAP, casos de uso, ecossistema |
| 2 | **Infra (Docker)** | [docker/](docker/) | `docker-compose.yml` que sobe o Couchbase já configurado |
| 3 | **Aplicação CRUD** | [app/](app/) | Node.js + SDK Couchbase, com todos os operadores exigidos |
| 4 | **Apresentação** | [apresentacao/](apresentacao/) | Slides (`.pptx`/`.pdf`) + roteiro de apresentação |

O domínio escolhido para a aplicação é uma **biblioteca digital** (livros, usuários, empréstimos e reviews) — domínio que exercita naturalmente arrays, subdocumentos, joins, unnest e agregações.

---

## Pré-requisitos

Instale antes de começar:

| Ferramenta | Versão | Observação |
|-----------|--------|------------|
| **Docker Desktop** | recente | Precisa estar **aberto e rodando** antes do `docker compose`. ~2 GB de RAM livres. |
| **Node.js** | **20 ou 22 LTS** | Use uma versão **LTS**. O SDK `couchbase` traz binários pré-compilados para as LTS; versões muito novas (ex.: 23/24) podem não ter binário pronto. |
| **Git** | qualquer | Para clonar o repositório. |

Portas que precisam estar livres na máquina: `8091–8096`, `11210`, `11211`, `18091`, `18093`.

---

## Início rápido (5 minutos)

```powershell
# 0. Clonar o repositório
git clone https://github.com/SEU_USUARIO/trabalho-couchbase.git
cd trabalho-couchbase

# 1. Sobe o Couchbase (porta 8091 = console web; 11210 = SDK)
cd docker
docker compose up -d

# 2. Inicializa o cluster, bucket, usuário da app e índices
#    (espera o Couchbase ficar "healthy" e executa o script — idempotente)
docker compose --profile setup run --rm init

# 3. Instala dependências da app
cd ../app
npm install

# 4. Popula dados de exemplo
npm run seed

# 5a. Interface web de CRUD (recomendado)  ->  http://localhost:3000
npm run web

# 5b. OU rode a demo no terminal (todos os operadores em ordem)
npm run demo
```

- **Console web do Couchbase:** <http://localhost:8091> — admin `Administrator / password123`
- **Interface da aplicação (CRUD):** <http://localhost:3000> — inserir, editar, excluir e ver o JSON armazenado, com tema claro/escuro
- **Usuário da app:** `app / app12345` (credenciais locais de desenvolvimento)

> Mais detalhes em [docker/README.md](docker/README.md) e [app/README.md](app/README.md).

---

## Solução de problemas (leia se algo falhar)

| Sintoma | Causa / Solução |
|---------|-----------------|
| `docker compose` não responde | O **Docker Desktop não está aberto**. Abra-o e espere o ícone ficar verde. |
| `init` demora / "waiting healthy" | O Couchbase leva ~40s pra subir na 1ª vez. O comando espera sozinho; aguarde. |
| `ECONNREFUSED` no `npm run seed` | O cluster ainda não estava pronto. Rode o `init` e tente o `seed` de novo. |
| `Could not find native build ... runtime=electron` | Você está rodando dentro do **terminal integrado do VS Code**. Use o **PowerShell/CMD normal**, ou rode antes: `$env:ELECTRON_RUN_AS_NODE=""`. |
| `npm install` falha ao compilar `couchbase` | Está numa versão de Node muito nova. Instale o **Node 20 ou 22 LTS**. |
| Porta `8091` ocupada | Outro serviço usa a porta. Pare-o, ou edite as portas no `docker-compose.yml`. |
| Resetar tudo do zero | `docker compose down -v` (apaga dados) → `docker compose up -d` → `init` → `npm run seed`. |

---

## Como o grupo está conduzindo o trabalho

Veja [docs/PLANO-DE-TRABALHO.md](docs/PLANO-DE-TRABALHO.md) — divisão de tarefas entre os integrantes, cronograma e checklist de entrega.

---

## Requisitos do enunciado — onde cada um está atendido

| Requisito | Onde atende |
|-----------|-------------|
| Tipo de banco (documento, chave-valor, multimodelo) | [docs/01-conceitos-couchbase.md](docs/01-conceitos-couchbase.md) |
| Classificação CAP | [docs/02-arquitetura-cap.md](docs/02-arquitetura-cap.md) |
| Casos de uso | [docs/03-casos-de-uso.md](docs/03-casos-de-uso.md) |
| Ecossistema e ferramentas | [docs/04-ecossistema.md](docs/04-ecossistema.md) |
| Execução prática (Docker) | [docker/](docker/) |
| CRUD completo (terminal) | [app/src/crud/](app/src/crud/) |
| Interface web (inserir/editar/excluir/visualizar) | [app/src/server.js](app/src/server.js) + [app/public/index.html](app/public/index.html) |
| `find` | [app/src/queries/find.js](app/src/queries/find.js) |
| `aggregate` + `$group` | [app/src/queries/aggregate.js](app/src/queries/aggregate.js) |
| `$match` + `$project` | [app/src/queries/match-project.js](app/src/queries/match-project.js) |
| `$lookup` (JOIN em N1QL) | [app/src/queries/lookup.js](app/src/queries/lookup.js) |
| `$unwind` (UNNEST em N1QL) | [app/src/queries/unwind.js](app/src/queries/unwind.js) |
| Arrays e subdocumentos | [app/src/data/seed-data.js](app/src/data/seed-data.js) |

---

## Estrutura completa do repositório

```
trabalho-couchbase/
├── README.md                       <- você está aqui
├── docs/
│   ├── PLANO-DE-TRABALHO.md        <- divisão entre os integrantes
│   ├── 01-conceitos-couchbase.md
│   ├── 02-arquitetura-cap.md
│   ├── 03-casos-de-uso.md
│   ├── 04-ecossistema.md
│   └── 05-comparativo-nosql.md
├── docker/
│   ├── docker-compose.yml
│   ├── init/
│   │   └── init-cluster.sh
│   └── README.md
├── app/
│   ├── package.json
│   ├── public/
│   │   └── index.html              <- interface web (CRUD, tema claro/escuro)
│   ├── src/
│   │   ├── db.js
│   │   ├── server.js               <- servidor HTTP + API REST de CRUD
│   │   ├── seed.js
│   │   ├── demo.js
│   │   ├── crud/
│   │   │   ├── books.js
│   │   │   ├── users.js
│   │   │   └── loans.js
│   │   ├── queries/
│   │   │   ├── find.js
│   │   │   ├── match-project.js
│   │   │   ├── aggregate.js
│   │   │   ├── lookup.js
│   │   │   └── unwind.js
│   │   └── data/
│   │       └── seed-data.js
│   └── README.md
└── apresentacao/
    ├── roteiro-apresentacao.md
    ├── Couchbase-Apresentacao.pptx <- slides (PowerPoint)
    └── Couchbase-Apresentacao.pdf  <- slides (PDF)
```

---

## Como exportar / compartilhar

A pasta inteira é autocontida. Para compartilhar:

```powershell
# zipa a pasta sem node_modules
Compress-Archive -Path "d:\Nexus IA\trabalho-couchbase\*" `
                 -DestinationPath "d:\Nexus IA\trabalho-couchbase.zip" `
                 -Force
```

Ou versione em Git (recomendado — já tem `.gitignore` configurado):

```powershell
cd "d:\Nexus IA\trabalho-couchbase"
git init
git add .
git commit -m "trabalho couchbase - estrutura inicial"
# git remote add origin <url>
# git push -u origin main
```

---

## Contato

- **Éverton Coelho**
- **Pedro NAscimento**
