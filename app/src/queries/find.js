// `find` — equivalente do `db.collection.find({...})` do MongoDB.
// Em N1QL é simplesmente SELECT ... WHERE.
// Também mostramos o acesso direto por chave (KV), que é o mais rápido.

import { getCluster, getCollection, bucketRef, close } from '../db.js';

async function findByKey() {
  console.log('\n--- FIND by key (KV — microssegundos) ---');
  const col = await getCollection();
  const res = await col.get('book::004');
  console.log('Livro:', res.content.title, 'por', res.content.authors.join(', '));
}

async function findAllBooks() {
  console.log('\n--- FIND simples — SELECT ... WHERE type="book" ---');
  const cluster = await getCluster();
  const res = await cluster.query(
    `SELECT META(b).id, b.title, b.genre
     FROM ${bucketRef()} b
     WHERE b.type = "book"
     LIMIT 3`,
  );
  console.table(res.rows);
}

async function findByGenre() {
  console.log('\n--- FIND por gênero — equivalente find({ genre: "ficcao" }) ---');
  const cluster = await getCluster();
  const res = await cluster.query(
    `SELECT b.title, b.publishedYear
     FROM ${bucketRef()} b
     WHERE b.type = "book" AND b.genre = $genre
     ORDER BY b.publishedYear`,
    { parameters: { genre: 'ficcao' } },
  );
  console.table(res.rows);
}

async function findByTagInArray() {
  console.log('\n--- FIND em array — WHERE "classico" IN tags ---');
  const cluster = await getCluster();
  const res = await cluster.query(
    `SELECT b.title, b.tags
     FROM ${bucketRef()} b
     WHERE b.type = "book" AND "classico" IN b.tags`,
  );
  console.table(res.rows);
}

async function main() {
  await findByKey();
  await findAllBooks();
  await findByGenre();
  await findByTagInArray();
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exitCode = 1;
  })
  .finally(close);
