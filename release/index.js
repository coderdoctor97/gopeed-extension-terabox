/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/http.js
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _wrapNativeSuper(t) { var r = "function" == typeof Map ? new Map() : void 0; return _wrapNativeSuper = function _wrapNativeSuper(t) { if (null === t || !_isNativeFunction(t)) return t; if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function"); if (void 0 !== r) { if (r.has(t)) return r.get(t); r.set(t, Wrapper); } function Wrapper() { return _construct(t, arguments, _getPrototypeOf(this).constructor); } return Wrapper.prototype = Object.create(t.prototype, { constructor: { value: Wrapper, enumerable: !1, writable: !0, configurable: !0 } }), _setPrototypeOf(Wrapper, t); }, _wrapNativeSuper(t); }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _isNativeFunction(t) { try { return -1 !== Function.toString.call(t).indexOf("[native code]"); } catch (n) { return "function" == typeof t; } }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != _typeof(t) || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
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

var DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
var COOKIE_TOKEN = /^[A-Za-z0-9!#$%&'*+.^_`|~-]+$/;

/**
 * Splits a (possibly comma-joined) Set-Cookie header value into individual cookie strings.
 * Only splits on commas that are followed by a `name=` token, so `Expires=Wed, 21 Oct …` survives.
 */
function splitSetCookie(value) {
  var text = String(value || '');
  if (!text) return [];
  var out = [];
  var start = 0;
  for (var i = 0; i < text.length; i++) {
    if (text[i] !== ',') continue;
    var rest = text.slice(i + 1).replace(/^\s+/, '');
    var eq = rest.indexOf('=');
    if (eq <= 0) continue;
    var name = rest.slice(0, eq);
    if (!COOKIE_TOKEN.test(name) || /\s/.test(name)) continue;
    out.push(text.slice(start, i));
    start = i + 1;
  }
  out.push(text.slice(start));
  return out.map(function (s) {
    return s.trim();
  }).filter(Boolean);
}

/** Parses a `Cookie:` header / bare `ndus` token / JSON object into [name, value] pairs. */
function parseCookieString(raw) {
  var pairs = [];
  var text = String(raw || '').trim();
  if (!text) return pairs;
  if (text.charAt(0) === '{') {
    try {
      var obj = JSON.parse(text);
      for (var _i = 0, _Object$keys = Object.keys(obj); _i < _Object$keys.length; _i++) {
        var key = _Object$keys[_i];
        if (obj[key] !== null && obj[key] !== undefined) pairs.push([key, String(obj[key])]);
      }
      return pairs;
    } catch (e) {
      /* fall through */
    }
  }
  if (text.indexOf('=') >= 0) {
    var _iterator = _createForOfIteratorHelper(text.split(';')),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var part = _step.value;
        var idx = part.indexOf('=');
        if (idx <= 0) continue;
        var name = part.slice(0, idx).trim();
        var value = part.slice(idx + 1).trim();
        if (name) pairs.push([name, value]);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return pairs;
  }

  // A bare token: assume it is the `ndus` login cookie.
  pairs.push(['ndus', text]);
  return pairs;
}
var CookieJar = /*#__PURE__*/function () {
  function CookieJar() {
    _classCallCheck(this, CookieJar);
    this.map = new Map();
  }
  return _createClass(CookieJar, [{
    key: "set",
    value: function set(name, value) {
      if (!name) return;
      if (value === undefined || value === null || value === '' || /^(deleted|expired)$/i.test(value)) {
        this.map["delete"](name);
      } else {
        this.map.set(name, String(value));
      }
    }
  }, {
    key: "get",
    value: function get(name) {
      return this.map.get(name);
    }
  }, {
    key: "has",
    value: function has(name) {
      return this.map.has(name);
    }
  }, {
    key: "importCookieString",
    value: function importCookieString(raw) {
      var _iterator2 = _createForOfIteratorHelper(parseCookieString(raw)),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
            name = _step2$value[0],
            value = _step2$value[1];
          this.set(name, value);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return this;
    }

    /** Records every Set-Cookie header of a response. */
  }, {
    key: "absorb",
    value: function absorb(headers) {
      if (!headers) return;
      var lines = [];
      try {
        if (typeof headers.getSetCookie === 'function') {
          lines = headers.getSetCookie() || [];
        }
      } catch (e) {
        lines = [];
      }
      if (!lines.length) {
        var joined = null;
        try {
          joined = headers.get('set-cookie');
        } catch (e) {
          joined = null;
        }
        if (joined) lines = splitSetCookie(joined);
      }
      var _iterator3 = _createForOfIteratorHelper(lines),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var line = _step3.value;
          var pair = String(line).split(';')[0];
          var idx = pair.indexOf('=');
          if (idx <= 0) continue;
          this.set(pair.slice(0, idx).trim(), pair.slice(idx + 1).trim());
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  }, {
    key: "header",
    value: function header() {
      var parts = [];
      this.map.forEach(function (value, name) {
        return parts.push("".concat(name, "=").concat(value));
      });
      return parts.join('; ');
    }
  }, {
    key: "size",
    get: function get() {
      return this.map.size;
    }
  }, {
    key: "clone",
    value: function clone() {
      var jar = new CookieJar();
      this.map.forEach(function (value, name) {
        return jar.map.set(name, value);
      });
      return jar;
    }
  }]);
}();
var HttpError = /*#__PURE__*/function (_Error) {
  function HttpError(message, cause) {
    var _this;
    _classCallCheck(this, HttpError);
    _this = _callSuper(this, HttpError, [message]);
    _this.name = 'HttpError';
    _this.cause = cause;
    return _this;
  }
  _inherits(HttpError, _Error);
  return _createClass(HttpError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
function withTimeout(promise, ms, label) {
  if (!(ms > 0) || typeof setTimeout !== 'function') return promise;
  var timer = null;
  var timeout = new Promise(function (_, reject) {
    timer = setTimeout(function () {
      return reject(new HttpError("".concat(label, " timed out after ").concat(Math.round(ms / 1000), "s")));
    }, ms);
  });
  return Promise.race([promise, timeout]).then(function (value) {
    if (timer && typeof clearTimeout === 'function') clearTimeout(timer);
    return value;
  }, function (err) {
    if (timer && typeof clearTimeout === 'function') clearTimeout(timer);
    throw err;
  });
}

/**
 * HTTP session: cookie jar + default headers + fetch wrapper.
 */
var HttpSession = /*#__PURE__*/function () {
  /**
   * @param {{userAgent?: string, timeoutMs?: number, logger?: any, fetchImpl?: Function, jar?: CookieJar}} opts
   */
  function HttpSession() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, HttpSession);
    this.userAgent = opts.userAgent || DEFAULT_USER_AGENT;
    this.timeoutMs = opts.timeoutMs || 25000;
    this.logger = opts.logger || null;
    this.fetchImpl = opts.fetchImpl || (typeof fetch === 'function' ? fetch : null);
    this.jar = opts.jar || new CookieJar();
    if (!this.fetchImpl) throw new Error('fetch is not available in this runtime');
  }
  return _createClass(HttpSession, [{
    key: "_debug",
    value: function _debug() {
      var _this$logger;
      if (this.logger && typeof this.logger.debug === 'function') (_this$logger = this.logger).debug.apply(_this$logger, arguments);
    }

    /**
     * @param {string} url
     * @param {{method?: string, headers?: object, body?: string, redirect?: 'follow'|'manual'|'error', referer?: string, accept?: string, timeoutMs?: number}} init
     * @returns {Promise<{status: number, ok: boolean, url: string, headers: any, text: string, json: () => any}>}
     */
  }, {
    key: "request",
    value: async function request(url) {
      var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var method = (init.method || 'GET').toUpperCase();
      var headers = {
        'User-Agent': this.userAgent,
        Accept: init.accept || '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache'
      };
      if (init.referer) headers.Referer = init.referer;
      var cookie = this.jar.header();
      if (cookie) headers.Cookie = cookie;
      if (init.headers) {
        for (var _i2 = 0, _Object$keys2 = Object.keys(init.headers); _i2 < _Object$keys2.length; _i2++) {
          var key = _Object$keys2[_i2];
          if (init.headers[key] === undefined || init.headers[key] === null) continue;
          headers[key] = init.headers[key];
        }
      }
      var fetchInit = {
        method: method,
        headers: headers,
        redirect: init.redirect || 'follow'
      };
      if (init.body !== undefined && method !== 'GET' && method !== 'HEAD') fetchInit.body = init.body;
      var controller = null;
      var timeoutMs = init.timeoutMs || this.timeoutMs;
      if (typeof AbortController === 'function' && timeoutMs > 0 && typeof setTimeout === 'function') {
        controller = new AbortController();
        fetchInit.signal = controller.signal;
        var t = setTimeout(function () {
          return controller.abort();
        }, timeoutMs);
        if (t && typeof t.unref === 'function') t.unref();
      }
      this._debug("[http] ".concat(method, " ").concat(url));
      var response;
      try {
        response = await withTimeout(this.fetchImpl(url, fetchInit), timeoutMs + 1000, "".concat(method, " ").concat(url));
      } catch (err) {
        throw new HttpError("Request failed: ".concat(method, " ").concat(url, " (").concat(err && err.message || err, ")"), err);
      }
      this.jar.absorb(response.headers);
      var text = '';
      if (method !== 'HEAD') {
        try {
          text = await response.text();
        } catch (e) {
          text = '';
        }
      }
      var status = Number(response.status) || 0;
      var finalUrl = response.url || url;
      this._debug("[http] -> ".concat(status, " ").concat(finalUrl, " (").concat(text.length, " bytes)"));
      return {
        status: status,
        ok: status >= 200 && status < 300,
        url: finalUrl,
        headers: response.headers,
        redirected: Boolean(response.redirected) || finalUrl !== url && finalUrl !== '',
        text: text,
        header: function header(name) {
          try {
            return response.headers.get(name);
          } catch (e) {
            return null;
          }
        },
        json: function json() {
          if (!text) return null;
          try {
            return JSON.parse(text);
          } catch (e) {
            return null;
          }
        }
      };
    }

    /** GET a page and return its HTML plus the final URL (after redirects). */
  }, {
    key: "html",
    value: async function html(url, referer) {
      var res = await this.request(url, {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        referer: referer,
        headers: {
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none'
        }
      });
      return res;
    }

    /** GET/POST a JSON API endpoint. */
  }, {
    key: "api",
    value: async function api(url) {
      var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var headers = Object.assign({
        'X-Requested-With': 'XMLHttpRequest',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      }, init.headers || {});
      return this.request(url, Object.assign({}, init, {
        accept: 'application/json, text/plain, */*',
        headers: headers
      }));
    }
  }]);
}();
;// ./src/url.js
function url_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = url_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function url_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return url_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? url_arrayLikeToArray(r, a) : void 0; } }
function url_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/**
 * TeraBox share-link parsing.
 *
 * TeraBox publishes the same share under many domains and two URL shapes:
 *   https://<host>/s/1AbCdEf…            (the leading "1" is a routing marker)
 *   https://<host>/sharing/link?surl=AbCdEf…
 * Everything downstream (and the TeraBox API itself) wants the bare id.
 */

/** Every domain TeraBox (and its white-label mirrors) is known to publish share links on. */
var SHARE_DOMAINS = ['terabox.com', 'terabox.app', 'terabox.fun', 'terabox.club', 'teraboxapp.com', 'teraboxlink.com', 'teraboxshare.com', 'teraboxurl.com', 'terasharelink.com', 'terafileshare.com', 'teraboxdownloader.com', '1024tera.com', '1024tera.cn', '1024terabox.com', '4funbox.com', '4funbox.co', 'mirrobox.com', 'nephobox.com', 'momerybox.com', 'tibibox.com', 'freeterabox.com', 'gibibox.com', 'goaibox.com', 'dubox.com'];

/** Hosts worth trying for API calls when the share host itself refuses (they share one backend). */
var API_FALLBACK_HOSTS = ['https://www.terabox.app', 'https://www.terabox.com', 'https://www.1024terabox.com', 'https://www.1024tera.com', 'https://www.teraboxapp.com'];

/** Chrome match patterns for manifest.json (both bare and sub-domain forms are needed). */
function buildMatchPatterns() {
  var patterns = [];
  var _iterator = url_createForOfIteratorHelper(SHARE_DOMAINS),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var domain = _step.value;
      patterns.push("*://".concat(domain, "/*"));
      patterns.push("*://*.".concat(domain, "/*"));
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return patterns;
}
var SURL_RE = /^[A-Za-z0-9_-]{6,64}$/;
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
function splitUrl(raw) {
  var text = String(raw || '').trim();
  var m = text.match(/^(?:([a-z][a-z0-9+.-]*):)?\/\/([^/?#]+)([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/i);
  if (!m) return null;
  var host = m[2].toLowerCase().replace(/:\d+$/, '');
  var query = {};
  if (m[4]) {
    var _iterator2 = url_createForOfIteratorHelper(m[4].split('&')),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var pair = _step2.value;
        if (!pair) continue;
        var idx = pair.indexOf('=');
        var key = safeDecode(idx >= 0 ? pair.slice(0, idx) : pair).trim();
        var value = idx >= 0 ? safeDecode(pair.slice(idx + 1).replace(/\+/g, ' ')) : '';
        if (key && !(key in query)) query[key] = value;
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  }
  return {
    scheme: (m[1] || 'https').toLowerCase(),
    host: host,
    path: m[3] || '/',
    query: query,
    hash: m[5] || '',
    origin: "".concat((m[1] || 'https').toLowerCase(), "://").concat(m[2])
  };
}

/** True when the host is a TeraBox share domain (or a sub-domain of one). */
function isTeraboxHost(host) {
  var h = String(host || '').toLowerCase();
  return SHARE_DOMAINS.some(function (d) {
    return h === d || h.endsWith('.' + d);
  });
}

/**
 * Parses any TeraBox share link into its bare short id, optional password and origin.
 * Returns null when the URL is not a share link.
 *
 * @param {string} raw
 * @returns {{surl: string, pwd: string, origin: string, host: string, path: string} | null}
 */
function parseShareUrl(raw) {
  var text = String(raw || '').trim();
  if (!text) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) text = 'https://' + text;
  var url = splitUrl(text);
  if (!url) return null;
  var surl = '';
  // Legacy form: /sharing/link?surl=AbCdEf (bare id, no routing marker).
  if (url.query.surl) {
    surl = url.query.surl.trim();
  } else {
    // Modern form: /s/1AbCdEf — the leading "1" is not part of the id.
    var m = url.path.match(/\/s\/([A-Za-z0-9_-]+)/);
    if (m) {
      surl = m[1];
      if (surl.length > 8 && surl.charAt(0) === '1') surl = surl.slice(1);
    }
  }
  surl = surl.replace(/[/?#]+$/, '');
  if (!surl || !SURL_RE.test(surl)) return null;
  var pwd = (url.query.pwd || url.query.password || url.query.code || '').trim();
  return {
    surl: surl,
    pwd: pwd,
    origin: url.origin,
    host: url.host,
    path: url.path
  };
}

/** Builds a query string from an object (skips undefined/null values). */
function toQuery(params) {
  var parts = [];
  for (var _i = 0, _Object$keys = Object.keys(params); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];
    var value = params[key];
    if (value === undefined || value === null) continue;
    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(value)));
  }
  return parts.join('&');
}
;// ./src/terabox.js
function terabox_typeof(o) { "@babel/helpers - typeof"; return terabox_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, terabox_typeof(o); }
function terabox_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = terabox_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function terabox_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return terabox_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? terabox_arrayLikeToArray(r, a) : void 0; } }
function terabox_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function terabox_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function terabox_defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, terabox_toPropertyKey(o.key), o); } }
function terabox_createClass(e, r, t) { return r && terabox_defineProperties(e.prototype, r), t && terabox_defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function terabox_toPropertyKey(t) { var i = terabox_toPrimitive(t, "string"); return "symbol" == terabox_typeof(i) ? i : i + ""; }
function terabox_toPrimitive(t, e) { if ("object" != terabox_typeof(t) || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != terabox_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); }
function terabox_callSuper(t, o, e) { return o = terabox_getPrototypeOf(o), terabox_possibleConstructorReturn(t, terabox_isNativeReflectConstruct() ? Reflect.construct(o, e || [], terabox_getPrototypeOf(t).constructor) : o.apply(t, e)); }
function terabox_possibleConstructorReturn(t, e) { if (e && ("object" == terabox_typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return terabox_assertThisInitialized(t); }
function terabox_assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function terabox_inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && terabox_setPrototypeOf(t, e); }
function terabox_wrapNativeSuper(t) { var r = "function" == typeof Map ? new Map() : void 0; return terabox_wrapNativeSuper = function _wrapNativeSuper(t) { if (null === t || !terabox_isNativeFunction(t)) return t; if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function"); if (void 0 !== r) { if (r.has(t)) return r.get(t); r.set(t, Wrapper); } function Wrapper() { return terabox_construct(t, arguments, terabox_getPrototypeOf(this).constructor); } return Wrapper.prototype = Object.create(t.prototype, { constructor: { value: Wrapper, enumerable: !1, writable: !0, configurable: !0 } }), terabox_setPrototypeOf(Wrapper, t); }, terabox_wrapNativeSuper(t); }
function terabox_construct(t, e, r) { if (terabox_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && terabox_setPrototypeOf(p, r.prototype), p; }
function terabox_isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (terabox_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function terabox_isNativeFunction(t) { try { return -1 !== Function.toString.call(t).indexOf("[native code]"); } catch (n) { return "function" == typeof t; } }
function terabox_setPrototypeOf(t, e) { return terabox_setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, terabox_setPrototypeOf(t, e); }
function terabox_getPrototypeOf(t) { return terabox_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, terabox_getPrototypeOf(t); }
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

;

var APP_ID = '250528';
/** First-party domains whose `www.` host serves the share API. */
var API_DOMAINS = ['terabox.app', 'terabox.com', '1024terabox.com', '1024tera.com', 'teraboxapp.com', 'dubox.com'];
var PAGE_SIZE = 100;
var MAX_PAGES = 50;

/* -------------------------------------------------------------------------- */
/*                                   Errors                                   */
/* -------------------------------------------------------------------------- */

var TeraboxError = /*#__PURE__*/function (_Error) {
  /**
   * @param {string} code
   * @param {string} message
   * @param {string} [hint]
   * @param {number} [errno]
   */
  function TeraboxError(code, message, hint, errno) {
    var _this;
    terabox_classCallCheck(this, TeraboxError);
    _this = terabox_callSuper(this, TeraboxError, [message]);
    _this.name = 'TeraboxError';
    _this.code = code;
    _this.hint = hint || '';
    _this.errno = errno;
    return _this;
  }

  /** Human readable message shown to the user by Gopeed. */
  terabox_inherits(TeraboxError, _Error);
  return terabox_createClass(TeraboxError, [{
    key: "toUserMessage",
    value: function toUserMessage() {
      return this.hint ? "".concat(this.message, " ").concat(this.hint) : this.message;
    }
  }]);
}(/*#__PURE__*/terabox_wrapNativeSuper(Error));

/** Definitive answers — trying another mirror cannot help. */
var FATAL_CODES = new Set(['INVALID_SHARE_URL', 'NOT_FOUND', 'PASSWORD_REQUIRED', 'WRONG_PASSWORD', 'CAPTCHA_REQUIRED', 'REGION_BLOCKED', 'LOGIN_REQUIRED', 'EMPTY_SHARE']);

/** "The anti‑bot token went stale" — refresh `jsToken` and retry once. */
var TOKEN_REFRESH_ERRNOS = new Set([-6, 4000020, 400141, 460020]);
var LOGIN_HINT = 'TeraBox only hands out direct download links to logged-in sessions. Log in at https://www.terabox.app in your browser, ' + 'copy the value of the `ndus` cookie (DevTools → Application → Cookies) and paste it into the extension settings ' + '(Gopeed → Extensions → TeraBox → Settings → "TeraBox cookie").';
function mapErrno(errno, errmsg, context) {
  var n = Number(errno);
  var detail = errmsg ? " (".concat(String(errmsg).replace(/[<>]/g, '').slice(0, 120), ")") : '';
  switch (n) {
    case 0:
      return null;
    case -9:
      if (context === 'init') {
        return new TeraboxError('PASSWORD_REQUIRED', 'This TeraBox share is password protected.', 'Append ?pwd=XXXX to the link (e.g. https://terabox.com/s/1abc?pwd=1234) or set a default password in the extension settings.', n);
      }
      if (context === 'verify') {
        return new TeraboxError('WRONG_PASSWORD', 'TeraBox rejected the share password.', 'Double-check the ?pwd= value.', n);
      }
      return new TeraboxError('NOT_FOUND', "This TeraBox share is expired, deleted or private".concat(detail, "."), 'Ask the sender for a fresh link.', n);
    case -12:
      return new TeraboxError('WRONG_PASSWORD', "TeraBox did not accept the share password".concat(detail, "."), 'Double-check the ?pwd= value.', n);
    case -62:
    case -20:
    case -19:
      return new TeraboxError('CAPTCHA_REQUIRED', "TeraBox is asking for a captcha before releasing this share".concat(detail, "."), 'Open the share link once in your browser (logged in), solve the captcha, then retry.', n);
    case -10:
    case -21:
    case 105:
    case 115:
    case 116:
    case 145:
      return new TeraboxError('NOT_FOUND', "This TeraBox share is expired, deleted or blocked".concat(detail, "."), 'Ask the sender for a fresh link.', n);
    case 2:
    case 112:
      if (context === 'download') {
        return new TeraboxError('LOGIN_REQUIRED', "TeraBox refused to sign the download link (errno ".concat(n, ")."), LOGIN_HINT, n);
      }
      return new TeraboxError('UPSTREAM_ERROR', "TeraBox answered with errno ".concat(n).concat(detail, "."), 'Retry in a moment.', n);
    case -3:
    case -6:
    case 4000020:
    case 400141:
      return new TeraboxError(context === 'download' ? 'LOGIN_REQUIRED' : 'TOKEN_EXPIRED', "TeraBox considers this session invalid (errno ".concat(n, ")").concat(detail, "."), context === 'download' ? 'Your cookie may have expired — log in again and update it. ' + LOGIN_HINT : 'Retry in a moment.', n);
    case 400210:
    case 460020:
      return new TeraboxError('VERIFICATION_REQUIRED', "TeraBox served a verification wall instead of the share (errno ".concat(n, ")."), 'Your IP is being challenged. Setting a logged-in cookie in the extension settings usually fixes it; otherwise retry in a few minutes or choose another API mirror.', n);
    case 9000:
      return new TeraboxError('REGION_BLOCKED', 'TeraBox is not available from your region.', 'Use a proxy/VPN (Gopeed → Settings → Proxy) and retry.', n);
    case 130:
      return new TeraboxError('UPSTREAM_ERROR', "TeraBox refused the request (errno 130)".concat(detail, "."), 'This usually means a VIP-only resource or a blocked file.', n);
    default:
      return new TeraboxError('UPSTREAM_ERROR', "TeraBox answered with an unexpected error (errno ".concat(n, ")").concat(detail, "."), 'TeraBox rotates its API without notice — retry in a moment.', n);
  }
}

/* -------------------------------------------------------------------------- */
/*                               Token scraping                               */
/* -------------------------------------------------------------------------- */

function terabox_safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return value;
  }
}

/** `jsToken` is embedded inside a percent-encoded anti-bot trampoline: `fn%28%22<TOKEN>%22%29`. */
function normaliseJsToken(raw) {
  if (!raw) return '';
  var value = String(raw).trim();
  var inner = value.match(/%22([A-Za-z0-9_%+/-]{16,})%22/);
  var candidate = inner ? terabox_safeDecode(inner[1]) : terabox_safeDecode(value);
  var token = candidate.replace(/^["']|["']$/g, '').trim();
  return token.length >= 8 && /^[A-Za-z0-9_+/=-]+$/.test(token) ? token.slice(0, 200) : '';
}
var JS_TOKEN_PATTERNS = [/"jsToken"\s*:\s*"function%20fn%28a%29%7Bwindow\.jsToken%20%3D%20a%7D%3Bfn%28%22([^"\\]+)%22%29/, /fn\("%28%22([A-Za-z0-9_%+/-]{16,})%22%29"\)/, /fn%28%22([A-Za-z0-9_%+/-]{16,})%22%29/, /window\.jsToken\s*[:=]\s*["'`]([^"'`]{8,})/, /jsToken["'\s:=]+([A-Za-z0-9_+-]{8,})/i];
function metaValue(html, key, allow) {
  var re = new RegExp("(?:[\"']?".concat(key, "[\"']?)\\s*[:=]\\s*[\"']([").concat(allow, "]{3,})[\"']"), 'i');
  var m = html.match(re);
  return m ? m[1] : '';
}

/**
 * Extracts the anti-bot tokens and (when present) share metadata from a TeraBox HTML page.
 * @param {string} html
 */
function extractTokens(html) {
  var text = String(html || '');
  var tokens = {
    jsToken: '',
    logid: '',
    bdstoken: '',
    title: '',
    uk: '',
    shareid: '',
    sign: '',
    timestamp: '',
    randsk: ''
  };
  var _iterator = terabox_createForOfIteratorHelper(JS_TOKEN_PATTERNS),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var pattern = _step.value;
      var m = text.match(pattern);
      var candidate = normaliseJsToken(m && m[1]);
      if (candidate) {
        tokens.jsToken = candidate;
        break;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var logid = text.match(/(?:dp-logid=|"dp-logid"\s*:\s*"?)(\d{6,})/) || text.match(/logid["'\s:=]+(\d{6,})/i);
  if (logid) tokens.logid = logid[1];
  var bd = text.match(/bdstoken["'\s:=]+([A-Za-z0-9_-]{8,})/i);
  if (bd) tokens.bdstoken = bd[1];
  var title = text.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) || text.match(/<title>([^<]{1,200})<\/title>/i);
  if (title) tokens.title = terabox_safeDecode(title[1]).replace(/&amp;/g, '&').trim();
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
  var parts = splitUrl(url);
  return parts ? parts.origin : '';
}
function absolutize(location, base) {
  if (!location) return '';
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(location)) return location;
  var b = splitUrl(base);
  if (!b) return location;
  if (location.charAt(0) === '/') return b.origin + location;
  return b.origin + b.path.replace(/[^/]*$/, '') + location;
}

/** Signed TeraBox URLs carry their expiry: `expires=1767791721` (epoch) or `expires=8h`. */
function parseExpires(url, nowSec) {
  var now = nowSec || Math.floor(Date.now() / 1000);
  var parts = splitUrl(url);
  if (!parts) return now + 6 * 3600;
  var q = parts.query;
  var raw = q.expires || q.Expires || '';
  if (/^\d{9,}$/.test(raw)) return Number(raw);
  var rel = raw.match(/^(\d+)([smhd])$/i);
  if (rel) {
    var mult = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400
    }[rel[2].toLowerCase()];
    var start = /^\d{9,}$/.test(q.time || '') ? Number(q.time) : now;
    return start + Number(rel[1]) * mult;
  }
  return now + 6 * 3600;
}
function errnoOf(body) {
  if (!body || terabox_typeof(body) !== 'object') return NaN;
  var raw = body.errno !== undefined ? body.errno : body.code !== undefined ? body.code : 0;
  var n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
}
function entriesOf(body) {
  if (!body) return [];
  if (Array.isArray(body.list)) return body.list;
  if (Array.isArray(body.file_list)) return body.file_list;
  return [];
}

/** Normalises one `share/list` / `shorturlinfo` entry. */
function toFile(entry) {
  if (!entry) return null;
  var name = String(entry.server_filename || entry.filename || '').trim();
  if (!name) return null;
  var path = String(entry.path || "/".concat(name)).trim() || "/".concat(name);
  var size = Number(entry.size || 0);
  var dlink = typeof entry.dlink === 'string' ? entry.dlink.replace(/&amp;/g, '&').trim() : '';
  return {
    name: name,
    path: path,
    size: Number.isFinite(size) && size > 0 ? size : 0,
    isDir: Number(entry.isdir !== undefined ? entry.isdir : entry.is_dir || 0) === 1,
    fsId: entry.fs_id !== undefined && entry.fs_id !== null ? String(entry.fs_id) : '',
    md5: typeof entry.md5 === 'string' ? entry.md5 : '',
    category: Number(entry.category || 0) || 0,
    ctime: Number(entry.server_ctime || entry.create_time || 0) || 0,
    dlink: dlink
  };
}

/** Runs `worker` over `items` with at most `limit` in flight, preserving order. */
async function mapLimit(items, limit, worker) {
  var results = new Array(items.length);
  var next = 0;
  var lanes = [];
  var n = Math.max(1, Math.min(limit, items.length));
  for (var lane = 0; lane < n; lane++) {
    lanes.push(async function () {
      for (;;) {
        var index = next++;
        if (index >= items.length) return;
        results[index] = await worker(items[index], index);
      }
    }());
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

var TeraboxClient = /*#__PURE__*/function () {
  /**
   * @param {{cookie?: string, userAgent?: string, mirror?: string, apiBase?: string, logger?: any, timeoutMs?: number, fetchImpl?: Function}} opts
   */
  function TeraboxClient() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    terabox_classCallCheck(this, TeraboxClient);
    this.cookie = String(opts.cookie || '').trim();
    this.userAgent = String(opts.userAgent || '').trim() || DEFAULT_USER_AGENT;
    this.mirror = String(opts.mirror || '').trim().replace(/\/+$/, '');
    this.apiBase = String(opts.apiBase || '').trim().replace(/\/+$/, '');
    this.logger = opts.logger || null;
    this.timeoutMs = opts.timeoutMs || 25000;
    this.fetchImpl = opts.fetchImpl;
  }
  return terabox_createClass(TeraboxClient, [{
    key: "_log",
    value: function _log(level) {
      var _this$logger;
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      if (this.logger && typeof this.logger[level] === 'function') (_this$logger = this.logger)[level].apply(_this$logger, args);
    }
  }, {
    key: "_newHttp",
    value: function _newHttp() {
      var jar = new CookieJar().importCookieString(this.cookie);
      return new HttpSession({
        userAgent: this.userAgent,
        timeoutMs: this.timeoutMs,
        logger: this.logger,
        fetchImpl: this.fetchImpl,
        jar: jar
      });
    }
  }, {
    key: "loggedIn",
    get: function get() {
      return new CookieJar().importCookieString(this.cookie).has('ndus');
    }

    /** API origins to try, most likely first. */
  }, {
    key: "candidateBases",
    value: function candidateBases(origin) {
      var list = [];
      if (this.mirror && /^https?:\/\//i.test(this.mirror) && this.mirror.toLowerCase() !== 'auto') list.push(this.mirror);
      if (origin) {
        var parts = splitUrl(origin);
        if (parts && isTeraboxHost(parts.host)) {
          // Only the first-party domains answer API calls; white-label mirrors (teraboxlink.com…) just redirect.
          var host = parts.host.replace(/^www\./, '');
          if (API_DOMAINS.indexOf(host) >= 0) list.push("https://www.".concat(host));
        }
      }
      var _iterator2 = terabox_createForOfIteratorHelper(API_FALLBACK_HOSTS),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var base = _step2.value;
          list.push(base);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      var seen = new Set();
      return list.filter(function (base) {
        var key = base.toLowerCase();
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
  }, {
    key: "openSession",
    value: async function openSession(base, surl) {
      var http = this._newHttp();
      var pageUrl = "".concat(base, "/sharing/link?surl=").concat(encodeURIComponent(surl));
      var page;
      try {
        page = await http.html(pageUrl, "".concat(base, "/"));
      } catch (err) {
        throw new TeraboxError('PAGE_UNREACHABLE', "TeraBox did not answer at ".concat(base, "."), err && err.message || '', undefined);
      }
      if (page.status === 404) {
        throw new TeraboxError('NOT_FOUND', 'TeraBox returned 404 for this share link.', 'Expired or deleted shares stop working — ask for a fresh link.');
      }
      if (page.status >= 400) {
        throw new TeraboxError('PAGE_UNREACHABLE', "TeraBox returned HTTP ".concat(page.status, " for the share page at ").concat(base, "."));
      }
      var session = {
        base: originOf(page.url) || base,
        pageUrl: page.url || pageUrl,
        surl: surl,
        http: http,
        tokens: extractTokens(page.text),
        meta: {
          shareid: '',
          uk: '',
          sign: '',
          timestamp: '',
          sekey: ''
        },
        loggedIn: http.jar.has('ndus')
      };
      if (!session.tokens.jsToken) {
        await this._refreshTokens(session);
      }
      if (!session.tokens.jsToken) {
        var embed = await http.html("".concat(session.base, "/sharing/embed?surl=").concat(encodeURIComponent(surl)), session.pageUrl)["catch"](function () {
          return null;
        });
        if (embed && embed.status < 400) {
          var extra = extractTokens(embed.text);
          if (extra.jsToken) session.tokens.jsToken = extra.jsToken;
          if (extra.logid && !session.tokens.logid) session.tokens.logid = extra.logid;
        }
      }
      if (!session.tokens.jsToken) {
        throw new TeraboxError('VERIFICATION_REQUIRED', "TeraBox served a verification/anti-bot page instead of the share at ".concat(session.base, "."), 'Setting a logged-in cookie in the extension settings usually fixes it; otherwise retry later or choose another API mirror.');
      }
      this._log('debug', "[terabox] session on ".concat(session.base, " jsToken=").concat(session.tokens.jsToken.slice(0, 8), "\u2026 logid=").concat(session.tokens.logid, " loggedIn=").concat(session.loggedIn));
      return session;
    }

    /** Re-scrapes `/main` so a stale `jsToken` is replaced. */
  }, {
    key: "_refreshTokens",
    value: async function _refreshTokens(session) {
      var before = session.tokens.jsToken;
      var main = await session.http.html("".concat(session.base, "/main"), session.pageUrl)["catch"](function () {
        return null;
      });
      if (!main || main.status >= 400) return false;
      var extra = extractTokens(main.text);
      if (extra.jsToken) session.tokens.jsToken = extra.jsToken;
      if (extra.logid) session.tokens.logid = extra.logid;
      if (extra.bdstoken) session.tokens.bdstoken = extra.bdstoken;
      return Boolean(session.tokens.jsToken) && session.tokens.jsToken !== before;
    }
  }, {
    key: "_commonParams",
    value: function _commonParams(session) {
      var params = {
        app_id: APP_ID,
        web: '1',
        channel: 'dubox',
        clienttype: '0'
      };
      if (session.tokens.jsToken) params.jsToken = session.tokens.jsToken;
      if (session.tokens.logid) params['dp-logid'] = session.tokens.logid;
      return params;
    }
  }, {
    key: "_callApi",
    value: async function _callApi(session, path, params, context) {
      var init = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
      var url = "".concat(session.base).concat(path, "?").concat(toQuery(params));
      var res = await session.http.api(url, Object.assign({
        referer: session.pageUrl
      }, init));
      var body = res.json();
      var errno = errnoOf(body);
      if (TOKEN_REFRESH_ERRNOS.has(errno)) {
        this._log('debug', "[terabox] errno ".concat(errno, " on ").concat(path, " \u2014 refreshing jsToken"));
        if (await this._refreshTokens(session)) {
          if (params.jsToken) params.jsToken = session.tokens.jsToken;
          if (params['dp-logid'] !== undefined && session.tokens.logid) params['dp-logid'] = session.tokens.logid;
          res = await session.http.api("".concat(session.base).concat(path, "?").concat(toQuery(params)), Object.assign({
            referer: session.pageUrl
          }, init));
          body = res.json();
          errno = errnoOf(body);
        }
      }
      if (!body) {
        if (res.status >= 400) throw new TeraboxError('PAGE_UNREACHABLE', "TeraBox returned HTTP ".concat(res.status, " for ").concat(path, "."));
        throw new TeraboxError('UPSTREAM_ERROR', "TeraBox returned an unreadable response for ".concat(path, "."), 'Retry in a moment.');
      }
      if (Number.isNaN(errno)) errno = 0;
      var failure = mapErrno(errno, body.errmsg || body.show_msg || body.error_msg, context);
      if (failure) throw failure;
      return body;
    }

    /* --------------------------- password shares ----------------------------- */
  }, {
    key: "verifyPassword",
    value: async function verifyPassword(session, pwd) {
      var params = Object.assign(this._commonParams(session), {
        surl: session.surl
      });
      var body = await this._callApi(session, '/share/verify', params, 'verify', {
        method: 'POST',
        body: toQuery({
          pwd: pwd,
          vcode: '',
          vcode_str: ''
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Origin: session.base
        }
      });
      var randsk = body.randsk ? String(body.randsk) : '';
      if (randsk) {
        session.meta.sekey = terabox_safeDecode(randsk);
        session.http.jar.set('BOXCLND', randsk);
      }
      this._log('debug', "[terabox] password accepted for ".concat(session.surl));
      return session;
    }

    /* ------------------------------- listing --------------------------------- */

    /** `/api/shorturlinfo`: the share record (root listing + signing material). */
  }, {
    key: "shortUrlInfo",
    value: async function shortUrlInfo(session, pwdProvided) {
      var params = Object.assign(this._commonParams(session), {
        shorturl: "1".concat(session.surl),
        root: '1',
        scene: ''
      });
      if (session.meta.sekey) params.sekey = session.meta.sekey;
      var body;
      try {
        body = await this._callApi(session, '/api/shorturlinfo', params, 'init');
      } catch (err) {
        if (err instanceof TeraboxError && err.code === 'PASSWORD_REQUIRED' && pwdProvided) {
          throw new TeraboxError('WRONG_PASSWORD', 'TeraBox did not accept the share password.', 'Double-check the ?pwd= value.', err.errno);
        }
        throw err;
      }
      session.meta.shareid = body.shareid !== undefined ? String(body.shareid) : session.meta.shareid;
      session.meta.uk = body.uk !== undefined ? String(body.uk) : session.meta.uk;
      session.meta.sign = body.sign ? String(body.sign) : session.meta.sign;
      session.meta.timestamp = body.timestamp !== undefined ? String(body.timestamp) : session.meta.timestamp;
      if (body.randsk && !session.meta.sekey) session.meta.sekey = terabox_safeDecode(String(body.randsk));
      var title = typeof body.title === 'string' ? body.title.replace(/^\//, '') : '';
      var fcount = Number(body.fcount || 0) || 0;
      return {
        entries: entriesOf(body).map(toFile).filter(Boolean),
        title: title,
        fcount: fcount
      };
    }

    /** One page of `/share/list` (root when `dir` is empty). */
  }, {
    key: "listPage",
    value: async function listPage(session, dir, page) {
      var params = Object.assign(this._commonParams(session), {
        page: String(page),
        num: String(PAGE_SIZE),
        by: 'name',
        order: 'asc',
        shorturl: session.surl
      });
      if (dir) params.dir = dir;else params.root = '1';
      var _session$meta = session.meta,
        shareid = _session$meta.shareid,
        uk = _session$meta.uk,
        sign = _session$meta.sign,
        timestamp = _session$meta.timestamp,
        sekey = _session$meta.sekey;
      if (sign) params.sign = sign;
      if (timestamp) params.timestamp = timestamp;
      if (shareid) params.shareid = shareid;
      if (uk) params.uk = uk;
      if (sekey) {
        params.sekey = sekey;
        // The web player mirrors `randsk` into the TSID cookie for protected shares.
        session.http.jar.set('TSID', sekey);
      }
      var body = await this._callApi(session, '/share/list', params, 'list');
      return entriesOf(body).map(toFile).filter(Boolean);
    }

    /** All pages of a directory. */
  }, {
    key: "listAll",
    value: async function listAll(session, dir) {
      var all = [];
      for (var page = 1; page <= MAX_PAGES; page++) {
        var entries = await this.listPage(session, dir, page);
        var _iterator3 = terabox_createForOfIteratorHelper(entries),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var entry = _step3.value;
            all.push(entry);
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
        if (entries.length < PAGE_SIZE) break;
      }
      return all;
    }

    /**
     * Walks folders breadth-first and returns the flat list of files (directories excluded).
     */
  }, {
    key: "collectFiles",
    value: async function collectFiles(session, rootEntries) {
      var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        _ref$maxFiles = _ref.maxFiles,
        maxFiles = _ref$maxFiles === void 0 ? 200 : _ref$maxFiles,
        _ref$maxDepth = _ref.maxDepth,
        maxDepth = _ref$maxDepth === void 0 ? 5 : _ref$maxDepth;
      var files = [];
      var truncated = false;
      var queue = [{
        entries: rootEntries,
        depth: 0
      }];
      while (queue.length && files.length < maxFiles) {
        var current = queue.shift();
        var _iterator4 = terabox_createForOfIteratorHelper(current.entries),
          _step4;
        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var entry = _step4.value;
            if (files.length >= maxFiles) {
              truncated = true;
              break;
            }
            if (!entry.isDir) {
              files.push(entry);
              continue;
            }
            if (current.depth >= maxDepth) {
              this._log('warn', "[terabox] folder depth limit reached, skipping ".concat(entry.path));
              continue;
            }
            try {
              var children = await this.listAll(session, entry.path);
              queue.push({
                entries: children,
                depth: current.depth + 1
              });
            } catch (err) {
              this._log('warn', "[terabox] could not list folder ".concat(entry.path, ": ").concat(err && err.message || err));
            }
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }
      }
      if (queue.some(function (q) {
        return q.entries.length;
      })) truncated = true;
      return {
        files: files,
        truncated: truncated
      };
    }

    /* ------------------------------- resolve --------------------------------- */

    /**
     * Resolves a share link into its file list (no download links yet).
     * @param {string|{surl: string, pwd?: string, origin?: string}} input
     * @param {{defaultPassword?: string, maxFiles?: number, maxDepth?: number}} options
     */
  }, {
    key: "resolveShare",
    value: async function resolveShare(input) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var parsed = typeof input === 'string' ? parseShareUrl(input) : input;
      if (!parsed || !parsed.surl) {
        throw new TeraboxError('INVALID_SHARE_URL', 'This does not look like a TeraBox share link.', 'Expected something like https://www.terabox.com/s/1AbCdEf… or https://terabox.app/sharing/link?surl=…');
      }
      var surl = parsed.surl;
      var pwd = String(parsed.pwd || options.defaultPassword || '').trim();
      if (this.apiBase) return this._resolveViaApi(surl, pwd, options);
      var errors = [];
      var _iterator5 = terabox_createForOfIteratorHelper(this.candidateBases(parsed.origin)),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var base = _step5.value;
          try {
            var session = await this.openSession(base, surl);
            if (pwd) await this.verifyPassword(session, pwd);
            var info = await this.shortUrlInfo(session, Boolean(pwd));
            var root = info.entries;
            if (!root.length || info.fcount > root.length && root.every(function (e) {
              return !e.isDir;
            })) {
              // shorturlinfo only returns the first page of a big root listing.
              var full = await this.listAll(session, '')["catch"](function () {
                return [];
              });
              if (full.length >= root.length) root = full;
            }
            if (!root.length) {
              throw new TeraboxError('EMPTY_SHARE', 'This TeraBox share is empty.', 'Open it in a browser to confirm the sender did not delete the files.');
            }
            var _await$this$collectFi = await this.collectFiles(session, root, options),
              files = _await$this$collectFi.files,
              truncated = _await$this$collectFi.truncated;
            if (!files.length) {
              throw new TeraboxError('EMPTY_SHARE', 'This TeraBox share only contains empty folders.', '');
            }
            return {
              mode: 'direct',
              surl: surl,
              pwd: pwd,
              base: session.base,
              pageUrl: session.pageUrl,
              title: info.title || session.tokens.title || '',
              meta: session.meta,
              files: files,
              truncated: truncated,
              loggedIn: session.loggedIn,
              session: session
            };
          } catch (err) {
            var e = err instanceof TeraboxError ? err : new TeraboxError('UPSTREAM_ERROR', err && err.message || String(err));
            this._log('warn', "[terabox] ".concat(base, ": ").concat(e.code, " ").concat(e.message));
            if (FATAL_CODES.has(e.code)) throw e;
            errors.push(e);
            if (!(e.code === 'VERIFICATION_REQUIRED' || e.code === 'PAGE_UNREACHABLE' || e.code === 'UPSTREAM_ERROR' || e.code === 'TOKEN_EXPIRED')) {
              throw e;
            }
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
      throw errors.find(function (e) {
        return e.code === 'VERIFICATION_REQUIRED';
      }) || errors[0] || new TeraboxError('PAGE_UNREACHABLE', 'TeraBox could not be reached.');
    }

    /* ---------------------------- link minting ------------------------------- */

    /**
     * Mints a direct, range-capable download URL for one file of a resolved share.
     * @param {{session: ShareSession, pageUrl: string}} share
     * @param {{fsId: string, dlink?: string, name: string}} file
     * @returns {Promise<{url: string, headers: object, expires: number, dlink: string}>}
     */
  }, {
    key: "mintLink",
    value: async function mintLink(share, file) {
      if (share.mode === 'api') return this._mintViaApi(share, file);
      var session = share.session;
      var dlink = file.dlink || '';
      if (!dlink) {
        var _session$meta2 = session.meta,
          shareid = _session$meta2.shareid,
          uk = _session$meta2.uk,
          sign = _session$meta2.sign,
          timestamp = _session$meta2.timestamp,
          sekey = _session$meta2.sekey;
        if (!(shareid && uk && sign && timestamp)) {
          throw new TeraboxError('UPSTREAM_ERROR', 'TeraBox did not provide the signing material for this share.', 'Retry in a moment.');
        }
        if (!file.fsId) throw new TeraboxError('UPSTREAM_ERROR', "TeraBox did not provide an id for ".concat(file.name, "."));
        var params = Object.assign(this._commonParams(session), {
          shareid: shareid,
          uk: uk,
          sign: sign,
          timestamp: timestamp,
          primaryid: shareid,
          product: 'share',
          nozip: '0',
          fid_list: "[".concat(file.fsId, "]")
        });
        if (sekey) params.sekey = sekey;
        var body;
        try {
          body = await this._callApi(session, '/share/download', params, 'download');
        } catch (err) {
          if (err instanceof TeraboxError && err.code === 'LOGIN_REQUIRED' && !session.loggedIn) {
            throw new TeraboxError('LOGIN_REQUIRED', 'TeraBox refused to hand out a download link to an anonymous session.', LOGIN_HINT, err.errno);
          }
          throw err;
        }
        dlink = typeof body.dlink === 'string' ? body.dlink : '';
        if (!dlink) {
          var entry = entriesOf(body).find(function (e) {
            return e && typeof e.dlink === 'string' && e.dlink;
          });
          if (entry) dlink = entry.dlink;
        }
        dlink = String(dlink || '').replace(/&amp;/g, '&').trim();
        if (!dlink) {
          throw new TeraboxError('LOGIN_REQUIRED', "TeraBox answered without a download link for ".concat(file.name, "."), session.loggedIn ? 'Your cookie may have expired — log in again and update it.' : LOGIN_HINT);
        }
      }
      var resolved = await this._resolveRedirect(session, dlink);
      var url = resolved || dlink;
      var headers = {
        'User-Agent': this.userAgent,
        Referer: session.pageUrl
      };
      if (url === dlink) {
        // The redirector itself needs the session cookie; the CDN behind it does not.
        var cookie = session.http.jar.header();
        if (cookie) headers.Cookie = cookie;
      }
      return {
        url: url,
        headers: headers,
        expires: parseExpires(url),
        dlink: dlink
      };
    }

    /** Follows the `dlink` redirector once so Gopeed can open N connections straight to the CDN. */
  }, {
    key: "_resolveRedirect",
    value: async function _resolveRedirect(session, dlink) {
      var attempt = async function attempt(method, extraHeaders) {
        var res = await session.http.request(dlink, {
          method: method,
          redirect: 'manual',
          referer: session.pageUrl,
          headers: extraHeaders
        });
        var location = res.header('location');
        if (res.status >= 300 && res.status < 400 && location) return absolutize(location, dlink);
        if (res.status >= 200 && res.status < 300 && res.url && res.url !== dlink) return res.url; // runtime followed anyway
        if (res.status === 401 || res.status === 403) {
          throw new TeraboxError('LOGIN_REQUIRED', "TeraBox refused the download link (HTTP ".concat(res.status, ")."), LOGIN_HINT);
        }
        if (res.status === 405 || res.status === 501) return undefined; // HEAD unsupported → caller retries with GET
        return '';
      };
      try {
        var _final = await attempt('HEAD');
        if (_final === undefined) _final = await attempt('GET', {
          Range: 'bytes=0-0'
        });
        return _final || '';
      } catch (err) {
        if (err instanceof TeraboxError) throw err;
        this._log('warn', "[terabox] could not pre-resolve dlink redirect: ".concat(err && err.message || err));
        return '';
      }
    }

    /**
     * Convenience used by onStart/onError: re-runs the whole flow for a single file id and returns a fresh link.
     */
  }, {
    key: "refreshLink",
    value: async function refreshLink(_ref2) {
      var surl = _ref2.surl,
        pwd = _ref2.pwd,
        fsId = _ref2.fsId,
        origin = _ref2.origin,
        name = _ref2.name;
      if (this.apiBase) {
        var share = await this._resolveViaApi(surl, pwd || '', {
          maxFiles: 1000,
          maxDepth: 5
        });
        var file = share.files.find(function (f) {
          return f.fsId === String(fsId);
        }) || {
          fsId: String(fsId),
          name: name || ''
        };
        return this.mintLink(share, file);
      }
      var errors = [];
      var _iterator6 = terabox_createForOfIteratorHelper(this.candidateBases(origin)),
        _step6;
      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var base = _step6.value;
          try {
            var session = await this.openSession(base, surl);
            if (pwd) await this.verifyPassword(session, pwd);
            var info = await this.shortUrlInfo(session, Boolean(pwd));
            var listed = info.entries.find(function (f) {
              return f.fsId === String(fsId);
            });
            var _share = {
              mode: 'direct',
              session: session,
              pageUrl: session.pageUrl
            };
            return await this.mintLink(_share, {
              fsId: String(fsId),
              name: name || listed && listed.name || '',
              dlink: listed ? listed.dlink : ''
            });
          } catch (err) {
            var e = err instanceof TeraboxError ? err : new TeraboxError('UPSTREAM_ERROR', err && err.message || String(err));
            if (FATAL_CODES.has(e.code)) throw e;
            errors.push(e);
          }
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
      throw errors[0] || new TeraboxError('PAGE_UNREACHABLE', 'TeraBox could not be reached.');
    }

    /* ------------------------ Trauso-compatible worker ----------------------- */
  }, {
    key: "_apiGet",
    value: async function _apiGet(path, params) {
      var http = this._newHttp();
      var res = await http.api("".concat(this.apiBase).concat(path, "?").concat(toQuery(params)), {
        referer: "".concat(this.apiBase, "/"),
        headers: {
          Origin: this.apiBase
        }
      });
      return {
        res: res,
        body: res.json()
      };
    }
  }, {
    key: "_apiPost",
    value: async function _apiPost(path, payload) {
      var http = this._newHttp();
      var res = await http.api("".concat(this.apiBase).concat(path), {
        method: 'POST',
        body: JSON.stringify(payload),
        referer: "".concat(this.apiBase, "/"),
        headers: {
          'Content-Type': 'application/json',
          Origin: this.apiBase
        }
      });
      return {
        res: res,
        body: res.json()
      };
    }
  }, {
    key: "_resolveViaApi",
    value: async function _resolveViaApi(surl, pwd) {
      var _this2 = this;
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var last = 'Unknown error';
      var _loop = async function _loop() {
          var path = _arr[_i];
          var out;
          try {
            out = await _this2._apiGet(path, {
              shorturl: "1".concat(surl),
              pwd: pwd || ''
            });
          } catch (err) {
            last = err && err.message || String(err);
            return 0; // continue
          }
          var _out = out,
            res = _out.res,
            body = _out.body;
          if (!body) {
            last = "HTTP ".concat(res.status, " from ").concat(path);
            return 0; // continue
          }
          if (!body.ok) {
            last = body.message || "".concat(path, " answered ok=false");
            return 0; // continue
          }
          var files = [];
          var _walk = function walk(items, parent, depth) {
            var _iterator7 = terabox_createForOfIteratorHelper(items || []),
              _step7;
            try {
              for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
                var item = _step7.value;
                var name = String(item.filename || item.server_filename || '').trim();
                if (!name) continue;
                var _path = "".concat(parent, "/").concat(name);
                var isDir = String(item.is_dir !== undefined ? item.is_dir : item.isdir) === '1';
                if (isDir) {
                  if (depth < (options.maxDepth || 5)) _walk(item.children, _path, depth + 1);
                  continue;
                }
                if (files.length >= (options.maxFiles || 200)) continue;
                files.push({
                  name: name,
                  path: _path,
                  size: Number(item.size || 0) || 0,
                  isDir: false,
                  fsId: String(item.fs_id),
                  md5: '',
                  category: Number(item.category || 0) || 0,
                  ctime: Number(item.create_time || 0) || 0,
                  dlink: ''
                });
              }
            } catch (err) {
              _iterator7.e(err);
            } finally {
              _iterator7.f();
            }
          };
          _walk(body.list, '', 0);
          if (!files.length) {
            throw new TeraboxError('EMPTY_SHARE', 'The resolver API returned no downloadable files for this share.', 'Folders may not be supported by that API.');
          }
          return {
            v: {
              mode: 'api',
              surl: surl,
              pwd: pwd,
              base: _this2.apiBase,
              pageUrl: "".concat(_this2.apiBase, "/"),
              title: '',
              meta: {
                shareid: String(body.shareid),
                uk: String(body.uk),
                sign: String(body.sign || ''),
                timestamp: String(body.timestamp || ''),
                sekey: ''
              },
              files: files,
              truncated: false,
              loggedIn: true,
              session: null
            }
          };
        },
        _ret;
      for (var _i = 0, _arr = ['/api/get-info-new', '/api/get-info']; _i < _arr.length; _i++) {
        _ret = await _loop();
        if (_ret === 0) continue;
        if (_ret) return _ret.v;
      }
      throw new TeraboxError('UPSTREAM_ERROR', "The resolver API at ".concat(this.apiBase, " could not resolve the share: ").concat(last), 'Check the "External resolver API" setting, or clear it to use your own cookie instead.');
    }
  }, {
    key: "_mintViaApi",
    value: async function _mintViaApi(share, file) {
      var payload = {
        shareid: Number(share.meta.shareid),
        uk: Number(share.meta.uk),
        sign: share.meta.sign,
        timestamp: Number(share.meta.timestamp),
        fs_id: String(file.fsId)
      };
      var last = 'Unknown error';
      for (var _i2 = 0, _arr2 = ['/api/get-downloadp', '/api/get-download']; _i2 < _arr2.length; _i2++) {
        var path = _arr2[_i2];
        var out = void 0;
        try {
          out = await this._apiPost(path, payload);
        } catch (err) {
          last = err && err.message || String(err);
          continue;
        }
        var _out2 = out,
          body = _out2.body;
        if (body && body.ok && body.downloadLink) {
          var url = String(body.downloadLink);
          return {
            url: url,
            headers: {
              'User-Agent': this.userAgent
            },
            expires: parseExpires(url),
            dlink: url
          };
        }
        last = body && body.message || "".concat(path, " answered without a link");
      }
      throw new TeraboxError('UPSTREAM_ERROR', "The resolver API could not produce a download link for ".concat(file.name, ": ").concat(last), 'Retry, or clear the API setting to use your own cookie.');
    }
  }]);
}();

;// ./src/layout.js
function layout_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = layout_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function layout_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return layout_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? layout_arrayLikeToArray(r, a) : void 0; } }
function layout_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/**
 * Decides how resolved files are laid out on disk.
 */

function dirSegments(path) {
  var parts = String(path || '').split('/').filter(Boolean);
  parts.pop(); // file name
  return parts;
}

/**
 * Decides the task folder name and each file's relative sub-path.
 * Single file → no folder. Several files → the deepest folder they all share.
 */
function layoutFiles(files, share) {
  if (files.length === 1) return {
    name: '',
    paths: ['']
  };
  var segmentLists = files.map(function (f) {
    return dirSegments(f.path);
  });
  var common = segmentLists[0].slice();
  var _iterator = layout_createForOfIteratorHelper(segmentLists.slice(1)),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var segs = _step.value;
      var i = 0;
      while (i < common.length && i < segs.length && common[i] === segs[i]) i++;
      common = common.slice(0, i);
      if (!common.length) break;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var folder = common.length ? common[common.length - 1] : share.title && !/\./.test(share.title) ? share.title : "TeraBox_".concat(share.surl);
  var paths = segmentLists.map(function (segs) {
    return segs.slice(common.length).join('/');
  });
  return {
    name: folder,
    paths: paths
  };
}
;// ./src/index.js
function _defineProperty(e, r, t) { return (r = src_toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function src_toPropertyKey(t) { var i = src_toPrimitive(t, "string"); return "symbol" == src_typeof(i) ? i : i + ""; }
function src_toPrimitive(t, e) { if ("object" != src_typeof(t) || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != src_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); }
function src_typeof(o) { "@babel/helpers - typeof"; return src_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, src_typeof(o); }
/**
 * Gopeed × TeraBox
 *
 * onResolve : share link → file list with direct CDN URLs (multi‑connection capable)
 * onStart   : re‑signs links that are about to expire before the download (re)starts
 * onError   : when a download fails (typically a 403 on an expired link) mints a new
 *             link and resumes the task automatically (max 3 times per task)
 * onDone    : housekeeping
 */

;


var LABEL = 'terabox';
var MINT_CONCURRENCY = 4;
var REFRESH_MARGIN_SEC = 15 * 60;
var MAX_ERROR_RETRIES = 3;

/* ------------------------------------------------------------------------- */
/*                               small helpers                               */
/* ------------------------------------------------------------------------- */

var str = function str(v) {
  return v === undefined || v === null ? '' : String(v).trim();
};
var num = function num(v, fallback) {
  var n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};
var bool = function bool(v, fallback) {
  if (v === undefined || v === null || v === '') return fallback;
  if (typeof v === 'boolean') return v;
  return !/^(false|0|no|off)$/i.test(String(v));
};
var nowSec = function nowSec() {
  return Math.floor(Date.now() / 1000);
};
function userMessage(err) {
  if (err instanceof TeraboxError) return err.toUserMessage();
  var msg = err && err.message || String(err);
  return "TeraBox: ".concat(msg);
}

/** Throws a user-visible error (MessageError when Gopeed provides it). */
function fail(err) {
  var message = userMessage(err);
  gopeed.logger.error(message);
  if (typeof MessageError === 'function') throw new MessageError(message);
  throw new Error(message);
}
function readSettings() {
  var s = typeof gopeed !== 'undefined' && gopeed.settings || {};
  return {
    cookie: str(s.cookie),
    password: str(s.password),
    mirror: str(s.mirror),
    apiBase: str(s.apiBase),
    maxFiles: num(s.maxFiles, 200),
    folderDepth: num(s.folderDepth, 5),
    ua: str(s.ua),
    fingerprint: bool(s.fingerprint, true)
  };
}
function normaliseMirror(value) {
  var m = String(value || '').trim().replace(/\/+$/, '');
  if (!m || m.toLowerCase() === 'auto') return '';
  return /^https?:\/\//i.test(m) ? m : "https://".concat(m);
}
function createClient(settings) {
  if (settings.fingerprint && typeof __gopeed_setFingerprint === 'function') {
    try {
      // Makes the Go HTTP client present a Chrome TLS fingerprint — TeraBox's bot filter looks at it.
      __gopeed_setFingerprint('chrome');
    } catch (e) {
      gopeed.logger.debug("fingerprint not applied: ".concat(e && e.message));
    }
  }
  return new TeraboxClient({
    cookie: settings.cookie,
    userAgent: settings.ua,
    mirror: normaliseMirror(settings.mirror),
    apiBase: settings.apiBase,
    logger: gopeed.logger
  });
}

/* --------------------------- request mutation ----------------------------- */
/* Gopeed 2.x exposes mutator methods on ctx.task.meta.req; 1.9.x expects plain assignment. */

async function setReqUrl(req, url) {
  if (typeof req.setUrl === 'function') await req.setUrl(url);else req.url = url;
}
async function setReqHeaders(req, headers) {
  if (typeof req.setHeaders === 'function') {
    await req.setHeaders(headers);
    return;
  }
  var extra = req.extra && src_typeof(req.extra) === 'object' ? req.extra : {};
  extra.header = headers;
  req.extra = extra;
}
async function putReqLabel(req, key, value) {
  if (typeof req.putLabel === 'function') {
    await req.putLabel(key, String(value));
    return;
  }
  if (!req.labels || src_typeof(req.labels) !== 'object') req.labels = {};
  req.labels[key] = String(value);
}
function labelsOf(task) {
  var req = task && task.meta && task.meta.req;
  return req && req.labels || {};
}

/* ------------------------------------------------------------------------- */
/*                                  onResolve                                */
/* ------------------------------------------------------------------------- */

gopeed.events.onResolve(async function (ctx) {
  var parsed = parseShareUrl(ctx.req.url);
  if (!parsed) {
    gopeed.logger.debug("not a TeraBox share link, ignoring: ".concat(ctx.req.url));
    return;
  }
  var settings = readSettings();
  var client = createClient(settings);
  gopeed.logger.info("resolving TeraBox share ".concat(parsed.surl, " (cookie: ").concat(settings.cookie ? 'yes' : 'no', ", api: ").concat(settings.apiBase || 'direct', ")"));
  var share;
  try {
    share = await client.resolveShare(parsed, {
      defaultPassword: settings.password,
      maxFiles: settings.maxFiles,
      maxDepth: settings.folderDepth
    });
  } catch (err) {
    fail(err);
  }
  var files = share.files;
  gopeed.logger.info("share ".concat(parsed.surl, ": ").concat(files.length, " file(s)").concat(share.truncated ? ' (truncated by maxFiles/folderDepth)' : '', " via ").concat(share.base));

  // Sign every file. Try the first alone: if TeraBox wants a login we stop immediately with a clear message
  // instead of firing N doomed requests.
  var links = new Array(files.length);
  try {
    links[0] = await client.mintLink(share, files[0]);
  } catch (err) {
    if (err instanceof TeraboxError && err.code === 'LOGIN_REQUIRED') {
      var preview = files.slice(0, 3).map(function (f) {
        return f.name;
      }).join(', ');
      fail(new TeraboxError(err.code, "Found ".concat(files.length, " file(s) (").concat(preview).concat(files.length > 3 ? ', …' : '', ") but ").concat(err.message), err.hint, err.errno));
    }
    fail(err);
  }
  if (files.length > 1) {
    var failures = [];
    await mapLimit(files.slice(1), MINT_CONCURRENCY, async function (file, i) {
      try {
        links[i + 1] = await client.mintLink(share, file);
      } catch (err) {
        failures.push("".concat(file.name, ": ").concat(userMessage(err)));
        links[i + 1] = null;
      }
    });
    if (failures.length) gopeed.logger.warn("".concat(failures.length, " file(s) could not be signed and were skipped:\n").concat(failures.join('\n')));
  }
  var ready = files.map(function (file, i) {
    return {
      file: file,
      link: links[i]
    };
  }).filter(function (x) {
    return x.link;
  });
  if (!ready.length) fail(new TeraboxError('UPSTREAM_ERROR', 'TeraBox did not sign any of the files in this share.', 'Retry in a moment.'));
  var layout = layoutFiles(ready.map(function (x) {
    return x.file;
  }), share);
  ctx.res = {
    name: layout.name,
    files: ready.map(function (_ref, i) {
      var file = _ref.file,
        link = _ref.link;
      var labels = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, LABEL, '1'), "terabox_surl", share.surl), "terabox_fsid", file.fsId), "terabox_name", file.name), "terabox_origin", share.mode === 'api' ? '' : share.base), "terabox_expires", String(link.expires));
      if (share.pwd) labels.terabox_pwd = share.pwd;
      return {
        name: file.name,
        path: layout.paths[i],
        size: file.size,
        req: {
          url: link.url,
          extra: {
            header: link.headers
          },
          labels: labels
        }
      };
    })
  };
  gopeed.logger.info("resolved ".concat(ready.length, " file(s) for ").concat(parsed.surl, "; links expire around ").concat(new Date(ready[0].link.expires * 1000).toISOString()));
});

/* ------------------------------------------------------------------------- */
/*                         link refresh (onStart/onError)                    */
/* ------------------------------------------------------------------------- */

async function refreshTaskLink(task, reason) {
  var labels = labelsOf(task);
  var req = task.meta.req;
  var settings = readSettings();
  var client = createClient(settings);
  var origin = labels.terabox_origin || (splitUrl(req.url) || {}).origin || '';
  gopeed.logger.info("".concat(reason, ": refreshing TeraBox link for ").concat(labels.terabox_name || labels.terabox_fsid, " (").concat(labels.terabox_surl, ")"));
  var link = await client.refreshLink({
    surl: labels.terabox_surl,
    pwd: labels.terabox_pwd || settings.password || '',
    fsId: labels.terabox_fsid,
    origin: origin,
    name: labels.terabox_name || ''
  });
  await setReqUrl(req, link.url);
  await setReqHeaders(req, link.headers);
  await putReqLabel(req, 'terabox_expires', String(link.expires));
  gopeed.logger.info("new link for ".concat(labels.terabox_name || labels.terabox_fsid, " expires around ").concat(new Date(link.expires * 1000).toISOString()));
  return link;
}
gopeed.events.onStart(async function (ctx) {
  var task = ctx.task;
  var labels = labelsOf(task);
  if (!labels[LABEL] || !labels.terabox_surl || !labels.terabox_fsid) return;
  var expires = Number(labels.terabox_expires || 0);
  if (expires && nowSec() < expires - REFRESH_MARGIN_SEC) {
    gopeed.logger.debug("link for ".concat(labels.terabox_name, " still valid (").concat(Math.round((expires - nowSec()) / 60), " min left)"));
    return;
  }
  try {
    await refreshTaskLink(task, 'onStart');
  } catch (err) {
    // Not fatal: Gopeed will try the old link, and onError gets another chance.
    gopeed.logger.warn("could not refresh link before start: ".concat(userMessage(err)));
  }
});
gopeed.events.onError(async function (ctx) {
  var task = ctx.task;
  var labels = labelsOf(task);
  if (!labels[LABEL] || !labels.terabox_surl || !labels.terabox_fsid) return;
  var key = "retry:".concat(task.id);
  var attempts = Number(gopeed.storage.get(key) || 0);
  var errorText = ctx.error && ctx.error.message ? ctx.error.message : String(ctx.error || 'unknown error');
  if (attempts >= MAX_ERROR_RETRIES) {
    gopeed.logger.warn("giving up on ".concat(labels.terabox_name, " after ").concat(attempts, " automatic retries (last error: ").concat(errorText, ")"));
    return;
  }
  gopeed.storage.set(key, String(attempts + 1));
  gopeed.logger.warn("download of ".concat(labels.terabox_name, " failed (").concat(errorText, "); attempt ").concat(attempts + 1, "/").concat(MAX_ERROR_RETRIES, " to re-sign the link"));
  try {
    await refreshTaskLink(task, 'onError');
  } catch (err) {
    gopeed.logger.error("re-signing failed: ".concat(userMessage(err)));
    return;
  }
  try {
    await task["continue"]();
  } catch (err) {
    gopeed.logger.error("could not resume task ".concat(task.id, ": ").concat(err && err.message || err));
  }
});
if (typeof gopeed.events.onDone === 'function') {
  gopeed.events.onDone(async function (ctx) {
    var task = ctx.task;
    var labels = labelsOf(task);
    if (!labels[LABEL]) return;
    try {
      gopeed.storage.remove("retry:".concat(task.id));
    } catch (e) {
      /* ignore */
    }
  });
}
/******/ })()
;