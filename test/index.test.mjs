import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { createFakeTerabox } from './fake-terabox.mjs';

const SURL = 'GV28I3ea5rR_oR_f6LZGwQ';
const TREE = [
  {
    name: 'Album',
    fs_id: 1,
    children: [
      { name: 'track01.flac', size: 100, fs_id: 11 },
      { name: 'track02.flac', size: 200, fs_id: 12 },
    ],
  },
];

const handlers = {};
const storage = new Map();
const logs = [];
let fake;
let fingerprint = '';

before(async () => {
  fake = createFakeTerabox({ surl: SURL, tree: TREE });
  globalThis.fetch = fake.fetchImpl;
  globalThis.__gopeed_setFingerprint = (fp) => {
    fingerprint = fp;
  };
  globalThis.MessageError = class MessageError extends Error {};
  globalThis.gopeed = {
    settings: {
      cookie: '',
      password: '',
      mirror: 'auto',
      apiBase: '',
      maxFiles: 200,
      folderDepth: 5,
      ua: '',
      fingerprint: true,
    },
    events: {
      onResolve: (fn) => (handlers.onResolve = fn),
      onStart: (fn) => (handlers.onStart = fn),
      onError: (fn) => (handlers.onError = fn),
      onDone: (fn) => (handlers.onDone = fn),
    },
    storage: {
      get: (k) => (storage.has(k) ? storage.get(k) : null),
      set: (k, v) => storage.set(k, v),
      remove: (k) => storage.delete(k),
    },
    logger: {
      debug: (...a) => logs.push(['debug', a.join(' ')]),
      info: (...a) => logs.push(['info', a.join(' ')]),
      warn: (...a) => logs.push(['warn', a.join(' ')]),
      error: (...a) => logs.push(['error', a.join(' ')]),
    },
  };
  await import('../src/index.js');
});

test('all four handlers are registered', () => {
  assert.equal(typeof handlers.onResolve, 'function');
  assert.equal(typeof handlers.onStart, 'function');
  assert.equal(typeof handlers.onError, 'function');
  assert.equal(typeof handlers.onDone, 'function');
});

test('onResolve ignores non-share TeraBox pages', async () => {
  const ctx = { req: { url: 'https://www.terabox.com/main' } };
  await handlers.onResolve(ctx);
  assert.equal(ctx.res, undefined);
});

test('onResolve without a cookie explains the ndus requirement (MessageError)', async () => {
  const ctx = { req: { url: `https://www.terabox.app/s/1${SURL}` } };
  await assert.rejects(
    () => handlers.onResolve(ctx),
    (err) => err instanceof MessageError && /Found 2 file\(s\)/.test(err.message) && /ndus/.test(err.message)
  );
  assert.equal(fingerprint, 'chrome');
});

test('onResolve with a cookie builds a folder task with CDN links and labels', async () => {
  gopeed.settings.cookie = 'ndus=SECRET';
  const ctx = { req: { url: `https://teraboxlink.com/s/1${SURL}` } };
  await handlers.onResolve(ctx);
  assert.equal(ctx.res.name, 'Album');
  assert.equal(ctx.res.files.length, 2);
  const [a, b] = ctx.res.files;
  assert.equal(a.name, 'track01.flac');
  assert.equal(a.path, '');
  assert.equal(a.size, 100);
  assert.match(a.req.url, /^https:\/\/cdn\.example\.net\/file\/md511\?/);
  assert.equal(a.req.extra.header.Referer.startsWith('https://www.terabox.app/sharing/link?surl='), true);
  assert.ok(!a.req.extra.header.Cookie);
  assert.deepEqual(Object.keys(a.req.labels).sort(), [
    'terabox',
    'terabox_expires',
    'terabox_fsid',
    'terabox_name',
    'terabox_origin',
    'terabox_surl',
  ]);
  assert.equal(a.req.labels.terabox_fsid, '11');
  assert.equal(a.req.labels.terabox_origin, 'https://www.terabox.app');
  assert.equal(b.req.labels.terabox_fsid, '12');
  assert.equal(b.req.labels.terabox_expires, '1767791721');
});

test('onStart leaves fresh links alone and refreshes expired ones (1.9-style request object)', async () => {
  const fresh = String(Math.floor(Date.now() / 1000) + 3600);
  const req19 = {
    url: 'https://cdn.example.net/file/old',
    extra: { header: { Referer: 'x' } },
    labels: {
      terabox: '1',
      terabox_surl: SURL,
      terabox_fsid: '12',
      terabox_name: 'track02.flac',
      terabox_origin: 'https://www.terabox.app',
      terabox_expires: fresh,
    },
  };
  await handlers.onStart({ task: { id: 't1', meta: { req: req19 } } });
  assert.equal(req19.url, 'https://cdn.example.net/file/old');

  req19.labels.terabox_expires = '1000';
  await handlers.onStart({ task: { id: 't1', meta: { req: req19 } } });
  assert.match(req19.url, /^https:\/\/cdn\.example\.net\/file\/md512\?/);
  assert.equal(req19.labels.terabox_expires, '1767791721');
  assert.equal(req19.extra.header.Referer.startsWith('https://www.terabox.app/'), true);
});

test('onError re-signs through the 2.x mutator API, resumes the task and gives up after 3 tries', async () => {
  const calls = [];
  const req2 = {
    url: 'https://cdn.example.net/file/expired',
    labels: {
      terabox: '1',
      terabox_surl: SURL,
      terabox_fsid: '11',
      terabox_name: 'track01.flac',
      terabox_origin: '',
      terabox_expires: '1',
    },
    setUrl: async (u) => {
      calls.push(['setUrl', u]);
      req2.url = u;
    },
    setHeaders: async (h) => calls.push(['setHeaders', h]),
    putLabel: async (k, v) => {
      calls.push(['putLabel', k, v]);
      req2.labels[k] = v;
    },
  };
  let continued = 0;
  const task = { id: 't2', meta: { req: req2 }, continue: async () => continued++ };
  const ctx = { task, error: new Error('403 Forbidden') };

  await handlers.onError(ctx);
  assert.equal(continued, 1);
  assert.match(req2.url, /^https:\/\/cdn\.example\.net\/file\/md511\?/);
  assert.equal(calls.filter((c) => c[0] === 'setHeaders').length, 1);
  assert.equal(req2.labels.terabox_expires, '1767791721');
  assert.equal(storage.get('retry:t2'), '1');

  await handlers.onError(ctx);
  await handlers.onError(ctx);
  await handlers.onError(ctx);
  assert.equal(continued, 3, 'fourth failure is not retried');
  assert.ok(logs.some(([level, msg]) => level === 'warn' && /giving up/.test(msg)));

  await handlers.onDone({ task });
  assert.equal(storage.has('retry:t2'), false);
});

test('onResolve surfaces TeraBox errors as MessageError', async () => {
  const ctx = { req: { url: 'https://www.terabox.com/s/1NoSuchShare0000' } };
  await assert.rejects(
    () => handlers.onResolve(ctx),
    (err) =>
      err instanceof MessageError && /expired, deleted or blocked/.test(err.message) && /fresh link/.test(err.message)
  );
});
