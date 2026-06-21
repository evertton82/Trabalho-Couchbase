// `$lookup` — JOIN entre collections. Em N1QL é JOIN ... ON KEYS / ON META().id.
// Como nossa "collection lógica" é diferenciada pelo campo `type`, fazemos self-join
// em `biblioteca._default._default` com filtros por type.

import { getCluster, bucketRef, close } from '../db.js';

async function loansJoinUserAndBook() {
  console.log('\n--- $lookup — empréstimos com nome do usuário e título do livro ---');
  const cluster = await getCluster();
  const stmt = `
    SELECT
        META(l).id      AS emprestimoId,
        u.name          AS leitor,
        b.title         AS livro,
        l.borrowedAt    AS retirada,
        l.dueDate       AS devolucaoPrevista,
        l.status        AS status
    FROM ${bucketRef()} l
    JOIN ${bucketRef()} u ON KEYS l.userId   -- equivalente $lookup users
    JOIN ${bucketRef()} b ON KEYS l.bookId   -- equivalente $lookup books
    WHERE l.type = "loan"
    ORDER BY l.borrowedAt DESC
  `;
  const res = await cluster.query(stmt);
  console.table(res.rows);
}

async function activeLoansWithLateInfo() {
  console.log('\n--- $lookup com cálculo — empréstimos ativos e se estão atrasados ---');
  const cluster = await getCluster();
  const stmt = `
    SELECT
        u.name                                                AS leitor,
        b.title                                               AS livro,
        l.dueDate                                             AS prazo,
        DATE_DIFF_STR(CLOCK_STR(), l.dueDate, "day")          AS diasParaPrazo,
        CASE
          WHEN DATE_DIFF_STR(CLOCK_STR(), l.dueDate, "day") > 0 THEN "atrasado"
          ELSE "no prazo"
        END                                                   AS situacao
    FROM ${bucketRef()} l
    JOIN ${bucketRef()} u ON KEYS l.userId
    JOIN ${bucketRef()} b ON KEYS l.bookId
    WHERE l.type = "loan" AND l.status = "ativo"
  `;
  const res = await cluster.query(stmt);
  console.table(res.rows);
}

async function main() {
  await loansJoinUserAndBook();
  await activeLoansWithLateInfo();
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exitCode = 1;
  })
  .finally(close);
