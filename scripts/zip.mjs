#!/usr/bin/env node
/**
 * Packages the repository (without node_modules/.git) into ../gopeed-extension-terabox-v<version>.zip.
 * The archive unzips to a folder that can be installed directly through Gopeed's developer mode
 * (Extensions → click "Install" five times → "Install from local directory").
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const root = resolve(process.cwd());
const folder = basename(root);
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const out = resolve(root, '..', `${folder}-v${version}.zip`);

execFileSync(
  'zip',
  [
    '-r',
    '-q',
    '-X',
    out,
    folder,
    '-x',
    `${folder}/node_modules/*`,
    `${folder}/.git/*`,
    `${folder}/.DS_Store`,
    `${folder}/*.log`,
  ],
  { cwd: resolve(root, '..'), stdio: 'inherit' }
);
console.log(`wrote ${out}`);
