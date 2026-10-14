import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TeraboxClient,
  TeraboxError,
  extractTokens,
  mapErrno,
  parseExpires,
  toFile,
  mapLimit,
} from '../src/terabox.js';
import { layoutFiles } from '../src/layout.js';
import { createFakeTerabox, createFakeWorker, JS_TOKEN, LOGID } from './fake-terabox.mjs';

const SURL = 'ZqumlUbwrc32c40geaQsVg';
const TREE = [
  { name: 'Movie.mkv', size: 1234, fs_id: 111 },
  {
    name: 'Season 1',
    fs_id: 222,
    children: [
      { name: 'E01.mp4', size: 10, fs_id: 333 },
      { name: 'E02.mp4', size: 20, fs_id: 444 },
      { name: 'Extras', fs_id: 555, children: [{ name: 'bloopers.mp4', size: 5, fs_id: 666 }] },
    ],
  },
];

const quiet = { debug() {}, info() {}, warn() {}, error() {} };

test('extractTokens finds jsToken and dp-logid in the share page', () => {
  const html = `<script>"jsToken":"function%20fn%28a%29%7Bwindow.jsToken%20%3D%20a%7D%3Bfn%28%22${JS_TOKEN}%22%29"</script><a href="/x?dp-logid=${LOGID}&y=1">`;
  const tokens = extractTokens(html);
  assert.equal(tokens.jsToken, JS_TOKEN);
  assert.equal(tokens.logid, LOGID);
  assert.equal(extractTokens('<html>captcha</html>').jsToken, '');
});

test('parseExpires understands epoch and relative forms', () => {
  assert.equal(parseExpires('https://cdn/x?expires=1767791721'), 1767791721);
  assert.equal(parseExpires('https://d.terabox.app/file/x?expires=8h', 1000), 1000 + 8 * 3600);
  assert.equal(parseExpires('https://cdn/x?nothing=1', 1000), 1000 + 6 * 3600);
});

test('mapErrno gives actionable messages', () => {
  assert.equal(mapErrno(0), null);
  assert.equal(mapErrno(-9, '', 'init').code, 'PASSWORD_REQUIRED');
  assert.equal(mapErrno(-9, '', 'verify').code, 'WRONG_PASSWORD');
  assert.equal(mapErrno(2, '', 'download').code, 'LOGIN_REQUIRED');
  assert.equal(mapErrno('400210', 'need verify_v2', 'init').code, 'VERIFICATION_REQUIRED');
  assert.equal(mapErrno(9000).code, 'REGION_BLOCKED');
  assert.match(mapErrno(31337, 'weird').toUserMessage(), /31337/);
});

test('toFile normalises string/number ids and html entities', () => {
  const f = toFile({
    fs_id: '42',
    server_filename: 'a.mp4',
    path: '/dir/a.mp4',
    size: '7',
    isdir: '0',
    dlink: 'https://x?a=1&amp;b=2',
  });
  assert.deepEqual(
    { ...f },
    {
      name: 'a.mp4',
      path: '/dir/a.mp4',
      size: 7,
      isDir: false,
      fsId: '42',
      md5: '',
      category: 0,
      ctime: 0,
      dlink: 'https://x?a=1&b=2',
    }
  );
  assert.equal(toFile({}), null);
});

test('mapLimit preserves order and bounds concurrency', async () => {
  let active = 0;
  let peak = 0;
  const out = await mapLimit([5, 1, 3, 2, 4], 2, async (n) => {
    active++;
    peak = Math.max(peak, active);
    await new Promise((r) => setTimeout(r, n));
    active--;
    return n * 2;
  });
  assert.deepEqual(out, [10, 2, 6, 4, 8]);
  assert.ok(peak <= 2);
});

