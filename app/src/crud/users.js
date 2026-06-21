// CRUD em `users`. Mesmo padrão do books, mas via N1QL puro
// para mostrar a alternativa SQL-like às operações KV.

import { getCluster, bucketRef, close } from '../db.js';

const DEMO_KEY = 'user::demo';

async function create(cluster) {
  console.log('\n--- CREATE — INSERT INTO ... VALUES ---');
  const stmt = `
    INSERT INTO ${bucketRef()} (KEY, VALUE)
    VALUES ($1, $2)
  `;
  const doc = {
    type: 'user',
    name: 'Usuário Demo',
    email: 'demo@example.com',
    role: 'leitor',
    address: { city: 'Demo City', state: 'XX', zip: '00000-000' },
    memberSince: '2026-05-28',
  };
  // Couchbase trata conflito de chave como upsert se usarmos UPSERT.
  await cluster.query(
    `UPSERT INTO ${bucketRef()} (KEY, VALUE) VALUES ($1, $2)`,
    { parameters: [DEMO_KEY, doc] },
  );
  console.log(`Inserido (UPSERT): ${DEMO_KEY}`);
}

async function read(cluster) {
  console.log('\n--- READ — SELECT ... USE KEYS ---');
  // USE KEYS é o jeito mais rápido em N1QL (vai direto na chave, sem index).
  const stmt = `SELECT b.* FROM ${bucketRef()} b USE KEYS $1`;
  const res = await cluster.query(stmt, { parameters: [DEMO_KEY] });
  console.log('Lido:', JSON.stringify(res.rows[0], null, 2));
}

async function update(cluster) {
  console.log('\n--- UPDATE — UPDATE ... SET ... WHERE ---');
  const stmt = `
    UPDATE ${bucketRef()} USE KEYS $1
    SET role = "bibliotecario",
        address.city = "Nova Cidade",
        updatedAt = NOW_STR()
    RETURNING role, address.city, updatedAt
  `;
  const res = await cluster.query(stmt, { parameters: [DEMO_KEY] });
  console.log('Após update:', res.rows[0]);
}

async function remove(cluster) {
  console.log('\n--- DELETE — DELETE FROM ... USE KEYS ---');
  const stmt = `DELETE FROM ${bucketRef()} USE KEYS $1 RETURNING META().id`;
  const res = await cluster.query(stmt, { parameters: [DEMO_KEY] });
  console.log('Removido:', res.rows);
}

async function main() {
  const cluster = await getCluster();
  await create(cluster);
  await read(cluster);
  await update(cluster);
  await remove(cluster);
}

main()
  .catch((e) => {
    console.error('Erro no CRUD users:', e);
    process.exitCode = 1;
  })
  .finally(close);
