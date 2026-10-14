# Satya TeraBox Downloader — Gopeed extension

[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-blue)](.github/workflows/ci.yml)
[![Gopeed](https://img.shields.io/badge/Gopeed-%E2%89%A5%201.9-success)](https://gopeed.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A [Gopeed](https://gopeed.com) extension that turns a **TeraBox share link** into direct, multi‑connection downloads.

Paste any share link (`terabox.com`, `terabox.app`, `1024terabox.com`, `1024tera.com`, `teraboxapp.com`,
`teraboxlink.com`, `teraboxshare.com`, `terasharelink.com`, `terafileshare.com`, `4funbox`, `mirrobox`, `nephobox`,
`momerybox`, `tibibox`, `freeterabox`, `gibibox`, `goaibox`, `dubox` …) into Gopeed and the extension:

1. resolves the share — single files **and folders** (recursively), password protected shares included;
2. signs a direct download link for every file and follows TeraBox's redirector, so Gopeed talks straight to the CDN
   (range requests work → all the connections you configured in Gopeed are used);
3. keeps the links alive — they are re‑signed automatically before they expire (`onStart`) and whenever a download
   fails on an expired link (`onError` → re‑sign → resume, up to 3 times per task).

The download logic follows the reverse‑engineered TeraBox web flow used by
[Trauso](https://github.com/aruxyz/trauso) and its predecessors
([Terabox‑DL](https://github.com/maiquocthinh/Terabox-DL), [download24](https://github.com/abhi-dhakar/download24)),
re‑implemented in plain JavaScript for Gopeed's embedded JS engine. **No third‑party resolver service is involved** —
the extension talks to TeraBox only. (The worker Trauso used, `terabox.hnn.workers.dev`, is offline; a compatible
self‑hosted resolver can still be plugged in through the *External resolver API* setting.)

> **You need a TeraBox login cookie.** TeraBox hands out download links (`/share/download`) only to signed‑in
> sessions — anonymous requests get `errno 2`. Listing a share works without a cookie, downloading does not.
> See [Getting your cookie](#getting-your-cookie).

---

## Install

### Option A — from the GitHub link (recommended)

1. In Gopeed open **Extensions** (puzzle‑piece icon in the sidebar).
2. Paste the repository link into the install box and click **Install**:

   ```
   https://github.com/<account>/gopeed-extension-terabox
   ```

   (Replace `<account>` with the GitHub account this repository is published under — see
   [Publish to GitHub](#publish-to-github). Gopeed clones the repository and loads `manifest.json` +
   `release/index.js` from it; later versions can be installed with the **Update** button.)

### Option B — manual install from the ZIP / a local folder

1. Unzip `gopeed-extension-terabox-v1.0.0.zip` somewhere permanent (Gopeed reads the folder every time).
2. In Gopeed open **Extensions** and click the **Install** button **five times** — developer mode switches on and an
   **Install from local directory** button appears.
3. Click it and select the unzipped `gopeed-extension-terabox` folder (the one that contains `manifest.json`).

Gopeed ≥ 1.9 is supported: the extension feature‑detects the request mutators that appeared in Gopeed 2.0 and falls back
to the 1.9 behaviour otherwise.

## Setup

Open **Extensions → Satya TeraBox Downloader → Settings**:

| Setting                            | Default | What it does                                                                                                                                       |
| ---------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TeraBox cookie (ndus)**          | _empty_ | Your `ndus` login cookie (a whole `Cookie:` header line is accepted too). **Required for downloading.**                                            |
| **Default share password**         | _empty_ | Used for password protected shares when the link has no `?pwd=` parameter.                                                                         |
| **API mirror**                     | `auto`  | `auto` = use the domain of the pasted link, then fall back to `www.terabox.app`, `www.terabox.com`, `www.1024terabox.com`, … Pick one if needed.   |
| **External resolver API**          | _empty_ | Base URL of a self‑hosted Trauso/Terabox‑DL compatible worker (`/api/get-info`, `/api/get-download`). Leave empty for the direct (cookie) mode.    |
| **Max files per share**            | `200`   | Safety limit for huge folders.                                                                                                                     |
| **Folder depth**                   | `5`     | How many levels of sub‑folders are walked.                                                                                                         |
| **User‑Agent**                     | _empty_ | Override the Chrome User‑Agent used towards TeraBox.                                                                                               |
| **Chrome TLS fingerprint**         | `true`  | Ask Gopeed to present a Chrome TLS fingerprint to TeraBox (helps against the anti‑bot wall, `errno 400210`).                                       |

Then raise the connection count in Gopeed (**Settings → Download → Connections**; 16–32 works well with TeraBox's CDN)
and paste a share link into the **Create task** box as usual.

### Getting your cookie

1. Log in at <https://www.terabox.app> in your browser.
2. Open DevTools (`F12`) → **Application** (Chrome/Edge) or **Storage** (Firefox) → **Cookies** → `https://www.terabox.app`.
3. Copy the **value** of the cookie named `ndus` and paste it into the *TeraBox cookie* setting.

The cookie is only ever sent to TeraBox hosts. It is **not** attached to the CDN download requests and it is **not**
written into the task metadata (only the share id, file id and link expiry are stored as task labels so links can be
re‑signed later). If TeraBox invalidates the cookie the extension tells you to refresh it.

## Publish to GitHub

The repository is ready to push — the compiled bundle (`release/index.js`) is committed on purpose because Gopeed
installs straight from git.

```bash
cd gopeed-extension-terabox
npm run set-repo -- https://github.com/<account>/gopeed-extension-terabox   # fills homepage + repository.url (used for updates)
git init -b main
git add -A
git commit -m "Satya TeraBox Downloader 1.0.0"
git remote add origin https://github.com/<account>/gopeed-extension-terabox.git
git push -u origin main
```

Create the repository on GitHub first (public, empty — no README). Add the topic `gopeed-extension` so people can find it.
After the push, `https://github.com/<account>/gopeed-extension-terabox` is the link to paste into Gopeed → Extensions.
The included GitHub Actions workflow runs lint, tests, build and verifies the committed bundle on every push.

Releasing a new version: edit `src/`, bump `version` in `manifest.json` (+ `package.json`), `npm run build`, commit, push —
Gopeed's **Update** button picks it up.

## What happens under the hood

```
share link ──▶ GET  <mirror>/sharing/link?surl=…        session cookies + anti-bot jsToken / dp-logid
           ──▶ POST <mirror>/share/verify               (password shares) → randsk / sekey
           ──▶ GET  <mirror>/api/shorturlinfo           shareid, uk, sign, timestamp + root listing
           ──▶ GET  <mirror>/share/list?dir=…           folders, recursively, 100 entries per page
           ──▶ GET  <mirror>/share/download?fid_list=…  one signed dlink per file   (needs the ndus cookie)
           ──▶ HEAD <dlink>  (redirect: manual)         302 → final CDN URL, ~8 h validity, Range capable
ctx.res = { name: <folder>, files: [{ name, path, size, req: { url: <cdn>, extra: { header }, labels } }] }
```

- `onResolve` runs the whole flow (links for all files are minted up‑front, 4 at a time).
- `onStart` checks the `terabox_expires` label; if the link expires in < 15 min it is re‑signed before the download
  (re)starts.
- `onError` re‑signs the link and calls `task.continue()` (max 3 times per task, counter kept in `gopeed.storage`).
- Stale anti‑bot tokens (`errno -6 / 4000020 / 400141`) are refreshed from `/main` and the call retried once; a
  verification wall (`errno 400210`) makes the extension try the next mirror.

## Error messages you may see

| Message                                              | Meaning / fix                                                                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| _TeraBox refused to hand out a download link…_       | No / expired cookie. Set the `ndus` cookie (see above).                                                                         |
| _This TeraBox share is password protected._          | Append `?pwd=XXXX` to the link or set the default password setting.                                                             |
| _TeraBox rejected the share password._               | Wrong `pwd`.                                                                                                                    |
| _…verification wall instead of the share (400210)._  | Your IP is being challenged. A logged‑in cookie usually fixes it; otherwise retry later, pick another mirror or use a proxy.    |
| _This TeraBox share is expired, deleted or blocked._ | `errno 105/-10/115/…` — the share is gone; ask for a fresh link.                                                                 |
| _TeraBox is not available from your region (9000)._  | Configure a proxy in Gopeed.                                                                                                    |

Detailed logs: `logs/extension.log` in Gopeed's data directory (`debug` lines are only written for extensions installed
in developer mode).

## Development

```bash
npm install
npm test            # unit tests – fake TeraBox, no network needed
npm run build       # → release/index.js (commit it; Gopeed loads the bundle straight from git)
npm run dev         # rebuild on change
npm run lint
npm run check-bundle
npm run zip         # → ../gopeed-extension-terabox-v<version>.zip (for manual installs)
```

Project layout:

```
manifest.json            extension manifest (events, URL match patterns, settings)
src/index.js             Gopeed event handlers (onResolve / onStart / onError / onDone)
src/terabox.js           TeraBox client: session, password verify, listing, link minting, errno mapping
src/http.js              fetch wrapper with cookie jar (works on Gopeed 1.9 XHR polyfill, Gopeed 2 fetch and Node)
src/url.js               share-link parsing, domain list, manifest match patterns
src/layout.js            folder / sub-path layout of the resolved files
release/index.js         compiled bundle (webpack + babel, async/await kept native for goja)
test/                    node:test suites + an in-memory fake TeraBox
scripts/smoke.mjs        live check against the real TeraBox API
scripts/fake-server.mjs  the fake TeraBox over HTTP (for end-to-end runs inside the real Gopeed engine)
scripts/harness/         Go program that drives the extension through Gopeed's downloader
scripts/set-repo.mjs     writes your repository URL into manifest.json / package.json
.github/workflows/ci.yml lint + test + build + bundle freshness check
```

### Testing against the real TeraBox

```bash
node scripts/smoke.mjs                                     # anonymous: listing works, minting reports LOGIN_REQUIRED
TERABOX_COOKIE='ndus=…' node scripts/smoke.mjs <share-url> # with a cookie: mints a link and HEADs the CDN
```

### End‑to‑end inside the real Gopeed engine

`scripts/harness/main.go` installs the extension folder into a throw‑away Gopeed downloader (same goja runtime, same
Go `fetch`, same task pipeline as the desktop app), resolves a URL and optionally downloads the first file:

```bash
git clone --depth 1 https://github.com/GopeedLab/gopeed.git
mkdir -p gopeed/cmd/terabox-harness && cp scripts/harness/main.go gopeed/cmd/terabox-harness/
(cd gopeed && go build -o ../harness ./cmd/terabox-harness)

# against the fake TeraBox (exercises resolve, onStart, the 403 → onError → re-sign → continue path):
node scripts/fake-server.mjs 18080 &
TERABOX_MIRROR=http://127.0.0.1:18080 TERABOX_COOKIE=ndus=FAKE \
  ./harness . "https://www.terabox.app/s/1FAKESHARE0000001" --download

# against the real TeraBox:
TERABOX_COOKIE='ndus=…' ./harness . "https://www.terabox.app/s/1XXXXXXXXXXXXXXXXXXXXXX" --download
```

## Limitations

- A logged‑in cookie is mandatory for downloading — this is a TeraBox restriction, not an extension one. Free accounts
  work; TeraBox may throttle them or cap very large files.
- The extension cannot change the connection count of a task; set it globally in Gopeed.
- TeraBox changes its API without notice. If something breaks, check `extension.log` and the `errno` in the message.

## Credits

- [aruxyz/trauso](https://github.com/aruxyz/trauso) — reference for the share/download flow and the resolver API contract
- [maiquocthinh/Terabox-DL](https://github.com/maiquocthinh/Terabox-DL), [abhi-dhakar/download24](https://github.com/abhi-dhakar/download24) — direct TeraBox flow details
- [GopeedLab/gopeed-extension-samples](https://github.com/GopeedLab/gopeed-extension-samples) — extension scaffolding

## License

MIT © Satya
