/**
 *
 *    _|          _|        _|
 *  _|_|_|_|      _|              _|_|_|
 *    _|      _|_|_|_|_|    _|  _|_|
 *    _|          _|        _|      _|_|
 *      _|_|      _|    _|  _|  _|_|_|
 *                          _|
 *                        _|
 *
 * @fileoverview t+.js - a micro templating library with macros & inheritance, inspired by
 *    t.js (https://github.com/jasonmoo/t.js)
 * @author David Rekow
 * @license MIT
 * @version 1.0.0
 * @copyright David Rekow 2012-2015
 */

(function() {
  var RE, get_value, trim, scrub, templates, macros, MACRO, load, macro, include, extend, render, do_render, t;

  // Matchers.
  RE = {
    block: /\{\{\s*?([@!>#]?)(.+?)\s*?\}\}(([\s\S]*?)(\{\{\s*?:\2\s*?\}\}([\s\S]*?))?)\{\{\s*?\/\1?\2\s*?\}\}/g,
    include: /\{\{\s*?\+\s*?([^\s]+?)\s*?\}\}/g,
    extend: /^\s*?\{\{\s*?\^([\w\W]+?)\s*?\}\}/,
    macro: /\{\{\s*?(\s*?([^\(]+))\(([^\)]*?)\)\s*?\}\}(?:([\s\S.]+)\{\{\s*?\/\s*?(?:\1|\2)\}\})?/g,
    section: /\{\{\s*?(#(.+?))\s*?\}\}([\s\S]*?)\{\{\s*?\/\1?\2\s*?\}\}/g,
    val: /\{\{\s*?([=%])\s*?(.+?)\s*?\}\}/g,
    quoted: /^('|")(?:.*?)\1$/,
    triml: /^\s+/,
    trimr: /\s+$/,
  };

  // Value resolver.
  get_value = function (vars, key) {
    var parts = key.split('.');
    while (parts.length) {
      if (!(parts[0] in vars)) return '';
      vars = vars[parts.shift()];
    }
    return vars;
  };

  // Trims a string or array of strings.
  trim = function(str) {
    if (str.charAt) return str.replace(RE.triml, '').replace(RE.trimr, '');
    if (str.length) {
      var i, len = str.length;
      for (i = 0; i < len; i++) {
        str[i] = trim(str[i]);
      }
    }
    return str;
  };

  // Scrubs html output to insert safely.
  scrub = function (val) {
    var cleaner;
    if (Option) {
      cleaner = new Option(val).innerHTML;
    } else {
      cleaner = val.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    return cleaner.replace(/'/g, '&apos;').replace(/"/g, '&quot;')
  };

  templates = {};

  // Registers or loads a template.
  load = function(name, tpl, cb) {
    var _name, results;
    if (!name) return templates;
    if (Array.isArray(name)) {
      results = {};
      for (var i = 0; i < name.length; i ++) {
        _name = name[i];
        load(_name, function(_tpl) {
          results[_name] = _tpl;
        });
      }
      return cb && cb(results);
    }
    if (typeof name === 'object') {
      for (_name in name) {
        if (name.hasOwnProperty(_name)) load(_name, name[_name]);
      }
      return cb && cb();
    }
    if (!cb) {
      if (typeof tpl === 'function') {
        cb = tpl;
        tpl = null;
      } else if (tpl) {
        tpl = tpl.t ? tpl : new t(tpl);
        tpl.name = name;
        return (templates[name] = tpl);
      } else {
        return templates[name];
      }
    }
    return cb(templates[name]);
  };

  macros = {};
  MACRO = {
    load: load,
    scrub: scrub,
    resolve: get_value
  };

  // Registers or retrieves a macro.
  macro = function(name, fn) {
    if (!name) return macros;
    if (typeof name === 'object') {
      for (var _name in name) {
        macro(_name, name[_name]);
      }
      return;
    }
    if (fn && typeof fn === 'function') {
      macros[name] = function(ctx, args) {
        var html;
        MACRO.scope = ctx;
        html = fn.apply(MACRO, args);
        MACRO.scope = null;
        return html;
      };
    }
    return macros[name];
  };

  // Processes template includes.
  include = function(tpl, ctx, cb) {
    var incl, hasIncl, match, name;
    if (!tpl) return false;
    if (!ctx) ctx = {};
    if (!cb && typeof ctx === 'function') {
      cb = ctx;
      ctx = {};
    }
    incl = [];
    while (hasIncl = RE.include.exec(tpl.t)) {
      incl.push(hasIncl[1]);
    }
    if (incl.length) {
      return t.load(incl, function(includes) {
        var src = tpl.t;
        tpl.t = src.replace(RE.include, function(_, _name) {
          var _incl;
          if (!(_incl = includes[_name])) return _;
          if (!RE.extend.test(_incl.t)) return _incl.t;
          return cb && cb(false, new Error('[t+]: Invalid include: '+_name+'. Includes can\'t extend other templates.'))
        });
        return include(tpl, ctx, cb);
      });
    } else {
      tpl.parsed = tpl.t.replace(RE.section, function (_, __, name, content) {
        return content;
      });
      return do_render(tpl, ctx, false, cb);
    }
  };

  // Processes template extensions & named sections.
  extend = function(tpl, sections, cb) {
    var hasParent = RE.extend.exec(tpl.t),
      extended = tpl.t.replace(RE.section, function (_, __, name, content) {
        if (!sections[name]) sections[name] = content;
        return hasParent ? _ : (name in sections ? sections[name] : content);
      });
    if (hasParent) {
      return t.load(hasParent[1], function(parent) {
        tpl.t = parent.t;
        return extend(tpl, sections, cb);
      });
    }
    tpl.t = extended;
    if (RE.section.test(tpl.t)) return extend(tpl, sections, cb);
    return cb && cb(tpl);
  };

  // Renders the template source blocks & values.
  render = function (src, ctx) {
    if (!src) return '';
    return src.replace(RE.block, function (_, meta, key, inner, if_true, has_else, if_false) {
      var val = get_value(ctx, key), tmp;
      if (!val) {
        return meta === '!' ? render(inner, ctx) : (has_else ? render(if_false, ctx) : '');
      }
      if (!meta) {
        return has_else ? render(if_true, ctx) : render(inner, ctx);
      }
      tmp = '';
      if (meta === '@') {
        for (var k in val) {
          if (val.hasOwnProperty(k))
            tmp += render(inner, {
              _key: k,
              _val: val[k]
            });
        }
      } else if (meta === '>') {
        if (Array.isArray(val)) {
          for (var i = 0; i < val.length; i++) {
            tmp += render(inner, val[i]);
          }
        } else {
          tmp += render(inner, val);
        }
      }
      return tmp;
    }).replace(RE.val, function (_, meta, key) {
      var val = get_value(ctx, key);
      return (val || val === 0) ? (meta === '%' ? scrub(val) : val) : '';
    });
  };

  // Manages render process & executing macros.
  do_render = function(tpl, ctx, usecache, cb) {
    var hasParent, html, name;
    if (!cb && typeof usecache !== 'boolean') {
      cb = usecache;
      usecache = false;
    }
    if (!tpl.src || usecache) tpl.src = tpl.t;
    if (usecache || !tpl.parsed) {
      tpl.parsed = null;
      if (!RE.extend.test(tpl.t)) return include(tpl, ctx, cb);
      return extend(tpl, {}, function(_tpl) {
        return include(_tpl, ctx, cb);
      });
    }
    tpl.t = tpl.parsed;
    html = render(tpl.t, ctx).replace(RE.macro, function(_, __, _name, params, def) {
      var m = t.macro(_name),
        args = [],
        param;
      params = trim(params.split(','));
      if (m) {
        for (var i = 0; i < params.length; i++) {
          param = params[i];
          args.push(RE.quoted.test(param) ? param.slice(1, -1) : get_value(ctx, param));
        }
        try {
          return m(ctx, args);
        } catch (e) {
          console.log('[t+] Macro error: ', _name, e);
        }
      }
      return def || '';
    });
    tpl.t = tpl.src;
    return cb ? cb(html) : html;
  }

  // Template constructor.
  t = function (source) {
    this.t = source;
  };

  // Asynchronously load a template and pass to callback `cb`.
  t.load = function(name, cb) {
    return load(name, null, cb);
  };

  // Asynchronously save a template, optionally passing result to `cb`.
  t.put = function(name, tpl, cb) {
    return load(name, tpl, cb);
  };

  // Retrieve or set a macro by name.
  t.macro = function(name, fn) {
    return macro(name, fn);
  };

  // Configure custom template loader.
  t.config = function(load, put) {
    if (!put) {
      put = load.put;
      load = load.load;
    }
    if (typeof put !== 'function' || typeof load !== 'function') return false;
    t.load = MACRO.load = load;
    t.put = put;
    return t;
  };

  // Renders a template. If no callback is passed, does so immediately and returns
  // the HTML; if a callback is provided it will receive HTML after render is done
  // async.
  t.prototype.render = function(ctx, cb, usecache) {
    usecache = usecache || false;
    if (!cb) return do_render(this, ctx, usecache);
    setTimeout(do_render.bind(null, this, ctx, usecache, cb), 0);
  };

  if (typeof window === 'object') {
    window.t = t;
  } else if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = t;
  }
})();