test('layoutFiles: single file → no folder; folder share → common root', () => {
  const share = { surl: SURL, title: '' };
  assert.deepEqual(layoutFiles([{ path: '/Movie.mkv' }], share), { name: '', paths: [''] });
  assert.deepEqual(layoutFiles([{ path: '/Season 1/E01.mp4' }, { path: '/Season 1/Extras/b.mp4' }], share), {
    name: 'Season 1',
    paths: ['', 'Extras'],
  });
  assert.deepEqual(layoutFiles([{ path: '/Movie.mkv' }, { path: '/Season 1/E01.mp4' }], share), {
    name: `TeraBox_${SURL}`,
    paths: ['', 'Season 1'],
  });
});

test('resolveShare walks folders anonymously and mintLink needs a login', async () => {
  const fake = createFakeTerabox({ surl: SURL, tree: TREE });
  const anon = new TeraboxClient({ fetchImpl: fake.fetchImpl, logger: quiet });
  const share = await anon.resolveShare(`https://www.terabox.com/s/1${SURL}`, { maxFiles: 50, maxDepth: 5 });
  assert.equal(share.base, 'https://www.terabox.com');
  assert.deepEqual(
    share.files.map((f) => f.path),
    ['/Movie.mkv', '/Season 1/E01.mp4', '/Season 1/E02.mp4', '/Season 1/Extras/bloopers.mp4']
  );
  assert.equal(share.loggedIn, false);
  await assert.rejects(
    () => anon.mintLink(share, share.files[0]),
    (err) => err instanceof TeraboxError && err.code === 'LOGIN_REQUIRED' && /ndus/.test(err.toUserMessage())
  );
  // The share page was fetched first and cookies were replayed — the real backend returns 400210 otherwise.
  assert.equal(fake.state.calls[0], 'GET www.terabox.com/sharing/link');
  assert.ok(fake.state.calls.includes('GET www.terabox.com/api/shorturlinfo'));
});

test('a logged-in client mints a CDN link, resolving the dlink redirect', async () => {
  const fake = createFakeTerabox({ surl: SURL, tree: TREE, staleTokenOnce: true });
  const client = new TeraboxClient({ cookie: 'ndus=TOKEN123', fetchImpl: fake.fetchImpl, logger: quiet });
  const share = await client.resolveShare({ surl: SURL, origin: 'https://terabox.app' });
  assert.equal(share.base, 'https://www.terabox.app');
  const link = await client.mintLink(share, share.files[0]);
  assert.equal(link.url, 'https://cdn.example.net/file/md5111?expires=1767791721&sign=cdn&gen=1');
  assert.equal(link.expires, 1767791721);
  assert.equal(link.headers['User-Agent'].includes('Chrome'), true);
  assert.equal(link.headers.Referer, share.pageUrl);
  assert.ok(!link.headers.Cookie, 'CDN URL must not carry the cookie');
  assert.equal(fake.state.mainFetched, 1, 'stale jsToken was refreshed once through /main');
  assert.ok(fake.state.calls.includes('HEAD d.terabox.app/file/md5111'));
});

test('folder depth and maxFiles limits are honoured', async () => {
  const fake = createFakeTerabox({ surl: SURL, tree: TREE });
  const client = new TeraboxClient({ fetchImpl: fake.fetchImpl, logger: quiet });
  const shallow = await client.resolveShare({ surl: SURL }, { maxDepth: 1 });
  assert.deepEqual(
    shallow.files.map((f) => f.name),
    ['Movie.mkv', 'E01.mp4', 'E02.mp4']
  );
  const capped = await client.resolveShare({ surl: SURL }, { maxFiles: 2 });
  assert.equal(capped.files.length, 2);
  assert.equal(capped.truncated, true);
});

