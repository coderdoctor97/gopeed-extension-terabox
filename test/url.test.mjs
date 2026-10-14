import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildMatchPatterns, isTeraboxHost, parseShareUrl, splitUrl, toQuery } from '../src/url.js';

test('parseShareUrl understands every published link shape', () => {
  const cases = [
    ['https://www.terabox.com/s/1ZqumlUbwrc32c40geaQsVg', 'ZqumlUbwrc32c40geaQsVg', ''],
    ['https://terabox.app/s/1ZqumlUbwrc32c40geaQsVg?pwd=ab12', 'ZqumlUbwrc32c40geaQsVg', 'ab12'],
    ['https://www.terabox.app/sharing/link?surl=ZqumlUbwrc32c40geaQsVg', 'ZqumlUbwrc32c40geaQsVg', ''],
    ['https://1024terabox.com/s/1GV28I3ea5rR_oR_f6LZGwQ', 'GV28I3ea5rR_oR_f6LZGwQ', ''],
    ['https://teraboxlink.com/s/1G1XrCeqCRYjd7y2G8-5l4Q', 'G1XrCeqCRYjd7y2G8-5l4Q', ''],
    ['terabox.com/s/1ZqumlUbwrc32c40geaQsVg', 'ZqumlUbwrc32c40geaQsVg', ''],
    [
      'https://www.terabox.com/wap/share/filelist?surl=ZqumlUbwrc32c40geaQsVg&password=zz99',
      'ZqumlUbwrc32c40geaQsVg',
      'zz99',
    ],
    ['https://www.terabox.com/s/1ZqumlUbwrc32c40geaQsVg#list/path=%2F', 'ZqumlUbwrc32c40geaQsVg', ''],
  ];
  for (const [input, surl, pwd] of cases) {
    const parsed = parseShareUrl(input);
    assert.ok(parsed, `should parse ${input}`);
    assert.equal(parsed.surl, surl, input);
    assert.equal(parsed.pwd, pwd, input);
  }
});

test('parseShareUrl rejects non-share URLs', () => {
  assert.equal(parseShareUrl('https://www.terabox.com/main'), null);
  // The host is deliberately not checked here: Gopeed only calls onResolve for hosts listed in manifest.json.
  assert.equal(parseShareUrl('https://example.com/s/1abcdefghij').surl, 'abcdefghij');
  assert.equal(parseShareUrl(''), null);
  assert.equal(parseShareUrl('not a url'), null);
});

test('splitUrl does not need the WHATWG URL class', () => {
  const parts = splitUrl('https://d.terabox.app/file/abc?fid=1-2&expires=8h&sign=x%2Fy#frag');
  assert.equal(parts.host, 'd.terabox.app');
  assert.equal(parts.path, '/file/abc');
  assert.deepEqual(parts.query, { fid: '1-2', expires: '8h', sign: 'x/y' });
  assert.equal(parts.origin, 'https://d.terabox.app');
});

test('isTeraboxHost covers mirrors and sub-domains', () => {
  assert.ok(isTeraboxHost('www.terabox.com'));
  assert.ok(isTeraboxHost('1024terabox.com'));
  assert.ok(isTeraboxHost('dm.terabox.app'));
  assert.ok(!isTeraboxHost('terabox.com.evil.example'));
  assert.ok(!isTeraboxHost('example.com'));
});

test('toQuery encodes and skips empty values', () => {
  assert.equal(toQuery({ a: '1 2', b: undefined, c: null, d: '[1]', e: '' }), 'a=1%202&d=%5B1%5D&e=');
});

test('manifest.json match patterns stay in sync with SHARE_DOMAINS', () => {
  const manifest = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));
  const resolve = manifest.scripts.find((s) => s.event === 'onResolve');
  assert.deepEqual(resolve.match.urls, buildMatchPatterns());
  for (const event of ['onStart', 'onError', 'onDone']) {
    const script = manifest.scripts.find((s) => s.event === event);
    assert.ok(script, `${event} script present`);
    assert.deepEqual(script.match.labels, ['terabox']);
  }
  assert.ok(manifest.name && manifest.title && manifest.version, 'required manifest fields');
  for (const s of manifest.scripts) assert.equal(s.entry, 'release/index.js');
});
