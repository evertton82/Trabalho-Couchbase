import couchbase from 'couchbase';

const config = {
  connStr: process.env.COUCHBASE_CONNSTR || 'couchbase://127.0.0.1',
  user: process.env.COUCHBASE_USER || 'app',
  pass: process.env.COUCHBASE_PASS || 'app12345',
  bucket: process.env.COUCHBASE_BUCKET || 'biblioteca',
  scope: process.env.COUCHBASE_SCOPE || '_default',
};

let _cluster = null;
let _bucket = null;
let _scope = null;

export async function getCluster() {
  if (_cluster) return _cluster;
  _cluster = await couchbase.connect(config.connStr, {
    username: config.user,
    password: config.pass,
  });
  return _cluster;
}

export async function getBucket() {
  if (_bucket) return _bucket;
  const cluster = await getCluster();
  _bucket = cluster.bucket(config.bucket);
  return _bucket;
}

export async function getScope() {
  if (_scope) return _scope;
  const bucket = await getBucket();
  _scope = bucket.scope(config.scope);
  return _scope;
}

export async function getCollection(name = '_default') {
  const scope = await getScope();
  return scope.collection(name);
}

export async function close() {
  if (_cluster) {
    await _cluster.close();
    _cluster = null;
    _bucket = null;
    _scope = null;
  }
}

export const dbConfig = config;

export function bucketRef() {
  return `\`${config.bucket}\`.\`${config.scope}\`.\`_default\``;
}
