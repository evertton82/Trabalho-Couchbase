// Servidor HTTP que expõe a interface web (public/index.html) + uma API REST
// de CRUD sobre o Couchbase, reaproveitando a conexão de db.js.
//
// O navegador NÃO fala direto com o Couchbase (o SDK é server-side); por isso
// este servidor faz a ponte: recebe requisições HTTP do HTML e executa as
// operações Key-Value / N1QL no banco.
//
// Sem dependências além do SDK couchbase — usa só os módulos nativos do Node.

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getCollection, getCluster, bucketRef, close } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const PORT = Number(process.env.PORT) || 3000;

// rota (plural) -> campo `type` no documento
const TYPES = { books: 'book', users: 'user', loans: 'loan' };

// ---------- helpers de resposta ----------
function sendJSON(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null; // body inválido
  }
}

function isNotFound(e) {
  return /document not found|LCB_KEY_ENOENT|not found/i.test(String(e?.message || e));
}
function isExists(e) {
  return /exists|LCB_KEY_EEXISTS/i.test(String(e?.message || e));
}

// ---------- operações de banco ----------
async function listDocs(type) {
  const cluster = await getCluster();
  const q =
    `SELECT META(d).id AS _id, d.* FROM ${bucketRef()} d ` +
    `WHERE d.type = $type ORDER BY META(d).id`;
  const r = await cluster.query(q, { parameters: { type } });
  return r.rows;
}

async function getDoc(key) {
  const col = await getCollection();
  const r = await col.get(key);
  return { _id: key, ...r.content };
}

function buildKey(type, body) {
  const rawId = (body.id ?? body._id ?? '').toString().trim();
  const id = rawId || `${Date.now()}`;
  // se o usuário já digitou a chave completa (book::007), respeita
  return id.includes('::') ? id : `${type}::${id}`;
}

function buildDoc(type, body) {
  const doc = { ...body, type };
  delete doc.id;
  delete doc._id;
  return doc;
}

// ---------- roteador da API ----------
async function handleApi(req, res, parts) {
  // parts: ['api', coll, id?]
  const coll = parts[1];
  const id = parts[2] ? decodeURIComponent(parts[2]) : null;
  const type = TYPES[coll];
  if (!type) return sendJSON(res, 404, { error: `Coleção desconhecida: ${coll}` });

  const col = await getCollection();
  const method = req.method;

  // GET /api/books  -> lista | GET /api/books/:id -> um
  if (method === 'GET') {
    if (id) {
      try {
        return sendJSON(res, 200, await getDoc(id));
      } catch (e) {
        if (isNotFound(e)) return sendJSON(res, 404, { error: 'Documento não encontrado' });
        throw e;
      }
    }
    return sendJSON(res, 200, await listDocs(type));
  }

  // POST /api/books -> cria
  if (method === 'POST') {
    const body = await readBody(req);
    if (!body) return sendJSON(res, 400, { error: 'JSON inválido' });
    const key = buildKey(type, body);
    const doc = buildDoc(type, body);
    try {
      await col.insert(key, doc);
      return sendJSON(res, 201, { _id: key, ...doc });
    } catch (e) {
      if (isExists(e))
        return sendJSON(res, 409, { error: `Já existe um documento com a chave ${key}` });
      throw e;
    }
  }

  // PUT /api/books/:id -> altera (replace)
  if (method === 'PUT') {
    if (!id) return sendJSON(res, 400, { error: 'Informe a chave na URL' });
    const body = await readBody(req);
    if (!body) return sendJSON(res, 400, { error: 'JSON inválido' });
    const doc = buildDoc(type, body);
    await col.upsert(id, doc); // upsert = cria-ou-substitui
    return sendJSON(res, 200, { _id: id, ...doc });
  }

  // DELETE /api/books/:id -> remove
  if (method === 'DELETE') {
    if (!id) return sendJSON(res, 400, { error: 'Informe a chave na URL' });
    try {
      await col.remove(id);
      return sendJSON(res, 200, { ok: true, _id: id });
    } catch (e) {
      if (isNotFound(e)) return sendJSON(res, 404, { error: 'Documento não encontrado' });
      throw e;
    }
  }

  return sendJSON(res, 405, { error: `Método ${method} não suportado` });
}

// ---------- arquivos estáticos ----------
async function handleStatic(req, res, pathname) {
  const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.join(PUBLIC_DIR, rel);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); return res.end('Forbidden');
  }
  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath);
    const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': `${mime}; charset=utf-8` });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

// ---------- servidor ----------
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0] === 'api') return await handleApi(req, res, parts);
    return await handleStatic(req, res, url.pathname);
  } catch (e) {
    console.error('Erro no servidor:', e);
    sendJSON(res, 500, { error: String(e?.message || e) });
  }
});

server.listen(PORT, () => {
  console.log(`\n  Interface CRUD no ar:  http://localhost:${PORT}\n`);
  console.log('  (Ctrl+C para parar)\n');
});

// fecha a conexão com o Couchbase ao encerrar
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, async () => {
    console.log('\nEncerrando...');
    await close().catch(() => {});
    process.exit(0);
  });
}