test('password protected shares are verified and the sekey is replayed', async () => {
  const fake = createFakeTerabox({ surl: SURL, pwd: 'ab12', tree: TREE });
  const client = new TeraboxClient({ cookie: 'ndus=TOKEN123', fetchImpl: fake.fetchImpl, logger: quiet });
  await assert.rejects(
    () => client.resolveShare({ surl: SURL }),
    (err) => err.code === 'PASSWORD_REQUIRED'
  );
  await assert.rejects(
    () => client.resolveShare({ surl: SURL, pwd: 'nope' }),
    (err) => err.code === 'WRONG_PASSWORD'
  );
  const share = await client.resolveShare(`https://1024terabox.com/s/1${SURL}?pwd=ab12`);
  assert.equal(share.files.length, 4);
  assert.equal(share.meta.sekey, 'RANDSK/key');
  const link = await client.mintLink(share, share.files[1]);
  assert.match(link.url, /^https:\/\/cdn\.example\.net\//);
  const viaDefault = await client.resolveShare({ surl: SURL }, { defaultPassword: 'ab12' });
  assert.equal(viaDefault.files.length, 4);
});

test('a walled mirror is skipped in favour of the next one', async () => {
  const fake = createFakeTerabox({ surl: SURL, tree: TREE, walledHosts: ['www.terabox.com'] });
  const client = new TeraboxClient({ fetchImpl: fake.fetchImpl, logger: quiet });
  const share = await client.resolveShare(`https://www.terabox.com/s/1${SURL}`);
  assert.equal(share.base, 'https://www.terabox.app');
});

test('an explicit mirror setting wins', async () => {
  const fake = createFakeTerabox({ surl: SURL, tree: TREE });
  const client = new TeraboxClient({ fetchImpl: fake.fetchImpl, logger: quiet, mirror: 'https://www.1024tera.com' });
  const share = await client.resolveShare(`https://www.terabox.com/s/1${SURL}`);
  assert.equal(share.base, 'https://www.1024tera.com');
});

test('refreshLink re-signs a single file id', async () => {
  const fake = createFakeTerabox({ surl: SURL, tree: TREE });
  const client = new TeraboxClient({ cookie: 'TOKEN123', fetchImpl: fake.fetchImpl, logger: quiet });
  const link = await client.refreshLink({ surl: SURL, fsId: '666', origin: 'https://www.terabox.app' });
  assert.equal(link.url, 'https://cdn.example.net/file/md5666?expires=1767791721&sign=cdn&gen=1');
  assert.ok(!fake.state.calls.includes('GET www.terabox.app/share/list'), 'refresh must not walk the folder tree');
});

test('dead / unknown shares give a NOT_FOUND error without trying every mirror', async () => {
  const fake = createFakeTerabox({ surl: SURL, tree: TREE });
  const client = new TeraboxClient({ fetchImpl: fake.fetchImpl, logger: quiet });
  await assert.rejects(
    () => client.resolveShare({ surl: 'DoesNotExist1234' }),
    (err) => err.code === 'NOT_FOUND'
  );
  assert.equal(fake.state.calls.filter((c) => c.endsWith('/api/shorturlinfo')).length, 1);
});

test('worker (Trauso-compatible) mode flattens nested children and mints via get-download', async () => {
  const worker = createFakeWorker({ surl: SURL, tree: TREE });
  const client = new TeraboxClient({
    apiBase: 'https://my-worker.example.workers.dev/',
    fetchImpl: worker.fetchImpl,
    logger: quiet,
  });
  const share = await client.resolveShare(`https://terabox.app/s/1${SURL}`);
  assert.equal(share.mode, 'api');
  assert.deepEqual(
    share.files.map((f) => f.path),
    ['/Movie.mkv', '/Season 1/E01.mp4', '/Season 1/E02.mp4', '/Season 1/Extras/bloopers.mp4']
  );
  const link = await client.mintLink(share, share.files[3]);
  assert.equal(link.url, 'https://cdn.example.net/w/666?expires=1767791721');
  assert.deepEqual(worker.calls, [
    'GET /api/get-info-new',
    'GET /api/get-info',
    'POST /api/get-downloadp',
    'POST /api/get-download',
  ]);
});
