// `$unwind` — em N1QL é UNNEST.
// "Explode" um array em N linhas (uma por elemento), permitindo filtrar/agregar nos elementos.

import { getCluster, bucketRef, close } from '../db.js';

async function unwindReviews() {
  console.log('\n--- $unwind reviews — cada review como uma linha ---');
  const cluster = await getCluster();
  const stmt = `
    SELECT
        b.title       AS livro,
        r.user        AS reviewer,
        r.rating      AS nota,
        r.comment     AS comentario
    FROM ${bucketRef()} b
    UNNEST b.reviews r            -- explode o array reviews em linhas
    WHERE b.type = "book"
    ORDER BY r.rating DESC, b.title
  `;
  const res = await cluster.query(stmt);
  console.table(res.rows);
}

async function unwindWithMatch() {
  console.log('\n--- $unwind + $match — só reviews 5 estrelas, com nome do reviewer ---');
  const cluster = await getCluster();
  const stmt = `
    SELECT
        b.title       AS livro,
        u.name        AS reviewerNome,
        r.comment     AS comentario
    FROM ${bucketRef()} b
    UNNEST b.reviews r
    JOIN ${bucketRef()} u ON KEYS r.user
    WHERE b.type = "book" AND r.rating = 5
    ORDER BY b.title
  `;
  const res = await cluster.query(stmt);
  console.table(res.rows);
}

async function unwindArrayOfPrimitives() {
  console.log('\n--- $unwind em array de primitivos — cada tag vira linha ---');
  const cluster = await getCluster();
  const stmt = `
    SELECT
        tag           AS tag,
        COUNT(*)      AS livrosComEssaTag
    FROM ${bucketRef()} b
    UNNEST b.tags tag             -- explode o array tags (strings)
    WHERE b.type = "book"
    GROUP BY tag
    ORDER BY livrosComEssaTag DESC
  `;
  const res = await cluster.query(stmt);
  console.table(res.rows);
}

async function main() {
  await unwindReviews();
  await unwindWithMatch();
  await unwindArrayOfPrimitives();
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exitCode = 1;
  })
  .finally(close);
