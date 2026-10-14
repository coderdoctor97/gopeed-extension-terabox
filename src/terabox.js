/**
 * TeraBox share client.
 *
 * Implements the same calls the official TeraBox web player makes — no third‑party service
 * in the middle (the worker Trauso relied on, terabox.hnn.workers.dev, is gone):
 *
 *   1. GET  <mirror>/sharing/link?surl=…          → session cookies + anti‑bot `jsToken`, `dp-logid`
 *   2. POST <mirror>/share/verify?surl=…          → (password protected shares only) `randsk` / sekey
 *   3. GET  <mirror>/api/shorturlinfo?shorturl=1… → root file list + `shareid`/`uk`/`sign`/`timestamp`
 *   4. GET  <mirror>/share/list?dir=…             → folder contents (recursive, paginated)
 *   5. GET  <mirror>/share/download?fid_list=[…]  → signed `dlink` (needs a logged‑in `ndus` cookie)
 *   6. HEAD <dlink>                               → 302 → final CDN URL (range capable → multi‑connection)
 *
 * An optional "worker" mode talks to a Trauso‑compatible resolver API instead
 * (`/api/get-info` + `/api/get-download`), for people who self‑host one.
 */

import { HttpSession, CookieJar, DEFAULT_USER_AGENT, HttpError } from './http.js';
import { API_FALLBACK_HOSTS, isTeraboxHost, parseShareUrl, splitUrl, toQuery } from './url.js';

export const APP_ID = '250528';
/** First-party domains whose `www.` host serves the share API. */
export const API_DOMAINS = [
  'terabox.app',
  'terabox.com',
  '1024terabox.com',
  '1024tera.com',
  'teraboxapp.com',
  'dubox.com',
];
const PAGE_SIZE = 100;
const MAX_PAGES = 50;

/* -------------------------------------------------------------------------- */
/*                                   Errors                                   */
/* -------------------------------------------------------------------------- */

export class TeraboxError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {string} [hint]
   * @param {number} [errno]
   */
  constructor(code, message, hint, errno) {
    super(message);
    this.name = 'TeraboxError';
    this.code = code;
    this.hint = hint || '';
    this.errno = errno;
  }

  /** Human readable message shown to the user by Gopeed. */
  toUserMessage() {
    return this.hint ? `${this.message} ${this.hint}` : this.message;
  }
}

/** Definitive answers — trying another mirror cannot help. */
export const FATAL_CODES = new Set([
  'INVALID_SHARE_URL',
  'NOT_FOUND',
  'PASSWORD_REQUIRED',
  'WRONG_PASSWORD',
  'CAPTCHA_REQUIRED',
  'REGION_BLOCKED',
  'LOGIN_REQUIRED',
  'EMPTY_SHARE',
]);

/** "The anti‑bot token went stale" — refresh `jsToken` and retry once. */
const TOKEN_REFRESH_ERRNOS = new Set([-6, 4000020, 400141, 460020]);

const LOGIN_HINT =
  'TeraBox only hands out direct download links to logged-in sessions. Log in at https://www.terabox.app in your browser, ' +
  'copy the value of the `ndus` cookie (DevTools → Application → Cookies) and paste it into the extension settings ' +
  '(Gopeed → Extensions → TeraBox → Settings → "TeraBox cookie").';

