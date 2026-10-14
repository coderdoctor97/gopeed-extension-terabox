/**
 * Gopeed × TeraBox
 *
 * onResolve : share link → file list with direct CDN URLs (multi‑connection capable)
 * onStart   : re‑signs links that are about to expire before the download (re)starts
 * onError   : when a download fails (typically a 403 on an expired link) mints a new
 *             link and resumes the task automatically (max 3 times per task)
 * onDone    : housekeeping
 */

import { TeraboxClient, TeraboxError, mapLimit } from './terabox.js';
import { parseShareUrl, splitUrl } from './url.js';
import { layoutFiles } from './layout.js';

const LABEL = 'terabox';
const MINT_CONCURRENCY = 4;
const REFRESH_MARGIN_SEC = 15 * 60;
const MAX_ERROR_RETRIES = 3;

/* ------------------------------------------------------------------------- */
/*                               small helpers                               */
/* ------------------------------------------------------------------------- */

const str = (v) => (v === undefined || v === null ? '' : String(v).trim());
const num = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};
const bool = (v, fallback) => {
  if (v === undefined || v === null || v === '') return fallback;
  if (typeof v === 'boolean') return v;
  return !/^(false|0|no|off)$/i.test(String(v));
};
const nowSec = () => Math.floor(Date.now() / 1000);

function userMessage(err) {
  if (err instanceof TeraboxError) return err.toUserMessage();
  const msg = (err && err.message) || String(err);
  return `TeraBox: ${msg}`;
}

/** Throws a user-visible error (MessageError when Gopeed provides it). */
function fail(err) {
  const message = userMessage(err);
  gopeed.logger.error(message);
  if (typeof MessageError === 'function') throw new MessageError(message);
  throw new Error(message);
}

function readSettings() {
  const s = (typeof gopeed !== 'undefined' && gopeed.settings) || {};
  return {
    cookie: str(s.cookie),
    password: str(s.password),
    mirror: str(s.mirror),
    apiBase: str(s.apiBase),
    maxFiles: num(s.maxFiles, 200),
    folderDepth: num(s.folderDepth, 5),
    ua: str(s.ua),
    fingerprint: bool(s.fingerprint, true),
  };
}

function normaliseMirror(value) {
  const m = String(value || '')
    .trim()
    .replace(/\/+$/, '');
  if (!m || m.toLowerCase() === 'auto') return '';
  return /^https?:\/\//i.test(m) ? m : `https://${m}`;
}

function createClient(settings) {
  if (settings.fingerprint && typeof __gopeed_setFingerprint === 'function') {
    try {
      // Makes the Go HTTP client present a Chrome TLS fingerprint — TeraBox's bot filter looks at it.
      __gopeed_setFingerprint('chrome');
    } catch (e) {
      gopeed.logger.debug(`fingerprint not applied: ${e && e.message}`);
    }
  }
  return new TeraboxClient({
    cookie: settings.cookie,
    userAgent: settings.ua,
    mirror: normaliseMirror(settings.mirror),
    apiBase: settings.apiBase,
    logger: gopeed.logger,
  });
}

/* --------------------------- request mutation ----------------------------- */
/* Gopeed 2.x exposes mutator methods on ctx.task.meta.req; 1.9.x expects plain assignment. */

async function setReqUrl(req, url) {
  if (typeof req.setUrl === 'function') await req.setUrl(url);
  else req.url = url;
}

async function setReqHeaders(req, headers) {
  if (typeof req.setHeaders === 'function') {
    await req.setHeaders(headers);
    return;
  }
  const extra = req.extra && typeof req.extra === 'object' ? req.extra : {};
  extra.header = headers;
  req.extra = extra;
}

async function putReqLabel(req, key, value) {
  if (typeof req.putLabel === 'function') {
    await req.putLabel(key, String(value));
    return;
  }
  if (!req.labels || typeof req.labels !== 'object') req.labels = {};
  req.labels[key] = String(value);
}

function labelsOf(task) {
  const req = task && task.meta && task.meta.req;
  return (req && req.labels) || {};
}

/* ------------------------------------------------------------------------- */
/*                                  onResolve                                */
/* ------------------------------------------------------------------------- */

