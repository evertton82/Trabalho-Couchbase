// CRUD em `books` usando a API key-value (KV) do Couchbase.
// Mostra as 4 operações básicas: Create (insert), Read (get), Update (replace) e Delete (remove).

import { getCollection, close } from '../db.js';

const DEMO_KEY = 'book::demo';

async function create(col) {
  console.log('\n--- CREATE — col.insert ---');
  const doc = {
    type: 'book',
    isbn: '978-00-0000-000-1',
    title: 'Livro Demo',
    authors: ['Autor Demo'],
    genre: 'tecnologia',
    tags: ['demo'],
    publishedYear: 2026,
    copies: 1,
    reviews: [],
  };
  try {
    await col.insert(DEMO_KEY, doc);
    console.log(`Inserido: ${DEMO_KEY}`);
  } catch (e) {
    if (e.cause?.code === 1 || /exists/i.test(String(e))) {
      console.log(`(já existia, usando upsert)`);
      await col.upsert(DEMO_KEY, doc);
    } else throw e;
  }
}

async function read(col) {
  console.log('\n--- READ — col.get ---');
  const res = await col.get(DEMO_KEY);
  console.log('Documento lido:', JSON.stringify(res.content, null, 2));
  console.log('CAS (controle de concorrência):', res.cas?.toString());
}

async function update(col) {
  console.log('\n--- UPDATE — col.replace + col.mutateIn (sub-doc) ---');

  // 1) Replace do documento inteiro
  const res = await col.get(DEMO_KEY);
  const updated = { ...res.content, copies: 99, title: 'Livro Demo (atualizado)' };
  await col.replace(DEMO_KEY, updated);
  console.log('Replace OK — copies agora = 99');

  // 2) MutateIn — altera só um campo, sem rebaixar o documento inteiro.
  const couchbase = await import('couchbase');
  await col.mutateIn(DEMO_KEY, [
    couchbase.MutateInSpec.arrayAppend('tags', 'atualizado'),
    couchbase.MutateInSpec.upsert('lastUpdated', new Date().toISOString()),
  ]);
  const after = await col.get(DEMO_KEY);
  console.log('Após mutateIn:', { tags: after.content.tags, lastUpdated: after.content.lastUpdated });
}

async function remove(col) {
  console.log('\n--- DELETE — col.remove ---');
  await col.remove(DEMO_KEY);
  console.log('Removido.');

  try {
    await col.get(DEMO_KEY);
    console.log('ERRO: ainda existe?!');
  } catch {
    console.log('Confirmado: get() agora dá DocumentNotFound.');
  }
}

async function main() {
  const col = await getCollection();
  await create(col);
  await read(col);
  await update(col);
  await remove(col);
}

main()
  .catch((e) => {
    console.error('Erro no CRUD books:', e);
    process.exitCode = 1;
  })
  .finally(close);
