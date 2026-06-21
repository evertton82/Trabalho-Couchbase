// Demo runner — executa todas as queries em ordem, com cabeçalhos visíveis.
// Foi pensado para ser rodado AO VIVO na apresentação:
//   npm run demo
//
// Premissa: `npm run seed` já foi executado antes.

import { getCluster, getCollection, bucketRef, close } from './db.js';

const SEP = '═'.repeat(64);

function banner(title) {
  console.log(`\n${SEP}`);
  console.log(`  ${title}`);
  console.log(SEP);
}

async function showOne(stmt, params = {}) {
  const cluster = await getCluster();
  console.log(`\n> ${stmt.trim().replace(/\s+/g, ' ')}`);
  const res = await cluster.query(stmt, { parameters: params });
  if (res.rows.length === 0) {
    console.log('   (sem linhas)');
  } else {
    console.table(res.rows);
  }
}

async function section_KV() {
  banner('1. ACESSO KEY-VALUE — o ponto forte do Couchbase');
  const col = await getCollection();
  const res = await col.get('book::001');
  console.log('col.get("book::001") →', {
    title: res.content.title,
    authors: res.content.authors,
    qtdReviews: res.content.reviews.length,
  });
}

async function section_find() {
  banner('2. FIND — SELECT ... WHERE');
  await showOne(`
    SELECT META(b).id, b.title, b.genre
    FROM ${bucketRef()} b
    WHERE b.type = "book"
    LIMIT 3
  `);
}

async function section_match_project() {
  banner('3. $match + $project — WHERE + lista do SELECT');
  await showOne(`
    SELECT b.title AS livro, b.publishedYear AS ano
    FROM ${bucketRef()} b
    WHERE b.type = "book" AND b.genre = "ficcao"
    ORDER BY b.publishedYear
  `);
}

async function section_group() {
  banner('4. $group — GROUP BY + COUNT/SUM/AVG');
  await showOne(`
    SELECT b.genre AS genero,
           COUNT(*) AS totalTitulos,
           SUM(b.copies) AS totalExemplares
    FROM ${bucketRef()} b
    WHERE b.type = "book"
    GROUP BY b.genre
    ORDER BY totalExemplares DESC
  `);
}

async function section_lookup() {
  banner('5. $lookup — JOIN entre collections');
  await showOne(`
    SELECT u.name AS leitor, b.title AS livro, l.dueDate AS prazo, l.status
    FROM ${bucketRef()} l
    JOIN ${bucketRef()} u ON KEYS l.userId
    JOIN ${bucketRef()} b ON KEYS l.bookId
    WHERE l.type = "loan" AND l.status = "ativo"
  `);
}

async function section_unwind() {
  banner('6. $unwind — UNNEST: cada review do array vira uma linha');
  await showOne(`
    SELECT b.title AS livro, r.rating AS nota, r.comment AS comentario
    FROM ${bucketRef()} b
    UNNEST b.reviews r
    WHERE b.type = "book"
    ORDER BY r.rating DESC
    LIMIT 5
  `);
}

async function section_arrays() {
  banner('7. ARRAYS — busca dentro de array de strings');
  await showOne(`
    SELECT b.title, b.tags
    FROM ${bucketRef()} b
    WHERE b.type = "book" AND "classico" IN b.tags
  `);
}

async function section_subdoc() {
  banner('8. SUBDOCUMENTOS — endereço aninhado no usuário');
  await showOne(`
    SELECT u.name, u.address.city AS cidade, u.address.state AS estado
    FROM ${bucketRef()} u
    WHERE u.type = "user" AND u.address.state = "MG"
  `);
}

async function section_aggregate_pipeline() {
  banner('9. PIPELINE COMPLETO — $lookup + $unwind + $group + $match + $project');
  console.log('   (mostra todos os operadores juntos numa única query)');
  await showOne(`
    SELECT
        b.genre                      AS genero,         -- $project
        COUNT(DISTINCT META(l).id)   AS qtdEmprestimos, -- $group
        AVG(r.rating)                AS notaMedia       -- $group
    FROM ${bucketRef()} l
    JOIN ${bucketRef()} b ON KEYS l.bookId               -- $lookup
    UNNEST b.reviews r                                   -- $unwind
    WHERE l.type = "loan"                                -- $match
      AND b.type = "book"
    GROUP BY b.genre                                     -- $group
    HAVING COUNT(DISTINCT META(l).id) >= 1
    ORDER BY qtdEmprestimos DESC
  `);
}

async function main() {
  console.log('\n>>> DEMO Couchbase — biblioteca digital');
  console.log('    (rode `npm run seed` antes, se ainda não rodou)\n');

  await section_KV();
  await section_find();
  await section_match_project();
  await section_group();
  await section_lookup();
  await section_unwind();
  await section_arrays();
  await section_subdoc();
  await section_aggregate_pipeline();

  banner('FIM — todos os operadores exigidos demonstrados.');
}

main()
  .catch((e) => {
    console.error('Erro na demo:', e);
    process.exitCode = 1;
  })
  .finally(close);