export function mapErrno(errno, errmsg, context) {
  const n = Number(errno);
  const detail = errmsg ? ` (${String(errmsg).replace(/[<>]/g, '').slice(0, 120)})` : '';
  switch (n) {
    case 0:
      return null;
    case -9:
      if (context === 'init') {
        return new TeraboxError(
          'PASSWORD_REQUIRED',
          'This TeraBox share is password protected.',
          'Append ?pwd=XXXX to the link (e.g. https://terabox.com/s/1abc?pwd=1234) or set a default password in the extension settings.',
          n
        );
      }
      if (context === 'verify') {
        return new TeraboxError(
          'WRONG_PASSWORD',
          'TeraBox rejected the share password.',
          'Double-check the ?pwd= value.',
          n
        );
      }
      return new TeraboxError(
        'NOT_FOUND',
        `This TeraBox share is expired, deleted or private${detail}.`,
        'Ask the sender for a fresh link.',
        n
      );
    case -12:
      return new TeraboxError(
        'WRONG_PASSWORD',
        `TeraBox did not accept the share password${detail}.`,
        'Double-check the ?pwd= value.',
        n
      );
    case -62:
    case -20:
    case -19:
      return new TeraboxError(
        'CAPTCHA_REQUIRED',
        `TeraBox is asking for a captcha before releasing this share${detail}.`,
        'Open the share link once in your browser (logged in), solve the captcha, then retry.',
        n
      );
    case -10:
    case -21:
    case 105:
    case 115:
    case 116:
    case 145:
      return new TeraboxError(
        'NOT_FOUND',
        `This TeraBox share is expired, deleted or blocked${detail}.`,
        'Ask the sender for a fresh link.',
        n
      );
    case 2:
    case 112:
      if (context === 'download') {
        return new TeraboxError(
          'LOGIN_REQUIRED',
          `TeraBox refused to sign the download link (errno ${n}).`,
          LOGIN_HINT,
          n
        );
      }
      return new TeraboxError('UPSTREAM_ERROR', `TeraBox answered with errno ${n}${detail}.`, 'Retry in a moment.', n);
    case -3:
    case -6:
    case 4000020:
    case 400141:
      return new TeraboxError(
        context === 'download' ? 'LOGIN_REQUIRED' : 'TOKEN_EXPIRED',
        `TeraBox considers this session invalid (errno ${n})${detail}.`,
        context === 'download'
          ? 'Your cookie may have expired — log in again and update it. ' + LOGIN_HINT
          : 'Retry in a moment.',
        n
      );
    case 400210:
    case 460020:
      return new TeraboxError(
        'VERIFICATION_REQUIRED',
        `TeraBox served a verification wall instead of the share (errno ${n}).`,
        'Your IP is being challenged. Setting a logged-in cookie in the extension settings usually fixes it; otherwise retry in a few minutes or choose another API mirror.',
        n
      );
    case 9000:
      return new TeraboxError(
        'REGION_BLOCKED',
        'TeraBox is not available from your region.',
        'Use a proxy/VPN (Gopeed → Settings → Proxy) and retry.',
        n
      );
    case 130:
      return new TeraboxError(
        'UPSTREAM_ERROR',
        `TeraBox refused the request (errno 130)${detail}.`,
        'This usually means a VIP-only resource or a blocked file.',
        n
      );
    default:
      return new TeraboxError(
        'UPSTREAM_ERROR',
        `TeraBox answered with an unexpected error (errno ${n})${detail}.`,
        'TeraBox rotates its API without notice — retry in a moment.',
        n
      );
  }
}

/* -------------------------------------------------------------------------- */
/*                               Token scraping                               */
/* -------------------------------------------------------------------------- */

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return value;
  }
}

