/**
 * @file Stream to manage template rendering.
 * @author <a href="http://davidrekow.com">David Rekow</a>.
 * @copyright 2015
 *
 * @TODO handle multi-template renders.
 */

var streams = require('./');

module.exports = streams.transform({
  construct: function (context) {
    this.context = context || {};
    this.template = null;
    this.html = null;
  },

  transform: function (template, enc, cb) {
    var rs = this;

    this.template = template;

    template.render(this.context, function (html) {
      rs.html = html;
      cb();
    });
  },

  flush: function (cb) {
    this.push(this.html);
    cb();
  }
});
