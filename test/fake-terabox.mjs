/**
 * A tiny in-memory TeraBox that answers like the real one (as captured in October 2026),
 * used by the unit tests through the injectable `fetchImpl`.
 */

export const JS_TOKEN = 'A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2';
export const LOGID = '94135101463120910034';

function page(jsToken = JS_TOKEN) {
  return (
    '<!doctype html><html><head><title>TeraBox share</title></head><body>' +
    `<script>window.jsToken%20%3D%20a%7D%3Bfn%28%22${jsToken}%22%29</script>` +
    `<script>var logid = "dp-logid=${LOGID}";</script>` +
    '</body></html>'
  );
}

function parse(url) {
  const u = new URL(url);
  return { u, q: Object.fromEntries(u.searchParams.entries()) };
}

function cookiesOf(init) {
  const header = (init && init.headers && (init.headers.Cookie || init.headers.cookie)) || '';
  const map = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) map[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  return map;
}

function json(body, headers = []) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: [['content-type', 'application/json'], ...headers],
  });
}

/**
 * @param {object} opts
 * @param {string} opts.surl
 * @param {string} [opts.pwd]            password protected share when set
 * @param {Array}  opts.tree             [{name, size, fs_id, children?}]
 * @param {string[]} [opts.walledHosts]  hosts that always answer 400210
 * @param {boolean} [opts.staleTokenOnce] first /share/download answers 4000020 until /main is re-fetched
 * @param {boolean} [opts.dlinkInList]   logged-in listings include dlink directly
 * @param {boolean} [opts.liveExpiry]    CDN links expire 8h from now instead of at a fixed (past) epoch
 */
