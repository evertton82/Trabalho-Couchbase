// Limpa documentos antigos do tipo book/user/loan e insere os de exemplo.
// Idempotente: rode quantas vezes quiser.

import { getCollection, getCluster, bucketRef, close } from './db.js';
import { books, users, loans } from './data/seed-data.js';

async function clearAll() {
  const cluster = await getCluster();
  const stmt = `DELETE FROM ${bucketRef()} WHERE type IN ["book","user","loan"]`;
  await cluster.query(stmt);
}

async function upsertAll(items) {
  const col = await getCollection();
  for (const { key, doc } of items) {
    await col.upsert(key, doc);
  }
}

async function main() {
  console.log('==> Limpando documentos antigos (DELETE WHERE type IN ...)');
  await clearAll();

  console.log(`==> Inserindo ${books.length} livros`);
  await upsertAll(books);

  console.log(`==> Inserindo ${users.length} usuários`);
  await upsertAll(users);

  console.log(`==> Inserindo ${loans.length} empréstimos`);
  await upsertAll(loans);

  console.log('OK — base populada.');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exitCode = 1;
  })
  .finally(close);
