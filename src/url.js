/**
 * TeraBox share-link parsing.
 *
 * TeraBox publishes the same share under many domains and two URL shapes:
 *   https://<host>/s/1AbCdEf…            (the leading "1" is a routing marker)
 *   https://<host>/sharing/link?surl=AbCdEf…
 * Everything downstream (and the TeraBox API itself) wants the bare id.
 */

/** Every domain TeraBox (and its white-label mirrors) is known to publish share links on. */
export const SHARE_DOMAINS = [
  'terabox.com',
  'terabox.app',
  'terabox.fun',
  'terabox.club',
  'teraboxapp.com',
  'teraboxlink.com',
  'teraboxshare.com',
  'teraboxurl.com',
  'terasharelink.com',
  'terafileshare.com',
  'teraboxdownloader.com',
  '1024tera.com',
  '1024tera.cn',
  '1024terabox.com',
  '4funbox.com',
  '4funbox.co',
  'mirrobox.com',
  'nephobox.com',
  'momerybox.com',
  'tibibox.com',
  'freeterabox.com',
  'gibibox.com',
  'goaibox.com',
  'dubox.com',
];

/** Hosts worth trying for API calls when the share host itself refuses (they share one backend). */
export const API_FALLBACK_HOSTS = [
  'https://www.terabox.app',
  'https://www.terabox.com',
  'https://www.1024terabox.com',
  'https://www.1024tera.com',
  'https://www.teraboxapp.com',
];

/** Chrome match patterns for manifest.json (both bare and sub-domain forms are needed). */
export function buildMatchPatterns() {
  const patterns = [];
  for (const domain of SHARE_DOMAINS) {
    patterns.push(`*://${domain}/*`);
    patterns.push(`*://*.${domain}/*`);
  }
  return patterns;
}

const SURL_RE = /^[A-Za-z0-9_-]{6,64}$/;

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return value;
  }
}

/**
 * Minimal URL splitter (does not depend on the WHATWG URL class being present in the runtime).
 */
export function splitUrl(raw) {
  const text = String(raw || '').trim();
  const m = text.match(/^(?:([a-z][a-z0-9+.-]*):)?\/\/([^/?#]+)([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/i);
  if (!m) return null;
  const host = m[2].toLowerCase().replace(/:\d+$/, '');
  const query = {};
  if (m[4]) {
    for (const pair of m[4].split('&')) {
      if (!pair) continue;
      const idx = pair.indexOf('=');
      const key = safeDecode(idx >= 0 ? pair.slice(0, idx) : pair).trim();
      const value = idx >= 0 ? safeDecode(pair.slice(idx + 1).replace(/\+/g, ' ')) : '';
      if (key && !(key in query)) query[key] = value;
    }
  }
  return {
    scheme: (m[1] || 'https').toLowerCase(),
    host,
    path: m[3] || '/',
    query,
    hash: m[5] || '',
    origin: `${(m[1] || 'https').toLowerCase()}://${m[2]}`,
  };
}

/** True when the host is a TeraBox share domain (or a sub-domain of one). */
export function isTeraboxHost(host) {
  const h = String(host || '').toLowerCase();
  return SHARE_DOMAINS.some((d) => h === d || h.endsWith('.' + d));
}

/**
 * Parses any TeraBox share link into its bare short id, optional password and origin.
 * Returns null when the URL is not a share link.
 *
 * @param {string} raw
 * @returns {{surl: string, pwd: string, origin: string, host: string, path: string} | null}
 */
export function parseShareUrl(raw) {
  let text = String(raw || '').trim();
  if (!text) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) text = 'https://' + text;
  const url = splitUrl(text);
  if (!url) return null;

  let surl = '';
  // Legacy form: /sharing/link?surl=AbCdEf (bare id, no routing marker).
  if (url.query.surl) {
    surl = url.query.surl.trim();
  } else {
    // Modern form: /s/1AbCdEf — the leading "1" is not part of the id.
    const m = url.path.match(/\/s\/([A-Za-z0-9_-]+)/);
    if (m) {
      surl = m[1];
      if (surl.length > 8 && surl.charAt(0) === '1') surl = surl.slice(1);
    }
  }
  surl = surl.replace(/[/?#]+$/, '');
  if (!surl || !SURL_RE.test(surl)) return null;

  const pwd = (url.query.pwd || url.query.password || url.query.code || '').trim();
  return { surl, pwd, origin: url.origin, host: url.host, path: url.path };
}

/** Builds a query string from an object (skips undefined/null values). */
export function toQuery(params) {
  const parts = [];
  for (const key of Object.keys(params)) {
    const value = params[key];
    if (value === undefined || value === null) continue;
    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(value)));
  }
  return parts.join('&');
}
