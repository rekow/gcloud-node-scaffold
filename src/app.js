/**
 * @file Main application initializer.
 * @author <a href="http://davidrekow.com">David Rekow</a>.
 * @copyright 2015
 */

"use strict";

var fs = require('fs'),
  path = require('path'),
  express = require('express'),
  logger = require('morgan'),
  session = require('cookie-session'),
  compression = require('compression'),
  gcloud = require('gcloud'),
  config = require('./config'),
  render = require('./services/render');

var app = express();

app.set('trust proxy', true);

app.use(logger('dev'));
app.use(compression());

// Setup static asset serving
app.use(express.static(path.join(__dirname, 'assets')));
app.use('/js/lib', express.static(path.join(__dirname, 'lib/shared')));

// Configure cookie-based sessions
// To use, set the session secret in `sensitive.js`, then uncomment here.
//
// app.use(session({
//   secret: config.secret,
//   signed: true
// }));

// Set up default app engine checks
app.use(require('./lib/appengine'));

// Set up OAuth2
// To use, set the client ID and secret in `sensitive.js`, then uncomment here.
// 
// var oauth2 = require('./lib/oauth2')(config.oauth2);
// app.use(oauth2.router);
// app.use(oauth2.authorize);
// app.use(oauth2.template);

// Expose top-level site nav in templates
app.use(function (req, res, next) {
  res.locals.nav = config.nav;
  next();
});

// Set up view rendering
app.engine('t', render);
app.set('views', './views');
app.set('view engine', 't');

app.get('/', function (req, res) {
  res.render('index', { header: true });
});

// Set up 404 redirects
app.use(function (req, res, next) {
  res.status(404).format({
    html: function () {
      res.render('static/404', { url: req.url });
    },

    json: function () {
      res.json({ error: req.url + ' not found.' })
    },

    text: function () {
      res.send(req.url + ' not found.');
    }
  });
});

// Set up generic error handling
app.use(function (err, req, res, next) {
  res.status(500).send('An error occurred: ' + err.message);
  console.error(err.stack);
});

// Start serving
var server = app.listen(config.port, '0.0.0.0', function () {
  console.log('App serving at http://%s:%s', server.address().address, server.address().port);
});
