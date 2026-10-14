#!/usr/bin/env node
/**
 * Writes your repository URL into manifest.json (homepage + repository.url) and package.json.
 * Gopeed uses `repository.url` to check for / install updates, so run this once before publishing:
 *
 *   npm run set-repo -- https://github.com/<account>/gopeed-extension-terabox
 */

import { readFileSync, writeFileSync } from 'node:fs';

const raw = process.argv[2];
if (!raw) {
  console.error('usage: npm run set-repo -- https://github.com/<account>/gopeed-extension-terabox');
  process.exit(2);
}
const url = raw
  .trim()
  .replace(/\.git$/, '')
  .replace(/\/+$/, '');
if (!/^https?:\/\/[^/\s]+\/[^/\s]+\/[^/\s]+$/.test(url)) {
  console.error(`"${raw}" does not look like a repository URL (expected https://host/account/repo)`);
  process.exit(2);
}

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const ordered = {};
for (const key of ['name', 'author', 'title', 'description', 'icon', 'version'])
  if (key in manifest) ordered[key] = manifest[key];
ordered.homepage = url;
ordered.repository = { url };
for (const key of Object.keys(manifest)) if (!(key in ordered)) ordered[key] = manifest[key];
writeFileSync('manifest.json', JSON.stringify(ordered, null, 2) + '\n');

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
pkg.homepage = url;
pkg.repository = { type: 'git', url: `${url}.git` };
pkg.bugs = { url: `${url}/issues` };
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

console.log(`manifest.json + package.json now point to ${url}`);
console.log(`Install link for Gopeed → Extensions: ${url}`);
