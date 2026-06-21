// CRUD em `loans` — combina KV (insert e get) com N1QL (update e delete por filtro).
// Mostra um cenário "criar empréstimo, devolver livro, remover registro".

import { getCollection, getCluster, bucketRef, close } from '../db.js';

const DEMO_KEY = 'loan::demo';

async function create(col) {
  console.log('\n--- CREATE — col.upsert ---');
  const doc = {
    type: 'loan',
    userId: 'user::001',
    bookId: 'book::001',
    borrowedAt: '2026-05-28',
    dueDate: '2026-06-11',
    returnedAt: null,
    status: 'ativo',
  };
  await col.upsert(DEMO_KEY, doc);
  console.log(`Empréstimo registrado: ${DEMO_KEY}`);
}

async function read(col) {
  console.log('\n--- READ — col.get ---');
  const res = await col.get(DEMO_KEY);
  console.log('Empréstimo:', res.content);
}

async function update(cluster) {
  console.log('\n--- UPDATE — N1QL devolução do livro ---');
  const stmt = `
    UPDATE ${bucketRef()} USE KEYS $1
    SET status = "devolvido",
        returnedAt = "2026-05-30"
    RETURNING status, returnedAt
  `;
  const res = await cluster.query(stmt, { parameters: [DEMO_KEY] });
  console.log('Devolução registrada:', res.rows[0]);
}

async function remove(cluster) {
  console.log('\n--- DELETE — DELETE FROM ... WHERE (uso por filtro) ---');
  // Apaga empréstimos do tipo loan que estejam devolvidos e do user::demo.
  // (Aqui só vai bater o nosso loan::demo após o update.)
  const stmt = `
    DELETE FROM ${bucketRef()}
    WHERE type = "loan" AND status = "devolvido" AND META().id = $1
    RETURNING META().id
  `;
  const res = await cluster.query(stmt, { parameters: [DEMO_KEY] });
  console.log('Removidos:', res.rows);
}

async function main() {
  const col = await getCollection();
  const cluster = await getCluster();
  await create(col);
  await read(col);
  await update(cluster);
  await remove(cluster);
}

main()
  .catch((e) => {
    console.error('Erro no CRUD loans:', e);
    process.exitCode = 1;
  })
  .finally(close);
