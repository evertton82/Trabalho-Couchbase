// `$match` + `$project` — em N1QL é a cláusula WHERE somada à projeção no SELECT.
// $match  -> WHERE
// $project -> escolher exatamente quais campos vêm no resultado.

import { getCluster, bucketRef, close } from '../db.js';

async function matchAndProject() {
  console.log('\n--- $match + $project — livros de tecnologia, apenas título e ano ---');
  const cluster = await getCluster();
  const stmt = `
    SELECT
        b.title       AS livro,         -- $project: só estes campos
        b.publishedYear AS ano,
        ARRAY_LENGTH(b.reviews) AS qtdReviews
    FROM ${bucketRef()} b
    WHERE b.type = "book"               -- $match
      AND b.genre = "tecnologia"        -- $match
      AND b.publishedYear >= 2010       -- $match
    ORDER BY ano DESC
  `;
  const res = await cluster.query(stmt);
  console.table(res.rows);
}

async function projectComputedField() {
  console.log('\n--- $project com campo derivado — usuários e cidade.estado concatenados ---');
  const cluster = await getCluster();
  const stmt = `
    SELECT
        u.name                                          AS nome,
        u.email                                         AS email,
        u.address.city || "/" || u.address.state         AS localidade,
        DATE_DIFF_STR(CLOCK_STR(), u.memberSince, "month") AS mesesComoMembro
    FROM ${bucketRef()} u
    WHERE u.type = "user"
    ORDER BY mesesComoMembro DESC
  `;
  const res = await cluster.query(stmt);
  console.table(res.rows);
}

async function main() {
  await matchAndProject();
  await projectComputedField();
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exitCode = 1;
  })
  .finally(close);
