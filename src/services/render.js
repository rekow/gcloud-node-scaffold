/**
 * @file Template service.
 * @author <a href="http://davidrekow.com">David Rekow</a>.
 * @copyright 2015
 */

var path = require('path'),
  fs = require('./fs'),
  t = require('../lib/shared/t'),
  RenderStream = require('../streams/RenderStream');

var TEMPLATE_ROOT = path.resolve(__dirname, '../views');

var getTemplatePath = function (name) {
  if (name.indexOf('.') > -1)
    return name;

  return path.join(TEMPLATE_ROOT, name + '.t');
};

var cache = {};

t.config({
  load: function (name, cb) {
    var result, count;

    if (Array.isArray(name)) {
      result = {};
      count = name.length;

      name.forEach(function (name) {
        if (!cache[name])
          t.put(name, fs.readSync(getTemplatePath(name)));

        result[name] = cache[name];
        return --count || (cb && cb(result));
      });
    } else {
      if (!cache[name])
        t.put(name, fs.readSync(getTemplatePath(name)));

      result = cache[name];

      return cb ? cb(result) : result;
    }
  },

  put: function (name, tpl, cb) {
    cache[name] = (tpl instanceof t ? tpl : new t(tpl));
  }
});

module.exports = function (name, locals, cb) {
  var render = new RenderStream(locals)
    .on('error', cb)
    .on('finish', function () {
      cb(null, this.html);
    });

  t.load(name, function (template) {
    render.end(template);
  });
};
