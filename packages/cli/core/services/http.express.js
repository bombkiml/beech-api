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
          return;
        }
      } else {
        return;
      }
      // declare authentication endpoint name
      const auth_endpoint = (passport_config.auth_endpoint) ? (passport_config.auth_endpoint[0] === "/" ? passport_config.auth_endpoint : "/" + passport_config.auth_endpoint) : "/authentication";
      // authentication endpoints
      _app_.post(auth_endpoint, (req, res, next) => {
        passport.authenticate('local', { session: false }, (err, user, opt) => {
          if (err) { res.json(502).json({ code: 502, message: 'Bad Gateway.' }) }
          if (user) {
            const token = jwt.sign(user, passport_config.secret, {
              expiresIn: passport_config.token_expired
            });
            if (passport_config.app_secret_allow) {
              if (req.body.app_secret) {
                if (_config_.main_config.app_secret == req.body.app_secret) {
                  res.status(200).json({ user, token });
                } else {
                  res.status(401).json({ code: 401, message: "Unauthorized." });
                }
              } else {
                res.status(422).json({ code: 422, message: "Unprocessable Entity." });
              }
            } else {
              res.status(200).json({ user, token });
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
        Beech.store(req.body, e => res.status(e.code).json(e));
      });
      // patch users endpoints
      _app_.patch(auth_endpoint + '/users/:id', auth.credentials, (req, res) => {
        // require some fields with body params
        Beech.update(req.body, req.params.id, e => res.status(e.code).json(e));
      });
    } catch (error) {
      throw error;
    }
  }
}