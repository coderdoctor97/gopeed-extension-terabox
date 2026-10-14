# Changelog

## 1.0.0 — 2026-10-14

- First release.
- Resolves TeraBox share links (all first-party domains and white-label mirrors), single files and folders
  (recursive, paginated), password protected shares (`?pwd=` or default password setting).
- Signs direct CDN download links (`share/download` + redirector follow) so Gopeed can use multiple connections.
- Re-signs links before they expire (`onStart`) and after a failed download (`onError` → `task.continue()`, 3 tries).
- Mirror fallback, stale `jsToken` refresh, actionable error messages for every known TeraBox `errno`.
- Optional "worker" mode for self-hosted Trauso / Terabox-DL compatible resolver APIs.
- Works on Gopeed 1.9.x and 2.x.
