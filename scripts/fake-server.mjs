#!/usr/bin/env node
/**
 * Serves the in-memory fake TeraBox over real HTTP so the compiled bundle can be exercised
 * inside the actual Gopeed engine (see README → "Testing").
 *
 *   node scripts/fake-server.mjs [port]            (default 18080)
 *
 * Then point the extension at it:  mirror = http://127.0.0.1:18080, cookie = ndus=FAKE
 * and paste  https://www.terabox.app/s/1FAKESHARE0000001  into Gopeed.
 *
 * The fake CDN serves a 3 MiB file with Range support but answers 403 to the FIRST link that was
 * signed (gen=1) — exactly what an expired TeraBox link looks like — so the onError → re-sign →
 * continue path gets exercised too.
 */

import http from 'node:http';
import { createFakeTerabox } from '../test/fake-terabox.mjs';

const port = Number(process.argv[2] || 18080);
const base = `http://127.0.0.1:${port}`;
export const SURL = 'FAKESHARE0000001';

const fake = createFakeTerabox({
  surl: SURL,
  tree: [
    {
      name: 'Holiday 2026',
      fs_id: 1,
      children: [
        { name: 'clip-01.mp4', size: 3 * 1024 * 1024, fs_id: 11 },
        { name: 'clip-02.mp4', size: 3 * 1024 * 1024, fs_id: 12 },
      ],
    },
  ],
  dlinkBase: base,
  cdnBase: base,
  liveExpiry: true,
});

const payload = Buffer.alloc(3 * 1024 * 1024);
for (let i = 0; i < payload.length; i++) payload[i] = (i * 31 + 7) & 0xff;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, base);
  const gen = Number(url.searchParams.get('gen') || 0);

  // Fake CDN (the target of the dlink redirect).
  if (url.pathname.startsWith('/file/') && url.searchParams.get('sign') === 'cdn') {
    if (gen < 2) {
      res.writeHead(403, { 'content-type': 'text/plain' });
      return res.end('link expired');
    }
    const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    let start = 0;
    let end = payload.length - 1;
    if (range) {
      if (range[1]) start = Number(range[1]);
      if (range[2]) end = Math.min(Number(range[2]), end);
      res.writeHead(206, {
        'content-type': 'video/mp4',
        'accept-ranges': 'bytes',
        'content-range': `bytes ${start}-${end}/${payload.length}`,
        'content-length': end - start + 1,
      });
    } else {
      res.writeHead(200, { 'content-type': 'video/mp4', 'accept-ranges': 'bytes', 'content-length': payload.length });
    }
    if (req.method === 'HEAD') return res.end();
    return res.end(payload.subarray(start, end + 1));
  }

  // Everything else goes through the fetch-style fake.
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString();
  const headers = {};
  for (const [k, v] of Object.entries(req.headers))
    headers[k === 'cookie' ? 'Cookie' : k] = Array.isArray(v) ? v.join(', ') : v;
  const out = await fake.fetchImpl(url.toString(), { method: req.method, headers, body: body || undefined });
  const outHeaders = [];
  for (const [k, v] of out.headers.entries()) if (k !== 'set-cookie') outHeaders.push([k, v]);
  const cookies = typeof out.headers.getSetCookie === 'function' ? out.headers.getSetCookie() : [];
  res.writeHead(out.status, [...outHeaders, ...cookies.map((c) => ['set-cookie', c])]);
  res.end(Buffer.from(await out.arrayBuffer()));
});

server.listen(port, '127.0.0.1', () => {
  console.log(`fake TeraBox listening on ${base}`);
  console.log(`  share: https://www.terabox.app/s/1${SURL}   mirror: ${base}   cookie: ndus=FAKE`);
});
