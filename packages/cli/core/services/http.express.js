const appRoot = require("app-root-path");
const package = require(appRoot + '/package.json');
const fs = require("fs");
const passport_config_file = "/passport.config.js";
const auth = require("../auth/Credentials");

module.exports = {
  expressStart() {
    return new Promise((resolve, reject) => {
      try {
        // Create express server
        const ExpressServer = _app_.listen(_config_.main_config.app_port, async () => {
          await console.log('\n[102m[90m Passed [0m[0m Service is started at:\n - Local:   [36mhttp://' + _config_.main_config.app_host + ':' + ExpressServer.address().port, '[0m\n - Network: [36m' + _config_.main_config.client_host + '[0m');
          await this.authentication();
          await this.badRequest()
            .then(resolve(ExpressServer))
            .catch(err => {
              reject(err);
            });
        });
      } catch (error) {
        reject(error);
      }
    });
  },
  // Bad request
  badRequest() {
    return new Promise((resolve, reject) => {
      try {
        // base get request
        _app_.get('/', (req, res) => {
          res.status(200).json({
            code: 200,
            status: "SUCCESS",
            message: `Welcome to ${package.name} (version ${package.version})`
          });
          resolve(200);
        });
        // request 404 not found
        _app_.use((req, res, next) => {
          res.status(404).json({
            code: 404,
            status: "error",
            error: "404_NOT_FOUND"
          });
          resolve(404);
          next();
        });
      } catch (error) {
        reject(error);
      }
    });
  },
  // Authentication request
  authentication() {
    try {
      // require jwt & passport
      if (fs.existsSync(appRoot + passport_config_file)) {
        var passport_config = require(appRoot + passport_config_file);
        var jwt = require('jsonwebtoken');
        var passport = require('passport');
        var Beech = require("../../../lib/beech");
        if (!passport_config.jwt_allow) {
          // jwt is false
          console.log(" - JWT:     [90mOFF[0m");
          return;
        }
        // jwt is true
        console.log(" - JWT:     [93mON[0m");
      } else {
        return;
      }
      // declare authentication endpoint name
      const auth_endpoint = (passport_config.auth_endpoint) ? (passport_config.auth_endpoint[0] === "/" ? passport_config.auth_endpoint : "/" + passport_config.auth_endpoint) : "/authentication";
      // authentication endpoints
      _app_.post(auth_endpoint, (req, res, next) => {
        passport.authenticate('local', { session: false }, (err, user, opt) => {
          if (err) {
            res.status(502).json({
              code: 502,
              error: 'BAD_GATEWAY',
              message: err
            });
          }
          if (user) {
            const accessToken = jwt.sign(user, passport_config.secret, {
              expiresIn: passport_config.token_expired
            });
            if (passport_config.app_secret_allow) {              
              if (req.body.app_secret) {
                if (_config_.main_config.app_secret == req.body.app_secret) {
                  res.status(200).json({
                    code: 200,
                    status: "AUTHORIZED",
                    message: "success.",
                    user,
                    accessToken
                  });
                } else {
                  res.status(401).json({ code: 401, message: "Unauthorized." });
                }
              } else {
                res.status(422).json({ code: 422, message: "Unprocessable Entity." });
              }
            } else {
              res.status(200).json({
                code: 200,
                status: "AUTHORIZED",
                message: "success.",
                user,
                accessToken
              });
            }
          } else if (opt) {
            res.status(422).json({ code: 422, message: "Unprocessable Entity." });
          } else {
            res.status(401).json({ code: 401, message: "Unauthorized." });
          }
        })(req, res, next);
      });
      // create users endpoints
      _app_.post(auth_endpoint + '/users', (req, res) => {
        Beech.store(req.body, (err, result) => {
          if (err) {
            res.status(500).json({ code: 500, status: "CREATE_FAILED", error: err });
          } else {
            res.status(201).json({ code: 201, status: "CREATE_SUCCESS", result });
          }
        });
      });
      // patch users endpoints
      _app_.patch(auth_endpoint + '/users/:id', auth.credentials, (req, res) => {
        // require some fields with body params
        Beech.update(req.body, req.params.id, (err, result) => {
          if (err) {
            res.status(500).json({ code: 500, status: "UPDATE_FAILED", error: err });
          } else {
            res.status(200).json({ code: 200, status: "UPDATE_SUCCESS", result });
          }
        });
      });
      /**
       * Google Strategy
       *  
       */
      if (passport_config.strategy.google.allow) {
        _app_.get(auth_endpoint + '/google', passport.authenticate('google', {
          scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/plus.login'
          ]
        }));
        // google auth callback
        const googleCallback = (passport_config.strategy.google.callbackURL) ? (passport_config.strategy.google.callbackURL[0] === "/" ? passport_config.strategy.google.callbackURL : "/" + passport_config.strategy.google.callbackURL) : "/google/callback";
        _app_.get(auth_endpoint + googleCallback, passport.authenticate('google', { failureRedirect: passport_config.strategy.google.failureRedirect, failureMessage: true }), (req, res) => {
          if (typeof req.user.user !== 'undefined') {
            // declare user for sign JWT
            let user = JSON.parse(JSON.stringify(req.user.user));
            const accessToken = jwt.sign(user, passport_config.secret, {
              expiresIn: passport_config.token_expired
            });
            // response JWT
            res.status(200).json({
              code: 200,
              status: "AUTHORIZED",
              message: "success.",
              user: req.user,
              accessToken
            });
          } else {
            let condUser = {};
            condUser[(passport_config.strategy.google.local_profile_fields.google_id) ? passport_config.strategy.google.local_profile_fields.google_id : "google_id"] = req.user.google.id;
            Beech.findOne(passport_config.model.table || "users", condUser, (err, result) => {
              if (err) {
                res.status(500).json({
                  code: 500,
                  status: "INTERNAL_SERVER_ERR",
                  message: "Internal server error.",
                  error: err
                });
              } else {
                let user = JSON.parse(JSON.stringify(result[0]));
                const accessToken = jwt.sign(user, passport_config.secret, {
                  expiresIn: passport_config.token_expired
                });
                // response JWT
                res.status(201).json({
                  code: 201,
                  status: "AUTHORIZED",
                  message: "success.",
                  user: {
                    google: req.user.google,
                    user
                  },
                  accessToken
                });
              }
            });
          }
        });
      }
      /**
       * Facebook strategy
       * 
       */
      if (passport_config.strategy.facebook.allow) {
        _app_.get(auth_endpoint + '/facebook', passport.authenticate('facebook', { scope: ['email', 'pages_show_list'] }));
        // facebook callback
        const facebookCallback = (passport_config.strategy.facebook.callbackURL) ? (passport_config.strategy.facebook.callbackURL[0] === "/" ? passport_config.strategy.facebook.callbackURL : "/" + passport_config.strategy.facebook.callbackURL) : "/facebook/callback";
        _app_.get(auth_endpoint + facebookCallback, passport.authenticate('facebook', { failureRedirect: passport_config.strategy.facebook.failureRedirect, failureMessage: true }), (req, res) => {
          if (typeof req.user.user !== 'undefined') {
            // declare user for sign JWT
            let user = JSON.parse(JSON.stringify(req.user.user));
            const accessToken = jwt.sign(user, passport_config.secret, {
              expiresIn: passport_config.token_expired
            });
            // response JWT
            res.status(200).json({
              code: 200,
              status: "AUTHORIZED",
              message: "success.",
              user: req.user,
              accessToken
            });
          } else {
            let condUser = {};
            condUser[(passport_config.strategy.facebook.local_profile_fields.facebook_id) ? passport_config.strategy.facebook.local_profile_fields.facebook_id : "facebook_id"] = req.user.facebook.id;
            Beech.findOne(passport_config.model.table || "users", condUser, (err, result) => {
              if (err) {
                res.status(500).json({
                  code: 500,
                  status: "INTERNAL_SERVER_ERR",
                  message: "Internal server error.",
                  error: err
                });
              } else {
                let user = JSON.parse(JSON.stringify(result[0]));
                const accessToken = jwt.sign(user, passport_config.secret, {
                  expiresIn: passport_config.token_expired
                });
                // response JWT
                res.status(201).json({
                  code: 201,
                  status: "AUTHORIZED",
                  message: "success.",
                  user: {
                    facebook: req.user.facebook,
                    user
                  },
                  accessToken
                });
              }
            });
          }
        });
      }
    } catch (error) {
      throw error;
    }
  }
}