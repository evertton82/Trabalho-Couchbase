// `aggregate` + `$group` — em N1QL é GROUP BY + funções agregadas.

import { getCluster, bucketRef, close } from '../db.js';

async function booksByGenre() {
  console.log('\n--- $group — total de livros e exemplares por gênero ---');
  const cluster = await getCluster();
  const stmt = `
    SELECT
        b.genre                AS genero,
        COUNT(*)               AS totalTitulos,
        SUM(b.copies)          AS totalExemplares,
        AVG(b.publishedYear)   AS anoMedio
    FROM ${bucketRef()} b
    WHERE b.type = "book"
    GROUP BY b.genre
    ORDER BY totalExemplares DESC
  `;
  const res = await cluster.query(stmt);
  console.table(res.rows);
}

async function loansByStatus() {
  console.log('\n--- $group — empréstimos por status ---');
  const cluster = await getCluster();
  const stmt = `
    SELECT
        l.status      AS status,
        COUNT(*)      AS quantidade
    FROM ${bucketRef()} l
    WHERE l.type = "loan"
    GROUP BY l.status
  `;
  const res = await cluster.query(stmt);
  console.table(res.rows);
}

async function topReadersByLoans() {
  console.log('\n--- $group + HAVING — leitores com mais de 1 empréstimo ---');
  const cluster = await getCluster();
  const stmt = `
    SELECT
        l.userId          AS userId,
        COUNT(*)          AS qtdEmprestimos
    FROM ${bucketRef()} l
    WHERE l.type = "loan"
    GROUP BY l.userId
    HAVING COUNT(*) >= 2
    ORDER BY qtdEmprestimos DESC
  `;
  const res = await cluster.query(stmt);
  console.table(res.rows);
}

async function avgRatingPerBook() {
  console.log('\n--- $unwind + $group — nota média dos livros (mostra UNNEST + GROUP) ---');
  const cluster = await getCluster();
  const stmt = `
    SELECT
        b.title           AS livro,
        AVG(r.rating)     AS notaMedia,
        COUNT(r)          AS qtdReviews
    FROM ${bucketRef()} b
    UNNEST b.reviews r
    WHERE b.type = "book"
    GROUP BY b.title
    ORDER BY notaMedia DESC
  `;
  const res = await cluster.query(stmt);
  console.table(res.rows);
}

async function main() {
  await booksByGenre();
  await loansByStatus();
  await topReadersByLoans();
  await avgRatingPerBook();
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exitCode = 1;
  })
  .finally(close);