export function createFakeTerabox(opts) {
  const state = {
    calls: [],
    mainFetched: 0,
    staleArmed: Boolean(opts.staleTokenOnce),
    shareid: '778899',
    uk: '445566',
    generation: 0,
  };
  const dlinkBase = opts.dlinkBase || 'https://d.terabox.app';
  const cdnBase = opts.cdnBase || 'https://cdn.example.net';
  const dlinkHost = new URL(dlinkBase).host;
  const cdnHost = new URL(cdnBase).host;
  const cdnExpires = () => (opts.liveExpiry ? Math.floor(Date.now() / 1000) + 8 * 3600 : 1767791721);
  const files = new Map(); // path -> entry
  const dirs = new Map(); // dir path -> entries
  const walk = (items, parent) => {
    const list = [];
    for (const item of items) {
      const path = `${parent}/${item.name}`;
      const entry = {
        fs_id: item.fs_id,
        isdir: item.children ? 1 : 0,
        path,
        server_filename: item.name,
        size: item.size || 0,
        md5: item.md5 || 'md5' + item.fs_id,
        category: item.children ? 6 : 1,
        server_ctime: 1700000000,
      };
      list.push(entry);
      files.set(path, entry);
      if (item.children) walk(item.children, path);
    }
    dirs.set(parent || '/', list);
  };
  walk(opts.tree, '');

  const sekeyOf = (init) => {
    const c = cookiesOf(init);
    return c.BOXCLND ? decodeURIComponent(c.BOXCLND) : '';
  };

  const fetchImpl = async (url, init = {}) => {
    const { u, q } = parse(url);
    const method = (init.method || 'GET').toUpperCase();
    state.calls.push(`${method} ${u.host}${u.pathname}`);
    const cookies = cookiesOf(init);
    const loggedIn = Boolean(cookies.ndus);

    if (u.pathname.startsWith('/file/')) {
      if (u.host === dlinkHost && q.sign !== 'cdn') {
        if (!cookies.csrfToken && !loggedIn) return new Response('', { status: 403 });
        return new Response('', {
          status: 302,
          headers: [
            [
              'location',
              `${cdnBase}/file/${u.pathname.split('/').pop()}?expires=${cdnExpires()}&sign=cdn&gen=${q.gen || 0}`,
            ],
          ],
        });
      }
      if (u.host === cdnHost) return new Response('data', { status: 200 });
    }

    if ((opts.walledHosts || []).includes(u.host)) {
      if (u.pathname.startsWith('/api/') || u.pathname.startsWith('/share/'))
        return json({ errno: 400210, errmsg: 'need verify_v2' });
    }

    if (u.pathname === '/sharing/link' || u.pathname === '/sharing/embed') {
      return new Response(page(), {
        status: 200,
        headers: [
          ['content-type', 'text/html'],
          ['set-cookie', 'csrfToken=CSRF123; Path=/'],
          ['set-cookie', 'browserid=BR0WSER; Path=/'],
          ['set-cookie', `lang=en; Expires=Wed, 21 Oct 2026 07:28:00 GMT; Path=/`],
        ],
      });
    }
    if (u.pathname === '/main') {
      state.mainFetched++;
      state.staleArmed = false;
      return new Response(page(JS_TOKEN + 'FRESH'), { status: 200, headers: [['content-type', 'text/html']] });
    }

    // Every API call must carry the session cookie and a jsToken — exactly what the real backend enforces.
    if (!cookies.csrfToken) return json({ errno: 400210, errmsg: 'need verify_v2' });
    if (!q.jsToken && u.pathname !== '/share/list') return json({ errno: -6 });

    if (u.pathname === '/share/verify') {
      const body = Object.fromEntries(new URLSearchParams(String(init.body || '')).entries());
      if (!opts.pwd) return json({ errno: -12 });
      if (body.pwd !== opts.pwd) return json({ errno: -9 });
      return json({ errno: 0, randsk: 'RANDSK%2Fkey' }, [['set-cookie', 'BOXCLND=RANDSK%2Fkey; Path=/']]);
    }

    const protectedOk = !opts.pwd || sekeyOf(init) === 'RANDSK/key' || q.sekey === 'RANDSK/key';

    if (u.pathname === '/api/shorturlinfo') {
      if (q.shorturl !== `1${opts.surl}`) return json({ errno: 105, show_msg: 'share link error stat' }); // real answer for unknown ids
      if (!protectedOk) return json({ errno: -9 });
      const root = dirs.get('/') || [];
      return json({
        errno: 0,
        shareid: Number(state.shareid),
        uk: Number(state.uk),
        sign: 'SIGN123',
        timestamp: 1760000000,
        randsk: opts.pwd ? 'RANDSK%2Fkey' : '',
        fcount: root.length,
        title: root.length === 1 ? root[0].path : '/',
        list: root.map((e) => ({
          ...e,
          dlink: loggedIn && opts.dlinkInList ? `${dlinkBase}/file/${e.md5}?fid=${e.fs_id}&expires=8h` : '',
        })),
      });
    }

    if (u.pathname === '/share/list') {
      if (q.shorturl !== opts.surl) return json({ errno: 105, show_msg: 'share link error stat' });
      if (!protectedOk) return json({ errno: -9 });
      const dir = q.dir || '/';
      const entries = dirs.get(dir);
      if (!entries) return json({ errno: -9 });
      const num = Number(q.num || 100);
      const pageNo = Number(q.page || 1);
      const slice = entries.slice((pageNo - 1) * num, pageNo * num);
      return json({ errno: 0, list: slice.map((e) => ({ ...e, fs_id: String(e.fs_id) })) });
    }

    if (u.pathname === '/share/download') {
      if (!loggedIn) return json({ errno: 2, errmsg: '' });
      if (state.staleArmed) return json({ errno: 4000020 });
      if (q.shareid !== state.shareid || q.uk !== state.uk || q.sign !== 'SIGN123' || q.product !== 'share')
        return json({ errno: -1 });
      const id = q.fid_list.replace(/[[\]]/g, '');
      const entry = [...files.values()].find((e) => String(e.fs_id) === id);
      if (!entry) return json({ errno: -9 });
      state.generation++;
      return json({
        errno: 0,
        dlink: `${dlinkBase}/file/${entry.md5}?fid=${entry.fs_id}-250528&amp;expires=8h&amp;sign=x&amp;gen=${state.generation}`,
      });
    }

    return new Response('not found', { status: 404 });
  };

  return { fetchImpl, state };
}

/** Trauso / Terabox-DL compatible resolver API. */
export function createFakeWorker({ surl, tree }) {
  const calls = [];
  const toApi = (items) =>
    items.map((item) => ({
      category: item.children ? 6 : 1,
      fs_id: item.fs_id,
      is_dir: item.children ? '1' : '0',
      size: item.size || 0,
      filename: item.name,
      create_time: 1700000000,
      children: item.children ? toApi(item.children) : undefined,
    }));
  const fetchImpl = async (url, init = {}) => {
    const { u, q } = parse(url);
    calls.push(`${(init.method || 'GET').toUpperCase()} ${u.pathname}`);
    if (u.pathname === '/api/get-info-new') return new Response('', { status: 404 });
    if (u.pathname === '/api/get-info') {
      if (q.shorturl !== `1${surl}`) return json({ ok: false, message: 'Invalid link' });
      return json({ ok: true, shareid: 1, uk: 2, sign: 'S', timestamp: 3, list: toApi(tree) });
    }
    if (u.pathname === '/api/get-downloadp') return json({ ok: false, message: 'premium down' });
    if (u.pathname === '/api/get-download') {
      const body = JSON.parse(init.body);
      return json({ ok: true, downloadLink: `https://cdn.example.net/w/${body.fs_id}?expires=1767791721` });
    }
    return new Response('nope', { status: 404 });
  };
  return { fetchImpl, calls };
}
