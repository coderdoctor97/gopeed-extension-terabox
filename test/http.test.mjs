import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CookieJar, HttpSession, parseCookieString, splitSetCookie } from '../src/http.js';

test('splitSetCookie keeps Expires dates intact', () => {
  const joined =
    'csrfToken=abc; Path=/; Expires=Wed, 21 Oct 2026 07:28:00 GMT, browserid=xyz; Max-Age=86400; Path=/, lang=en';
  assert.deepEqual(splitSetCookie(joined), [
    'csrfToken=abc; Path=/; Expires=Wed, 21 Oct 2026 07:28:00 GMT',
    'browserid=xyz; Max-Age=86400; Path=/',
    'lang=en',
  ]);
});

test('parseCookieString accepts a bare ndus token, a Cookie header and JSON', () => {
  assert.deepEqual(parseCookieString('Y5abcDEF'), [['ndus', 'Y5abcDEF']]);
  assert.deepEqual(parseCookieString('ndus=Y5abc; lang=en;'), [
    ['ndus', 'Y5abc'],
    ['lang', 'en'],
  ]);
  assert.deepEqual(parseCookieString('{"ndus":"Y5abc","browserid":"b"}'), [
    ['ndus', 'Y5abc'],
    ['browserid', 'b'],
  ]);
  assert.deepEqual(parseCookieString(''), []);
});

test('CookieJar absorbs Set-Cookie from both header styles', () => {
  const jar = new CookieJar();
  jar.absorb(
    new Headers([
      ['set-cookie', 'a=1; Path=/'],
      ['set-cookie', 'b=2; Path=/'],
    ])
  );
  assert.equal(jar.header(), 'a=1; b=2');

  const legacy = { get: (n) => (n === 'set-cookie' ? 'c=3; Path=/, d=4' : null) };
  jar.absorb(legacy);
  assert.equal(jar.get('c'), '3');
  assert.equal(jar.get('d'), '4');
  jar.absorb(new Headers([['set-cookie', 'a=deleted; Max-Age=0']]));
  assert.ok(!jar.has('a'));
});

test('HttpSession sends cookies, UA and referer and records cookies back', async () => {
  const seen = [];
  const fetchImpl = async (url, init) => {
    seen.push({ url, init });
    return new Response('{"errno":0}', {
      status: 200,
      headers: [
        ['content-type', 'application/json'],
        ['set-cookie', 'TSID=abc; Path=/'],
      ],
    });
  };
  const session = new HttpSession({ fetchImpl, userAgent: 'UA/1' });
  session.jar.set('ndus', 'tok');
  const res = await session.api('https://www.terabox.app/api/x', { referer: 'https://www.terabox.app/s/1' });
  assert.equal(res.status, 200);
  assert.deepEqual(res.json(), { errno: 0 });
  assert.equal(seen[0].init.headers['User-Agent'], 'UA/1');
  assert.equal(seen[0].init.headers.Cookie, 'ndus=tok');
  assert.equal(seen[0].init.headers.Referer, 'https://www.terabox.app/s/1');
  assert.equal(seen[0].init.headers['X-Requested-With'], 'XMLHttpRequest');
  assert.equal(session.jar.get('TSID'), 'abc');
});

test('HttpSession wraps network failures in HttpError', async () => {
  const session = new HttpSession({
    fetchImpl: async () => {
      throw new Error('ECONNRESET');
    },
  });
  await assert.rejects(() => session.request('https://x.invalid/'), /ECONNRESET/);
});
