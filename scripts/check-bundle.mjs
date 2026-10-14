#!/usr/bin/env node
/**
 * Fails when release/index.js is older than the sources or does not exist.
 * Used by CI so a pull request can never ship a stale bundle (Gopeed loads release/index.js straight from git).
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const bundle = 'release/index.js';
if (!existsSync(bundle)) {
  console.error(`${bundle} is missing — run "npm run build" and commit the result`);
  process.exit(1);
}
const bundleTime = statSync(bundle).mtimeMs;
const stale = readdirSync('src')
  .map((f) => join('src', f))
  .filter((f) => statSync(f).mtimeMs > bundleTime + 1000);
if (stale.length) {
  console.error(`sources newer than ${bundle}: ${stale.join(', ')} — run "npm run build" and commit the result`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
for (const script of manifest.scripts) {
  if (!existsSync(script.entry)) {
    console.error(`manifest entry ${script.entry} (${script.event}) does not exist`);
    process.exit(1);
  }
}
if (!existsSync(manifest.icon)) {
  console.error(`manifest icon ${manifest.icon} does not exist`);
  process.exit(1);
}
const text = readFileSync(bundle, 'utf8');
for (const needle of ['gopeed.events.onResolve', 'gopeed.events.onStart', 'gopeed.events.onError']) {
  if (!text.includes(needle)) {
    console.error(`${bundle} does not register ${needle}`);
    process.exit(1);
  }
}
console.log(
  `${bundle} OK (${(text.length / 1024).toFixed(1)} KiB, ${manifest.scripts.length} scripts, icon ${manifest.icon})`
);