gopeed.events.onResolve(async (ctx) => {
  const parsed = parseShareUrl(ctx.req.url);
  if (!parsed) {
    gopeed.logger.debug(`not a TeraBox share link, ignoring: ${ctx.req.url}`);
    return;
  }

  const settings = readSettings();
  const client = createClient(settings);
  gopeed.logger.info(
    `resolving TeraBox share ${parsed.surl} (cookie: ${settings.cookie ? 'yes' : 'no'}, api: ${settings.apiBase || 'direct'})`
  );

  let share;
  try {
    share = await client.resolveShare(parsed, {
      defaultPassword: settings.password,
      maxFiles: settings.maxFiles,
      maxDepth: settings.folderDepth,
    });
  } catch (err) {
    fail(err);
  }
  const files = share.files;
  gopeed.logger.info(
    `share ${parsed.surl}: ${files.length} file(s)${share.truncated ? ' (truncated by maxFiles/folderDepth)' : ''} via ${share.base}`
  );

  // Sign every file. Try the first alone: if TeraBox wants a login we stop immediately with a clear message
  // instead of firing N doomed requests.
  const links = new Array(files.length);
  try {
    links[0] = await client.mintLink(share, files[0]);
  } catch (err) {
    if (err instanceof TeraboxError && err.code === 'LOGIN_REQUIRED') {
      const preview = files
        .slice(0, 3)
        .map((f) => f.name)
        .join(', ');
      fail(
        new TeraboxError(
          err.code,
          `Found ${files.length} file(s) (${preview}${files.length > 3 ? ', …' : ''}) but ${err.message}`,
          err.hint,
          err.errno
        )
      );
    }
    fail(err);
  }
  if (files.length > 1) {
    const failures = [];
    await mapLimit(files.slice(1), MINT_CONCURRENCY, async (file, i) => {
      try {
        links[i + 1] = await client.mintLink(share, file);
      } catch (err) {
        failures.push(`${file.name}: ${userMessage(err)}`);
        links[i + 1] = null;
      }
    });
    if (failures.length)
      gopeed.logger.warn(`${failures.length} file(s) could not be signed and were skipped:\n${failures.join('\n')}`);
  }

  const ready = files.map((file, i) => ({ file, link: links[i] })).filter((x) => x.link);
  if (!ready.length)
    fail(
      new TeraboxError('UPSTREAM_ERROR', 'TeraBox did not sign any of the files in this share.', 'Retry in a moment.')
    );

  const layout = layoutFiles(
    ready.map((x) => x.file),
    share
  );
  ctx.res = {
    name: layout.name,
    files: ready.map(({ file, link }, i) => {
      const labels = {
        [LABEL]: '1',
        terabox_surl: share.surl,
        terabox_fsid: file.fsId,
        terabox_name: file.name,
        terabox_origin: share.mode === 'api' ? '' : share.base,
        terabox_expires: String(link.expires),
      };
      if (share.pwd) labels.terabox_pwd = share.pwd;
      return {
        name: file.name,
        path: layout.paths[i],
        size: file.size,
        req: {
          url: link.url,
          extra: { header: link.headers },
          labels,
        },
      };
    }),
  };
  gopeed.logger.info(
    `resolved ${ready.length} file(s) for ${parsed.surl}; links expire around ${new Date(ready[0].link.expires * 1000).toISOString()}`
  );
});

/* ------------------------------------------------------------------------- */
/*                         link refresh (onStart/onError)                    */
/* ------------------------------------------------------------------------- */

async function refreshTaskLink(task, reason) {
  const labels = labelsOf(task);
  const req = task.meta.req;
  const settings = readSettings();
  const client = createClient(settings);
  const origin = labels.terabox_origin || (splitUrl(req.url) || {}).origin || '';
  gopeed.logger.info(
    `${reason}: refreshing TeraBox link for ${labels.terabox_name || labels.terabox_fsid} (${labels.terabox_surl})`
  );

  const link = await client.refreshLink({
    surl: labels.terabox_surl,
    pwd: labels.terabox_pwd || settings.password || '',
    fsId: labels.terabox_fsid,
    origin,
    name: labels.terabox_name || '',
  });
  await setReqUrl(req, link.url);
  await setReqHeaders(req, link.headers);
  await putReqLabel(req, 'terabox_expires', String(link.expires));
  gopeed.logger.info(
    `new link for ${labels.terabox_name || labels.terabox_fsid} expires around ${new Date(link.expires * 1000).toISOString()}`
  );
  return link;
}

gopeed.events.onStart(async (ctx) => {
  const task = ctx.task;
  const labels = labelsOf(task);
  if (!labels[LABEL] || !labels.terabox_surl || !labels.terabox_fsid) return;

  const expires = Number(labels.terabox_expires || 0);
  if (expires && nowSec() < expires - REFRESH_MARGIN_SEC) {
    gopeed.logger.debug(
      `link for ${labels.terabox_name} still valid (${Math.round((expires - nowSec()) / 60)} min left)`
    );
    return;
  }
  try {
    await refreshTaskLink(task, 'onStart');
  } catch (err) {
    // Not fatal: Gopeed will try the old link, and onError gets another chance.
    gopeed.logger.warn(`could not refresh link before start: ${userMessage(err)}`);
  }
});

gopeed.events.onError(async (ctx) => {
  const task = ctx.task;
  const labels = labelsOf(task);
  if (!labels[LABEL] || !labels.terabox_surl || !labels.terabox_fsid) return;

  const key = `retry:${task.id}`;
  const attempts = Number(gopeed.storage.get(key) || 0);
  const errorText = ctx.error && ctx.error.message ? ctx.error.message : String(ctx.error || 'unknown error');
  if (attempts >= MAX_ERROR_RETRIES) {
    gopeed.logger.warn(
      `giving up on ${labels.terabox_name} after ${attempts} automatic retries (last error: ${errorText})`
    );
    return;
  }
  gopeed.storage.set(key, String(attempts + 1));
  gopeed.logger.warn(
    `download of ${labels.terabox_name} failed (${errorText}); attempt ${attempts + 1}/${MAX_ERROR_RETRIES} to re-sign the link`
  );

  try {
    await refreshTaskLink(task, 'onError');
  } catch (err) {
    gopeed.logger.error(`re-signing failed: ${userMessage(err)}`);
    return;
  }
  try {
    await task.continue();
  } catch (err) {
    gopeed.logger.error(`could not resume task ${task.id}: ${(err && err.message) || err}`);
  }
});

if (typeof gopeed.events.onDone === 'function') {
  gopeed.events.onDone(async (ctx) => {
    const task = ctx.task;
    const labels = labelsOf(task);
    if (!labels[LABEL]) return;
    try {
      gopeed.storage.remove(`retry:${task.id}`);
    } catch (e) {
      /* ignore */
    }
  });
}
