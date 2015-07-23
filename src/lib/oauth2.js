
"use strict";

var crypto = require('crypto'),
  google = require('googleapis'),
  express = require('express'),
  auth, middleware;

auth = {
  // Generates a state token, used to prevent request forgery.
  getToken: function () {
    return crypto.randomBytes(16).toString('hex');
  },

  // Generates an OAuth2 client based on passed config.
  getClient: function (config) {
    return new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUrl
    );
  },

  // Retrieves a user's basic profile info with passed client.
  getProfile: function (client, cb) {
    google.plus('v1').people.get({
      userId: 'me',
      auth: client
    }, cb);
  },
};

module.exports = function (config) {

  var router = express.Router();

  var middleware = {
    authorize: function (req, res, next) {
      if (req.session.oauth2tokens) {
        req.oauth2client = auth.getClient(config);
        req.oauth2client.setCredentials(req.session.oauth2tokens);
      }

      next();

      if (req.oauth2client)
        req.session.oauth2tokens = req.oauth2client.credentials;
    },

    required: function (req, res, next) {
      middleware.authorize(req, res, function () {
        if (!req.oauth2client) {
          req.session.oauth2return = req.originalUrl;
          return res.redirect(config.authUrl);
        }
        next();
      });
    },
  
    template: function (req, res, next) {
      res.locals.profile = req.session.profile;
      res.locals.login = config.authUrl + '?return=' + encodeURIComponent(req.originalUrl);
      res.locals.logout = config.logoutUrl + '?return=' + encodeURIComponent(req.originalUrl);
      next();
    }
  };

  // Begins the auth flow.
  router.get(config.authUrl, function (req, res) {
    var token = auth.getToken(),
      authUrl = auth.getClient(config).generateAuthUrl({
        access_type: 'offline',
        scope: config.scopes || ['email', 'profile'],
        state: token
      });

    req.session.oauth2statetoken = token;
    
    if (req.query.return)
      req.session.oauth2return = req.query.return;

    res.redirect(authUrl);
  });

  // Finishes the auth flow & stores user credentials & profile in session.
  router.get('/oauth2callback', function (req, res) {
    if (!req.query.code || req.query.state != req.session.oauth2statetoken)
      return res.status(400).send('Invalid auth code or state token.');

    auth.getClient(config).getToken(req.query.code, function (err, tokens) {
      var client;

      if (err)
        return res.status(400).send(err.message);

      req.session.oauth2tokens = tokens;

      client = auth.getClient(config);
      client.setCredentials(tokens);

      auth.getProfile(client, function (err, profile) {
        if (err)
          return res.status(500).send(err.message);

        req.session.profile = {
          id: profile.id,
          displayName: profile.displayName,
          name: profile.name,
          image: profile.image
        };

        res.redirect(req.session.oauth2return || '/');
      });
    });
  });

  // Deletes user credentials & profile from the session.
  router.get(config.logoutUrl, function (req, res) {
    delete req.session.oauth2tokens;
    delete req.session.profile;
    res.redirect(req.query.return || req.session.oauth2return || '/');
  });

  // Shows the current user's profile info.
  router.get('/oauth2/user_info', middleware.required, function (req, res) {
    auth.getProfile(req.oauth2client, function (err, profile) {
      if (err)
        return res.status(500).send(err.message);

      res.json(profile);
    });
  });

  // Shows info about the user's id_token.
  router.get('/oauth2/token_info', middleware.required, function (req, res) {
    auth.getClient(config).verifyIdToken(req.session.oauth2tokens.id_token, null, function (err, login) {
      if (err)
        return res.status(500).send(err.message);

      res.json(login.getPayload());
    })
  });

  middleware.router = router;
  return middleware;
};
