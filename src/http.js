/**
 * Small HTTP layer on top of the runtime's `fetch`.
 *
 * It works in three runtimes with slightly different fetch implementations:
 *   - Gopeed 1.9.x  (whatwg-fetch polyfill over an XMLHttpRequest implemented in Go)
 *   - Gopeed 2.x    (native fetch implementation in Go)
 *   - Node.js 18+   (used by the unit / smoke tests)
 *
 * Responsibilities: a cookie jar (TeraBox hands out session cookies that must be replayed),
 * browser-like default headers, timeouts and tolerant JSON parsing.
 */

export const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const COOKIE_TOKEN = /^[A-Za-z0-9!#$%&'*+.^_`|~-]+$/;

/**
 * Splits a (possibly comma-joined) Set-Cookie header value into individual cookie strings.
 * Only splits on commas that are followed by a `name=` token, so `Expires=Wed, 21 Oct …` survives.
 */
export function splitSetCookie(value) {
  const text = String(value || '');
  if (!text) return [];
  const out = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== ',') continue;
    const rest = text.slice(i + 1).replace(/^\s+/, '');
    const eq = rest.indexOf('=');
    if (eq <= 0) continue;
    const name = rest.slice(0, eq);
    if (!COOKIE_TOKEN.test(name) || /\s/.test(name)) continue;
    out.push(text.slice(start, i));
    start = i + 1;
  }
  out.push(text.slice(start));
  return out.map((s) => s.trim()).filter(Boolean);
}

/** Parses a `Cookie:` header / bare `ndus` token / JSON object into [name, value] pairs. */
export function parseCookieString(raw) {
  const pairs = [];
  const text = String(raw || '').trim();
  if (!text) return pairs;

  if (text.charAt(0) === '{') {
    try {
      const obj = JSON.parse(text);
      for (const key of Object.keys(obj)) {
        if (obj[key] !== null && obj[key] !== undefined) pairs.push([key, String(obj[key])]);
      }
      return pairs;
    } catch (e) {
      /* fall through */
    }
  }

  if (text.indexOf('=') >= 0) {
    for (const part of text.split(';')) {
      const idx = part.indexOf('=');
      if (idx <= 0) continue;
      const name = part.slice(0, idx).trim();
      const value = part.slice(idx + 1).trim();
      if (name) pairs.push([name, value]);
    }
    return pairs;
  }

  // A bare token: assume it is the `ndus` login cookie.
  pairs.push(['ndus', text]);
  return pairs;
}

export class CookieJar {
  constructor() {
    this.map = new Map();
  }

  set(name, value) {
    if (!name) return;
    if (value === undefined || value === null || value === '' || /^(deleted|expired)$/i.test(value)) {
      this.map.delete(name);
    } else {
      this.map.set(name, String(value));
    }
  }

  get(name) {
    return this.map.get(name);
  }

  has(name) {
    return this.map.has(name);
  }

  importCookieString(raw) {
    for (const [name, value] of parseCookieString(raw)) this.set(name, value);
    return this;
  }

  /** Records every Set-Cookie header of a response. */
  absorb(headers) {
    if (!headers) return;
    let lines = [];
    try {
      if (typeof headers.getSetCookie === 'function') {
        lines = headers.getSetCookie() || [];
      }
    } catch (e) {
      lines = [];
    }
    if (!lines.length) {
      let joined = null;
      try {
        joined = headers.get('set-cookie');
      } catch (e) {
        joined = null;
      }
      if (joined) lines = splitSetCookie(joined);
    }
    for (const line of lines) {
      const pair = String(line).split(';')[0];
      const idx = pair.indexOf('=');
      if (idx <= 0) continue;
      this.set(pair.slice(0, idx).trim(), pair.slice(idx + 1).trim());
    }
  }

  header() {
    const parts = [];
    this.map.forEach((value, name) => parts.push(`${name}=${value}`));
    return parts.join('; ');
  }

  get size() {
    return this.map.size;
  }

  clone() {
    const jar = new CookieJar();
    this.map.forEach((value, name) => jar.map.set(name, value));
    return jar;
  }
}

export class HttpError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'HttpError';
    this.cause = cause;
  }
}

