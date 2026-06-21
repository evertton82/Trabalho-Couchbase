# Plano de Trabalho — Couchbase

> Documento para alinhar o grupo (Éverton + Pedro) sobre como vamos conduzir o trabalho até **10 de junho de 2026**.

---

## Resumo

- **Banco:** Couchbase (NoSQL, multimodelo — primariamente documento JSON + key-value, com SQL nativo via N1QL)
- **Stack da app:** Node.js 20 + SDK oficial `couchbase`
- **Infra:** Docker (`couchbase/server:community-7.6.2`)
- **Domínio:** Biblioteca digital (livros, usuários, empréstimos, reviews)
- **Entregáveis:**
  1. Documento teórico (este repo, pasta `docs/`)
  2. Stack Docker funcional
  3. Aplicação Node com CRUD + N1QL exercitando todos os operadores
  4. Apresentação ao vivo no dia 10/06

---

## Divisão de tarefas

| Frente | Responsável principal | Apoio | Status |
|--------|----------------------|-------|--------|
| Conceitos e classificação CAP | Éverton | Pedro (revisão) | rascunho pronto |
| Casos de uso + ecossistema | Pedro | Éverton (revisão) | a fazer |
| Docker + setup do cluster | Éverton | — | pronto |
| Modelagem (livros/users/loans) | Éverton + Pedro | — | pronto (ver `app/src/data/seed-data.js`) |
| CRUD básico (books, users, loans) | Éverton | — | pronto |
| Queries N1QL (find/match/project/group/lookup/unnest) | Éverton | Pedro (testar e propor variações) | pronto |
| Roteiro da apresentação | Pedro | Éverton | rascunho |
| Slides (PPTX) | Pedro | Éverton (revisão) | a fazer |
| Ensaio (ao menos 1×) | Éverton + Pedro | — | a marcar |

> **Pedro:** sinta-se à vontade para editar qualquer arquivo. As partes marcadas como "a fazer" são as suas. Se quiser trocar — combina comigo antes.

---

## Cronograma sugerido

Hoje é **28/05/2026**. Faltam **13 dias** para a entrega.

| Janela | Marco |
|--------|-------|
| 28/05 — 30/05 | Estrutura criada, docs teóricos preenchidos, Docker e app funcionando localmente (ambos rodando na própria máquina) |
| 31/05 — 03/06 | Cada um termina sua parte teórica; Pedro escreve casos de uso + ecossistema |
| 04/06 — 06/06 | Pedro monta os slides; Éverton revisa CRUD e adiciona prints/screenshots ao roteiro |
| 07/06 — 08/06 | Ensaio da apresentação (mínimo 1×) + ajustes |
| 09/06 | Congelamento — só correções de erro |
| 10/06 | Apresentação |

---

## Como rodar na sua máquina (Pedro)

Pré-requisitos:
- Docker Desktop instalado e rodando
- Node.js 20+ (`node --version`)
- Git (opcional, para versionar)

```powershell
# 1. clona / descompacta o repo
cd <onde-você-extraiu>\trabalho-couchbase

# 2. sobe o Couchbase
cd docker
docker compose up -d
docker compose --profile setup run --rm init   # inicializa cluster + bucket

# 3. instala e popula
cd ..\app
npm install
npm run seed

# 4. roda a demo
npm run demo
```

Se o passo 2 falhar, veja [../docker/README.md](../docker/README.md) — tem o troubleshooting.

---

## Como vamos colaborar

- **Repo Git** (a criar): vamos hospedar no GitHub privado e adicionar os dois como colaboradores. Enquanto não há repo, sincronizamos via .zip.
- **Branch por pessoa** durante a escrita, merge no `main` após revisão rápida — mas para um trabalho desse porte tá ok mexer direto no main.
- **Issues / tarefas:** lista no início deste documento; quem terminar atualiza o "Status".
- **Comunicação:** WhatsApp para coisas curtas; alinhamentos maiores numa call rápida.

---

## Checklist final de entrega (10/06)

Antes da apresentação, garantir que:

- [ ] `docs/` está completo e revisado pelos dois integrantes
- [ ] `docker compose up -d` sobe limpo numa máquina nova
- [ ] `npm run demo` executa do início ao fim sem erros e mostra resultado de cada operador (`find`, `$match`, `$project`, `$group`, `$lookup`/JOIN, `$unwind`/UNNEST)
- [ ] Há pelo menos um exemplo de **array** e um de **subdocumento** sendo consultado
- [ ] Slides prontos em `apresentacao/` (PPTX ou PDF)
- [ ] Cada integrante sabe explicar a parte do outro (em caso de pergunta cruzada do professor)
- [ ] Cópia do repositório (.zip) entregue individualmente por cada integrante na plataforma da faculdade

---

## Decisões já fechadas (não reabrir sem combinar)

| Decisão | Motivo |
|---------|--------|
| Stack: Node.js | SDK Couchbase oficial e bem documentado; JSON nativo |
| Domínio: biblioteca digital | Exercita arrays (autores, tags), subdocs (endereço, review), joins (empréstimo↔livro↔usuário), unnest (reviews aninhadas) e group (mais emprestados por gênero) |
| Couchbase Community 7.6 | Versão estável e gratuita; cobre 100% do que precisamos |
| Não usaremos Couchbase Capella (cloud) | Demo precisa rodar offline na apresentação |
