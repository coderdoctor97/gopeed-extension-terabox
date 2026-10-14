#!/usr/bin/env node
/**
 * Live smoke test against the real TeraBox API (needs internet).
 *
 *   node scripts/smoke.mjs [share-url] [--pwd=XXXX]
 *
 * Environment:
 *   TERABOX_COOKIE   your `ndus` cookie (or a whole Cookie header). Without it only the
 *                    anonymous part (listing) can be verified; link minting is expected to
 *                    fail with LOGIN_REQUIRED.
 *   TERABOX_API      optional Trauso-compatible resolver base URL to test the worker mode.
 *   TERABOX_MIRROR   optional explicit API mirror, e.g. https://www.1024terabox.com
 */

import { TeraboxClient, TeraboxError } from '../src/terabox.js';
import { layoutFiles } from '../src/layout.js';

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--')) || 'https://www.terabox.app/s/1ZqumlUbwrc32c40geaQsVg';
const pwdArg = (args.find((a) => a.startsWith('--pwd=')) || '').slice(6);
const verbose = args.includes('--verbose');

const logger = {
  debug: (...a) => verbose && console.log('  [debug]', ...a),
  info: (...a) => console.log('  [info]', ...a),
  warn: (...a) => console.log('  [warn]', ...a),
  error: (...a) => console.log('  [error]', ...a),
};

const client = new TeraboxClient({
  cookie: process.env.TERABOX_COOKIE || '',
  apiBase: process.env.TERABOX_API || '',
  mirror: process.env.TERABOX_MIRROR || '',
  logger,
});

const fmt = (n) => (n >= 1 << 20 ? `${(n / (1 << 20)).toFixed(1)} MiB` : `${(n / 1024).toFixed(1)} KiB`);

console.log(
  `\n▶ Resolving ${url} (cookie: ${client.loggedIn ? 'yes' : 'no'}, mode: ${client.apiBase ? 'worker' : 'direct'})`
);
const started = Date.now();
let share;
try {
  share = await client.resolveShare(url, { defaultPassword: pwdArg, maxFiles: 50, maxDepth: 3 });
} catch (err) {
  console.error(`✖ resolve failed: ${err instanceof TeraboxError ? `${err.code}: ${err.toUserMessage()}` : err.stack}`);
  process.exit(1);
}
console.log(
  `✔ ${share.files.length} file(s) via ${share.base} in ${Date.now() - started} ms${share.truncated ? ' (truncated)' : ''}`
);
const layout = layoutFiles(share.files, share);
console.log(`  task folder: ${layout.name || '(none — single file)'}`);
share.files
  .slice(0, 20)
  .forEach((f, i) =>
    console.log(`  - ${f.path}  ${fmt(f.size)}  fs_id=${f.fsId}${layout.paths[i] ? `  → ${layout.paths[i]}/` : ''}`)
  );

console.log(`\n▶ Minting a download link for "${share.files[0].name}"`);
try {
  const link = await client.mintLink(share, share.files[0]);
  console.log(`✔ ${link.url}`);
  console.log(`  headers: ${JSON.stringify(link.headers)}`);
  console.log(`  expires: ${new Date(link.expires * 1000).toISOString()}`);
  const head = await fetch(link.url, { method: 'HEAD', headers: Object.assign({ Range: 'bytes=0-0' }, link.headers) });
  console.log(
    `  HEAD → ${head.status} ${head.headers.get('content-range') || head.headers.get('content-length') || ''} accept-ranges=${head.headers.get('accept-ranges') || '-'}`
  );
  if (head.status === 206 || head.status === 200)
    console.log('✔ CDN answers range requests — Gopeed can download with multiple connections');
  else console.log('✖ unexpected status from CDN');
} catch (err) {
  if (err instanceof TeraboxError && err.code === 'LOGIN_REQUIRED' && !client.loggedIn) {
    console.log(`ℹ expected without a cookie → ${err.code}: ${err.message}`);
    console.log('  set TERABOX_COOKIE=<your ndus cookie> to verify link minting end-to-end');
  } else {
    console.error(`✖ mint failed: ${err instanceof TeraboxError ? `${err.code}: ${err.toUserMessage()}` : err.stack}`);
    process.exit(1);
  }
}