function withTimeout(promise, ms, label) {
  if (!(ms > 0) || typeof setTimeout !== 'function') return promise;
  let timer = null;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new HttpError(`${label} timed out after ${Math.round(ms / 1000)}s`)), ms);
  });
  return Promise.race([promise, timeout]).then(
    (value) => {
      if (timer && typeof clearTimeout === 'function') clearTimeout(timer);
      return value;
    },
    (err) => {
      if (timer && typeof clearTimeout === 'function') clearTimeout(timer);
      throw err;
    }
  );
}

/**
 * HTTP session: cookie jar + default headers + fetch wrapper.
 */
export class HttpSession {
  /**
   * @param {{userAgent?: string, timeoutMs?: number, logger?: any, fetchImpl?: Function, jar?: CookieJar}} opts
   */
  constructor(opts = {}) {
    this.userAgent = opts.userAgent || DEFAULT_USER_AGENT;
    this.timeoutMs = opts.timeoutMs || 25000;
    this.logger = opts.logger || null;
    this.fetchImpl = opts.fetchImpl || (typeof fetch === 'function' ? fetch : null);
    this.jar = opts.jar || new CookieJar();
    if (!this.fetchImpl) throw new Error('fetch is not available in this runtime');
  }

  _debug(...args) {
    if (this.logger && typeof this.logger.debug === 'function') this.logger.debug(...args);
  }

  /**
   * @param {string} url
   * @param {{method?: string, headers?: object, body?: string, redirect?: 'follow'|'manual'|'error', referer?: string, accept?: string, timeoutMs?: number}} init
   * @returns {Promise<{status: number, ok: boolean, url: string, headers: any, text: string, json: () => any}>}
   */
  async request(url, init = {}) {
    const method = (init.method || 'GET').toUpperCase();
    const headers = {
      'User-Agent': this.userAgent,
      Accept: init.accept || '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    };
    if (init.referer) headers.Referer = init.referer;
    const cookie = this.jar.header();
    if (cookie) headers.Cookie = cookie;
    if (init.headers) {
      for (const key of Object.keys(init.headers)) {
        if (init.headers[key] === undefined || init.headers[key] === null) continue;
        headers[key] = init.headers[key];
      }
    }

    const fetchInit = { method, headers, redirect: init.redirect || 'follow' };
    if (init.body !== undefined && method !== 'GET' && method !== 'HEAD') fetchInit.body = init.body;

    let controller = null;
    const timeoutMs = init.timeoutMs || this.timeoutMs;
    if (typeof AbortController === 'function' && timeoutMs > 0 && typeof setTimeout === 'function') {
      controller = new AbortController();
      fetchInit.signal = controller.signal;
      const t = setTimeout(() => controller.abort(), timeoutMs);
      if (t && typeof t.unref === 'function') t.unref();
    }

    this._debug(`[http] ${method} ${url}`);
    let response;
    try {
      response = await withTimeout(this.fetchImpl(url, fetchInit), timeoutMs + 1000, `${method} ${url}`);
    } catch (err) {
      throw new HttpError(`Request failed: ${method} ${url} (${(err && err.message) || err})`, err);
    }

    this.jar.absorb(response.headers);

    let text = '';
    if (method !== 'HEAD') {
      try {
        text = await response.text();
      } catch (e) {
        text = '';
      }
    }
    const status = Number(response.status) || 0;
    const finalUrl = response.url || url;
    this._debug(`[http] -> ${status} ${finalUrl} (${text.length} bytes)`);

    return {
      status,
      ok: status >= 200 && status < 300,
      url: finalUrl,
      headers: response.headers,
      redirected: Boolean(response.redirected) || (finalUrl !== url && finalUrl !== ''),
      text,
      header(name) {
        try {
          return response.headers.get(name);
        } catch (e) {
          return null;
        }
      },
      json() {
        if (!text) return null;
        try {
          return JSON.parse(text);
        } catch (e) {
          return null;
        }
      },
    };
  }

  /** GET a page and return its HTML plus the final URL (after redirects). */
  async html(url, referer) {
    const res = await this.request(url, {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      referer,
      headers: {
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
      },
    });
    return res;
  }

  /** GET/POST a JSON API endpoint. */
  async api(url, init = {}) {
    const headers = Object.assign(
      {
        'X-Requested-With': 'XMLHttpRequest',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
      },
      init.headers || {}
    );
    return this.request(url, Object.assign({}, init, { accept: 'application/json, text/plain, */*', headers }));
  }
}