/** `jsToken` is embedded inside a percent-encoded anti-bot trampoline: `fn%28%22<TOKEN>%22%29`. */
export function normaliseJsToken(raw) {
  if (!raw) return '';
  const value = String(raw).trim();
  const inner = value.match(/%22([A-Za-z0-9_%+/-]{16,})%22/);
  const candidate = inner ? safeDecode(inner[1]) : safeDecode(value);
  const token = candidate.replace(/^["']|["']$/g, '').trim();
  return token.length >= 8 && /^[A-Za-z0-9_+/=-]+$/.test(token) ? token.slice(0, 200) : '';
}

const JS_TOKEN_PATTERNS = [
  /"jsToken"\s*:\s*"function%20fn%28a%29%7Bwindow\.jsToken%20%3D%20a%7D%3Bfn%28%22([^"\\]+)%22%29/,
  /fn\("%28%22([A-Za-z0-9_%+/-]{16,})%22%29"\)/,
  /fn%28%22([A-Za-z0-9_%+/-]{16,})%22%29/,
  /window\.jsToken\s*[:=]\s*["'`]([^"'`]{8,})/,
  /jsToken["'\s:=]+([A-Za-z0-9_+-]{8,})/i,
];

function metaValue(html, key, allow) {
  const re = new RegExp(`(?:["']?${key}["']?)\\s*[:=]\\s*["']([${allow}]{3,})["']`, 'i');
  const m = html.match(re);
  return m ? m[1] : '';
}

/**
 * Extracts the anti-bot tokens and (when present) share metadata from a TeraBox HTML page.
 * @param {string} html
 */
export function extractTokens(html) {
  const text = String(html || '');
  const tokens = {
    jsToken: '',
    logid: '',
    bdstoken: '',
    title: '',
    uk: '',
    shareid: '',
    sign: '',
    timestamp: '',
    randsk: '',
  };

  for (const pattern of JS_TOKEN_PATTERNS) {
    const m = text.match(pattern);
    const candidate = normaliseJsToken(m && m[1]);
    if (candidate) {
      tokens.jsToken = candidate;
      break;
    }
  }

  const logid = text.match(/(?:dp-logid=|"dp-logid"\s*:\s*"?)(\d{6,})/) || text.match(/logid["'\s:=]+(\d{6,})/i);
  if (logid) tokens.logid = logid[1];

  const bd = text.match(/bdstoken["'\s:=]+([A-Za-z0-9_-]{8,})/i);
  if (bd) tokens.bdstoken = bd[1];

  const title =
    text.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    text.match(/<title>([^<]{1,200})<\/title>/i);
  if (title) tokens.title = safeDecode(title[1]).replace(/&amp;/g, '&').trim();

  tokens.uk = metaValue(text, 'uk', '0-9');
  tokens.shareid = metaValue(text, 'shareid', '0-9') || metaValue(text, 'share_id', '0-9');
  tokens.sign = metaValue(text, 'sign', 'A-Za-z0-9+/=_-');
  tokens.timestamp = metaValue(text, 'timestamp', '0-9');
  tokens.randsk = metaValue(text, 'randsk', 'A-Za-z0-9%+/=_-');
  return tokens;
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

function originOf(url) {
  const parts = splitUrl(url);
  return parts ? parts.origin : '';
}

function absolutize(location, base) {
  if (!location) return '';
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(location)) return location;
  const b = splitUrl(base);
  if (!b) return location;
  if (location.charAt(0) === '/') return b.origin + location;
  return b.origin + b.path.replace(/[^/]*$/, '') + location;
}

/** Signed TeraBox URLs carry their expiry: `expires=1767791721` (epoch) or `expires=8h`. */
export function parseExpires(url, nowSec) {
  const now = nowSec || Math.floor(Date.now() / 1000);
  const parts = splitUrl(url);
  if (!parts) return now + 6 * 3600;
  const q = parts.query;
  const raw = q.expires || q.Expires || '';
  if (/^\d{9,}$/.test(raw)) return Number(raw);
  const rel = raw.match(/^(\d+)([smhd])$/i);
  if (rel) {
    const mult = { s: 1, m: 60, h: 3600, d: 86400 }[rel[2].toLowerCase()];
    const start = /^\d{9,}$/.test(q.time || '') ? Number(q.time) : now;
    return start + Number(rel[1]) * mult;
  }
  return now + 6 * 3600;
}

function errnoOf(body) {
  if (!body || typeof body !== 'object') return NaN;
  const raw = body.errno !== undefined ? body.errno : body.code !== undefined ? body.code : 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
}

function entriesOf(body) {
  if (!body) return [];
  if (Array.isArray(body.list)) return body.list;
  if (Array.isArray(body.file_list)) return body.file_list;
  return [];
}

/** Normalises one `share/list` / `shorturlinfo` entry. */
export function toFile(entry) {
  if (!entry) return null;
  const name = String(entry.server_filename || entry.filename || '').trim();
  if (!name) return null;
  const path = String(entry.path || `/${name}`).trim() || `/${name}`;
  const size = Number(entry.size || 0);
  const dlink = typeof entry.dlink === 'string' ? entry.dlink.replace(/&amp;/g, '&').trim() : '';
  return {
    name,
    path,
    size: Number.isFinite(size) && size > 0 ? size : 0,
    isDir: Number(entry.isdir !== undefined ? entry.isdir : entry.is_dir || 0) === 1,
    fsId: entry.fs_id !== undefined && entry.fs_id !== null ? String(entry.fs_id) : '',
    md5: typeof entry.md5 === 'string' ? entry.md5 : '',
    category: Number(entry.category || 0) || 0,
    ctime: Number(entry.server_ctime || entry.create_time || 0) || 0,
    dlink,
  };
}

/** Runs `worker` over `items` with at most `limit` in flight, preserving order. */
export async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  const lanes = [];
  const n = Math.max(1, Math.min(limit, items.length));
  for (let lane = 0; lane < n; lane++) {
    lanes.push(
      (async () => {
        for (;;) {
          const index = next++;
          if (index >= items.length) return;
          results[index] = await worker(items[index], index);
        }
      })()
    );
  }
  await Promise.all(lanes);
  return results;
}

/* -------------------------------------------------------------------------- */
/*                                   Client                                   */
/* -------------------------------------------------------------------------- */

/**
 * @typedef {object} ShareSession
 * @property {string} base        API origin, e.g. https://www.terabox.app
 * @property {string} pageUrl     Share page URL (used as Referer)
 * @property {string} surl        Bare short id
 * @property {HttpSession} http
 * @property {{jsToken: string, logid: string, bdstoken: string, title: string}} tokens
 * @property {{shareid: string, uk: string, sign: string, timestamp: string, sekey: string}} meta
 * @property {boolean} loggedIn
 */

export class TeraboxClient {
  /**
   * @param {{cookie?: string, userAgent?: string, mirror?: string, apiBase?: string, logger?: any, timeoutMs?: number, fetchImpl?: Function}} opts
   */
  constructor(opts = {}) {
    this.cookie = String(opts.cookie || '').trim();
    this.userAgent = String(opts.userAgent || '').trim() || DEFAULT_USER_AGENT;
    this.mirror = String(opts.mirror || '')
      .trim()
      .replace(/\/+$/, '');
    this.apiBase = String(opts.apiBase || '')
      .trim()
      .replace(/\/+$/, '');
    this.logger = opts.logger || null;
    this.timeoutMs = opts.timeoutMs || 25000;
    this.fetchImpl = opts.fetchImpl;
  }

  _log(level, ...args) {
    if (this.logger && typeof this.logger[level] === 'function') this.logger[level](...args);
  }

  _newHttp() {
    const jar = new CookieJar().importCookieString(this.cookie);
    return new HttpSession({
      userAgent: this.userAgent,
      timeoutMs: this.timeoutMs,
      logger: this.logger,
      fetchImpl: this.fetchImpl,
      jar,
    });
  }

  get loggedIn() {
    return new CookieJar().importCookieString(this.cookie).has('ndus');
  }

  /** API origins to try, most likely first. */
  candidateBases(origin) {
    const list = [];
    if (this.mirror && /^https?:\/\//i.test(this.mirror) && this.mirror.toLowerCase() !== 'auto')
      list.push(this.mirror);
    if (origin) {
      const parts = splitUrl(origin);
      if (parts && isTeraboxHost(parts.host)) {
        // Only the first-party domains answer API calls; white-label mirrors (teraboxlink.com…) just redirect.
        const host = parts.host.replace(/^www\./, '');
        if (API_DOMAINS.indexOf(host) >= 0) list.push(`https://www.${host}`);
      }
    }
    for (const base of API_FALLBACK_HOSTS) list.push(base);
    const seen = new Set();
    return list.filter((base) => {
      const key = base.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /* ----------------------------- session ---------------------------------- */

  /**
   * Opens a session on one mirror: fetches the share page (cookies + anti-bot tokens).
   * @returns {Promise<ShareSession>}
   */
  async openSession(base, surl) {
    const http = this._newHttp();
    const pageUrl = `${base}/sharing/link?surl=${encodeURIComponent(surl)}`;
    let page;
    try {
      page = await http.html(pageUrl, `${base}/`);
    } catch (err) {
      throw new TeraboxError(
        'PAGE_UNREACHABLE',
        `TeraBox did not answer at ${base}.`,
        (err && err.message) || '',
        undefined
      );
    }
    if (page.status === 404) {
      throw new TeraboxError(
        'NOT_FOUND',
        'TeraBox returned 404 for this share link.',
        'Expired or deleted shares stop working — ask for a fresh link.'
      );
    }
    if (page.status >= 400) {
      throw new TeraboxError('PAGE_UNREACHABLE', `TeraBox returned HTTP ${page.status} for the share page at ${base}.`);
    }

    const session = {
      base: originOf(page.url) || base,
      pageUrl: page.url || pageUrl,
      surl,
      http,
      tokens: extractTokens(page.text),
      meta: { shareid: '', uk: '', sign: '', timestamp: '', sekey: '' },
      loggedIn: http.jar.has('ndus'),
    };

    if (!session.tokens.jsToken) {
      await this._refreshTokens(session);
    }
    if (!session.tokens.jsToken) {
      const embed = await http
        .html(`${session.base}/sharing/embed?surl=${encodeURIComponent(surl)}`, session.pageUrl)
        .catch(() => null);
      if (embed && embed.status < 400) {
        const extra = extractTokens(embed.text);
        if (extra.jsToken) session.tokens.jsToken = extra.jsToken;
        if (extra.logid && !session.tokens.logid) session.tokens.logid = extra.logid;
      }
    }
    if (!session.tokens.jsToken) {
      throw new TeraboxError(
        'VERIFICATION_REQUIRED',
        `TeraBox served a verification/anti-bot page instead of the share at ${session.base}.`,
        'Setting a logged-in cookie in the extension settings usually fixes it; otherwise retry later or choose another API mirror.'
      );
    }
    this._log(
      'debug',
      `[terabox] session on ${session.base} jsToken=${session.tokens.jsToken.slice(0, 8)}… logid=${session.tokens.logid} loggedIn=${session.loggedIn}`
    );
    return session;
  }

  /** Re-scrapes `/main` so a stale `jsToken` is replaced. */
  async _refreshTokens(session) {
    const before = session.tokens.jsToken;
    const main = await session.http.html(`${session.base}/main`, session.pageUrl).catch(() => null);
    if (!main || main.status >= 400) return false;
    const extra = extractTokens(main.text);
    if (extra.jsToken) session.tokens.jsToken = extra.jsToken;
    if (extra.logid) session.tokens.logid = extra.logid;
    if (extra.bdstoken) session.tokens.bdstoken = extra.bdstoken;
    return Boolean(session.tokens.jsToken) && session.tokens.jsToken !== before;
  }

  _commonParams(session) {
    const params = { app_id: APP_ID, web: '1', channel: 'dubox', clienttype: '0' };
    if (session.tokens.jsToken) params.jsToken = session.tokens.jsToken;
    if (session.tokens.logid) params['dp-logid'] = session.tokens.logid;
    return params;
  }

  async _callApi(session, path, params, context, init = {}) {
    const url = `${session.base}${path}?${toQuery(params)}`;
    let res = await session.http.api(url, Object.assign({ referer: session.pageUrl }, init));
    let body = res.json();
    let errno = errnoOf(body);

    if (TOKEN_REFRESH_ERRNOS.has(errno)) {
      this._log('debug', `[terabox] errno ${errno} on ${path} — refreshing jsToken`);
      if (await this._refreshTokens(session)) {
        if (params.jsToken) params.jsToken = session.tokens.jsToken;
        if (params['dp-logid'] !== undefined && session.tokens.logid) params['dp-logid'] = session.tokens.logid;
        res = await session.http.api(
          `${session.base}${path}?${toQuery(params)}`,
          Object.assign({ referer: session.pageUrl }, init)
        );
        body = res.json();
        errno = errnoOf(body);
      }
    }

    if (!body) {
      if (res.status >= 400)
        throw new TeraboxError('PAGE_UNREACHABLE', `TeraBox returned HTTP ${res.status} for ${path}.`);
      throw new TeraboxError(
        'UPSTREAM_ERROR',
        `TeraBox returned an unreadable response for ${path}.`,
        'Retry in a moment.'
      );
    }
    if (Number.isNaN(errno)) errno = 0;
    const failure = mapErrno(errno, body.errmsg || body.show_msg || body.error_msg, context);
    if (failure) throw failure;
    return body;
  }

  /* --------------------------- password shares ----------------------------- */

  async verifyPassword(session, pwd) {
    const params = Object.assign(this._commonParams(session), { surl: session.surl });
    const body = await this._callApi(session, '/share/verify', params, 'verify', {
      method: 'POST',
      body: toQuery({ pwd, vcode: '', vcode_str: '' }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', Origin: session.base },
    });
    const randsk = body.randsk ? String(body.randsk) : '';
    if (randsk) {
      session.meta.sekey = safeDecode(randsk);
      session.http.jar.set('BOXCLND', randsk);
    }
    this._log('debug', `[terabox] password accepted for ${session.surl}`);
    return session;
  }

  /* ------------------------------- listing --------------------------------- */

  /** `/api/shorturlinfo`: the share record (root listing + signing material). */
  async shortUrlInfo(session, pwdProvided) {
    const params = Object.assign(this._commonParams(session), { shorturl: `1${session.surl}`, root: '1', scene: '' });
    if (session.meta.sekey) params.sekey = session.meta.sekey;
    let body;
    try {
      body = await this._callApi(session, '/api/shorturlinfo', params, 'init');
    } catch (err) {
      if (err instanceof TeraboxError && err.code === 'PASSWORD_REQUIRED' && pwdProvided) {
        throw new TeraboxError(
          'WRONG_PASSWORD',
          'TeraBox did not accept the share password.',
          'Double-check the ?pwd= value.',
          err.errno
        );
      }
      throw err;
    }
    session.meta.shareid = body.shareid !== undefined ? String(body.shareid) : session.meta.shareid;
    session.meta.uk = body.uk !== undefined ? String(body.uk) : session.meta.uk;
    session.meta.sign = body.sign ? String(body.sign) : session.meta.sign;
    session.meta.timestamp = body.timestamp !== undefined ? String(body.timestamp) : session.meta.timestamp;
    if (body.randsk && !session.meta.sekey) session.meta.sekey = safeDecode(String(body.randsk));
    const title = typeof body.title === 'string' ? body.title.replace(/^\//, '') : '';
    const fcount = Number(body.fcount || 0) || 0;
    return { entries: entriesOf(body).map(toFile).filter(Boolean), title, fcount };
  }

  /** One page of `/share/list` (root when `dir` is empty). */
  async listPage(session, dir, page) {
    const params = Object.assign(this._commonParams(session), {
      page: String(page),
      num: String(PAGE_SIZE),
      by: 'name',
      order: 'asc',
      shorturl: session.surl,
    });
    if (dir) params.dir = dir;
    else params.root = '1';
    const { shareid, uk, sign, timestamp, sekey } = session.meta;
    if (sign) params.sign = sign;
    if (timestamp) params.timestamp = timestamp;
    if (shareid) params.shareid = shareid;
    if (uk) params.uk = uk;
    if (sekey) {
      params.sekey = sekey;
      // The web player mirrors `randsk` into the TSID cookie for protected shares.
      session.http.jar.set('TSID', sekey);
    }
    const body = await this._callApi(session, '/share/list', params, 'list');
    return entriesOf(body).map(toFile).filter(Boolean);
  }

  /** All pages of a directory. */
  async listAll(session, dir) {
    const all = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const entries = await this.listPage(session, dir, page);
      for (const entry of entries) all.push(entry);
      if (entries.length < PAGE_SIZE) break;
    }
    return all;
  }

  /**
   * Walks folders breadth-first and returns the flat list of files (directories excluded).
   */
  async collectFiles(session, rootEntries, { maxFiles = 200, maxDepth = 5 } = {}) {
    const files = [];
    let truncated = false;
    const queue = [{ entries: rootEntries, depth: 0 }];
    while (queue.length && files.length < maxFiles) {
      const current = queue.shift();
      for (const entry of current.entries) {
        if (files.length >= maxFiles) {
          truncated = true;
          break;
        }
        if (!entry.isDir) {
          files.push(entry);
          continue;
        }
        if (current.depth >= maxDepth) {
          this._log('warn', `[terabox] folder depth limit reached, skipping ${entry.path}`);
          continue;
        }
        try {
          const children = await this.listAll(session, entry.path);
          queue.push({ entries: children, depth: current.depth + 1 });
        } catch (err) {
          this._log('warn', `[terabox] could not list folder ${entry.path}: ${(err && err.message) || err}`);
        }
      }
    }
    if (queue.some((q) => q.entries.length)) truncated = true;
    return { files, truncated };
  }

  /* ------------------------------- resolve --------------------------------- */

  /**
   * Resolves a share link into its file list (no download links yet).
   * @param {string|{surl: string, pwd?: string, origin?: string}} input
   * @param {{defaultPassword?: string, maxFiles?: number, maxDepth?: number}} options
   */
  async resolveShare(input, options = {}) {
    const parsed = typeof input === 'string' ? parseShareUrl(input) : input;
    if (!parsed || !parsed.surl) {
      throw new TeraboxError(
        'INVALID_SHARE_URL',
        'This does not look like a TeraBox share link.',
        'Expected something like https://www.terabox.com/s/1AbCdEf… or https://terabox.app/sharing/link?surl=…'
      );
    }
    const surl = parsed.surl;
    const pwd = String(parsed.pwd || options.defaultPassword || '').trim();

    if (this.apiBase) return this._resolveViaApi(surl, pwd, options);

    const errors = [];
    for (const base of this.candidateBases(parsed.origin)) {
      try {
        const session = await this.openSession(base, surl);
        if (pwd) await this.verifyPassword(session, pwd);
        const info = await this.shortUrlInfo(session, Boolean(pwd));

        let root = info.entries;
        if (!root.length || (info.fcount > root.length && root.every((e) => !e.isDir))) {
          // shorturlinfo only returns the first page of a big root listing.
          const full = await this.listAll(session, '').catch(() => []);
          if (full.length >= root.length) root = full;
        }
        if (!root.length) {
          throw new TeraboxError(
            'EMPTY_SHARE',
            'This TeraBox share is empty.',
            'Open it in a browser to confirm the sender did not delete the files.'
          );
        }

        const { files, truncated } = await this.collectFiles(session, root, options);
        if (!files.length) {
          throw new TeraboxError('EMPTY_SHARE', 'This TeraBox share only contains empty folders.', '');
        }
        return {
          mode: 'direct',
          surl,
          pwd,
          base: session.base,
          pageUrl: session.pageUrl,
          title: info.title || session.tokens.title || '',
          meta: session.meta,
          files,
          truncated,
          loggedIn: session.loggedIn,
          session,
        };
      } catch (err) {
        const e =
          err instanceof TeraboxError ? err : new TeraboxError('UPSTREAM_ERROR', (err && err.message) || String(err));
        this._log('warn', `[terabox] ${base}: ${e.code} ${e.message}`);
        if (FATAL_CODES.has(e.code)) throw e;
        errors.push(e);
        if (!(
          e.code === 'VERIFICATION_REQUIRED' ||
          e.code === 'PAGE_UNREACHABLE' ||
          e.code === 'UPSTREAM_ERROR' ||
          e.code === 'TOKEN_EXPIRED'
        )) {
          throw e;
        }
      }
    }
    throw (
      errors.find((e) => e.code === 'VERIFICATION_REQUIRED') ||
      errors[0] ||
      new TeraboxError('PAGE_UNREACHABLE', 'TeraBox could not be reached.')
    );
  }

  /* ---------------------------- link minting ------------------------------- */

  /**
   * Mints a direct, range-capable download URL for one file of a resolved share.
   * @param {{session: ShareSession, pageUrl: string}} share
   * @param {{fsId: string, dlink?: string, name: string}} file
   * @returns {Promise<{url: string, headers: object, expires: number, dlink: string}>}
   */
  async mintLink(share, file) {
    if (share.mode === 'api') return this._mintViaApi(share, file);
    const session = share.session;
    let dlink = file.dlink || '';

    if (!dlink) {
      const { shareid, uk, sign, timestamp, sekey } = session.meta;
      if (!(shareid && uk && sign && timestamp)) {
        throw new TeraboxError(
          'UPSTREAM_ERROR',
          'TeraBox did not provide the signing material for this share.',
          'Retry in a moment.'
        );
      }
      if (!file.fsId) throw new TeraboxError('UPSTREAM_ERROR', `TeraBox did not provide an id for ${file.name}.`);
      const params = Object.assign(this._commonParams(session), {
        shareid,
        uk,
        sign,
        timestamp,
        primaryid: shareid,
        product: 'share',
        nozip: '0',
        fid_list: `[${file.fsId}]`,
      });
      if (sekey) params.sekey = sekey;
      let body;
      try {
        body = await this._callApi(session, '/share/download', params, 'download');
      } catch (err) {
        if (err instanceof TeraboxError && err.code === 'LOGIN_REQUIRED' && !session.loggedIn) {
          throw new TeraboxError(
            'LOGIN_REQUIRED',
            'TeraBox refused to hand out a download link to an anonymous session.',
            LOGIN_HINT,
            err.errno
          );
        }
        throw err;
      }
      dlink = typeof body.dlink === 'string' ? body.dlink : '';
      if (!dlink) {
        const entry = entriesOf(body).find((e) => e && typeof e.dlink === 'string' && e.dlink);
        if (entry) dlink = entry.dlink;
      }
      dlink = String(dlink || '')
        .replace(/&amp;/g, '&')
        .trim();
      if (!dlink) {
        throw new TeraboxError(
          'LOGIN_REQUIRED',
          `TeraBox answered without a download link for ${file.name}.`,
          session.loggedIn ? 'Your cookie may have expired — log in again and update it.' : LOGIN_HINT
        );
      }
    }

    const resolved = await this._resolveRedirect(session, dlink);
    const url = resolved || dlink;
    const headers = { 'User-Agent': this.userAgent, Referer: session.pageUrl };
    if (url === dlink) {
      // The redirector itself needs the session cookie; the CDN behind it does not.
      const cookie = session.http.jar.header();
      if (cookie) headers.Cookie = cookie;
    }
    return { url, headers, expires: parseExpires(url), dlink };
  }

  /** Follows the `dlink` redirector once so Gopeed can open N connections straight to the CDN. */
  async _resolveRedirect(session, dlink) {
    const attempt = async (method, extraHeaders) => {
      const res = await session.http.request(dlink, {
        method,
        redirect: 'manual',
        referer: session.pageUrl,
        headers: extraHeaders,
      });
      const location = res.header('location');
      if (res.status >= 300 && res.status < 400 && location) return absolutize(location, dlink);
      if (res.status >= 200 && res.status < 300 && res.url && res.url !== dlink) return res.url; // runtime followed anyway
      if (res.status === 401 || res.status === 403) {
        throw new TeraboxError('LOGIN_REQUIRED', `TeraBox refused the download link (HTTP ${res.status}).`, LOGIN_HINT);
      }
      if (res.status === 405 || res.status === 501) return undefined; // HEAD unsupported → caller retries with GET
      return '';
    };
    try {
      let final = await attempt('HEAD');
      if (final === undefined) final = await attempt('GET', { Range: 'bytes=0-0' });
      return final || '';
    } catch (err) {
      if (err instanceof TeraboxError) throw err;
      this._log('warn', `[terabox] could not pre-resolve dlink redirect: ${(err && err.message) || err}`);
      return '';
    }
  }

  /**
   * Convenience used by onStart/onError: re-runs the whole flow for a single file id and returns a fresh link.
   */
  async refreshLink({ surl, pwd, fsId, origin, name }) {
    if (this.apiBase) {
      const share = await this._resolveViaApi(surl, pwd || '', { maxFiles: 1000, maxDepth: 5 });
      const file = share.files.find((f) => f.fsId === String(fsId)) || { fsId: String(fsId), name: name || '' };
      return this.mintLink(share, file);
    }
    const errors = [];
    for (const base of this.candidateBases(origin)) {
      try {
        const session = await this.openSession(base, surl);
        if (pwd) await this.verifyPassword(session, pwd);
        const info = await this.shortUrlInfo(session, Boolean(pwd));
        const listed = info.entries.find((f) => f.fsId === String(fsId));
        const share = { mode: 'direct', session, pageUrl: session.pageUrl };
        return await this.mintLink(share, {
          fsId: String(fsId),
          name: name || (listed && listed.name) || '',
          dlink: listed ? listed.dlink : '',
        });
      } catch (err) {
        const e =
          err instanceof TeraboxError ? err : new TeraboxError('UPSTREAM_ERROR', (err && err.message) || String(err));
        if (FATAL_CODES.has(e.code)) throw e;
        errors.push(e);
      }
    }
    throw errors[0] || new TeraboxError('PAGE_UNREACHABLE', 'TeraBox could not be reached.');
  }

  /* ------------------------ Trauso-compatible worker ----------------------- */

  async _apiGet(path, params) {
    const http = this._newHttp();
    const res = await http.api(`${this.apiBase}${path}?${toQuery(params)}`, {
      referer: `${this.apiBase}/`,
      headers: { Origin: this.apiBase },
    });
    return { res, body: res.json() };
  }

  async _apiPost(path, payload) {
    const http = this._newHttp();
    const res = await http.api(`${this.apiBase}${path}`, {
      method: 'POST',
      body: JSON.stringify(payload),
      referer: `${this.apiBase}/`,
      headers: { 'Content-Type': 'application/json', Origin: this.apiBase },
    });
    return { res, body: res.json() };
  }

  async _resolveViaApi(surl, pwd, options = {}) {
    let last = 'Unknown error';
    for (const path of ['/api/get-info-new', '/api/get-info']) {
      let out;
      try {
        out = await this._apiGet(path, { shorturl: `1${surl}`, pwd: pwd || '' });
      } catch (err) {
        last = (err && err.message) || String(err);
        continue;
      }
      const { res, body } = out;
      if (!body) {
        last = `HTTP ${res.status} from ${path}`;
        continue;
      }
      if (!body.ok) {
        last = body.message || `${path} answered ok=false`;
        continue;
      }
      const files = [];
      const walk = (items, parent, depth) => {
        for (const item of items || []) {
          const name = String(item.filename || item.server_filename || '').trim();
          if (!name) continue;
          const path = `${parent}/${name}`;
          const isDir = String(item.is_dir !== undefined ? item.is_dir : item.isdir) === '1';
          if (isDir) {
            if (depth < (options.maxDepth || 5)) walk(item.children, path, depth + 1);
            continue;
          }
          if (files.length >= (options.maxFiles || 200)) continue;
          files.push({
            name,
            path,
            size: Number(item.size || 0) || 0,
            isDir: false,
            fsId: String(item.fs_id),
            md5: '',
            category: Number(item.category || 0) || 0,
            ctime: Number(item.create_time || 0) || 0,
            dlink: '',
          });
        }
      };
      walk(body.list, '', 0);
      if (!files.length) {
        throw new TeraboxError(
          'EMPTY_SHARE',
          'The resolver API returned no downloadable files for this share.',
          'Folders may not be supported by that API.'
        );
      }
      return {
        mode: 'api',
        surl,
        pwd,
        base: this.apiBase,
        pageUrl: `${this.apiBase}/`,
        title: '',
        meta: {
          shareid: String(body.shareid),
          uk: String(body.uk),
          sign: String(body.sign || ''),
          timestamp: String(body.timestamp || ''),
          sekey: '',
        },
        files,
        truncated: false,
        loggedIn: true,
        session: null,
      };
    }
    throw new TeraboxError(
      'UPSTREAM_ERROR',
      `The resolver API at ${this.apiBase} could not resolve the share: ${last}`,
      'Check the "External resolver API" setting, or clear it to use your own cookie instead.'
    );
  }

  async _mintViaApi(share, file) {
    const payload = {
      shareid: Number(share.meta.shareid),
      uk: Number(share.meta.uk),
      sign: share.meta.sign,
      timestamp: Number(share.meta.timestamp),
      fs_id: String(file.fsId),
    };
    let last = 'Unknown error';
    for (const path of ['/api/get-downloadp', '/api/get-download']) {
      let out;
      try {
        out = await this._apiPost(path, payload);
      } catch (err) {
        last = (err && err.message) || String(err);
        continue;
      }
      const { body } = out;
      if (body && body.ok && body.downloadLink) {
        const url = String(body.downloadLink);
        return { url, headers: { 'User-Agent': this.userAgent }, expires: parseExpires(url), dlink: url };
      }
      last = (body && body.message) || `${path} answered without a link`;
    }
    throw new TeraboxError(
      'UPSTREAM_ERROR',
      `The resolver API could not produce a download link for ${file.name}: ${last}`,
      'Retry, or clear the API setting to use your own cookie.'
    );
  }
}

export { HttpError };
