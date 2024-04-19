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
          await console.log('[102m[90m Passed [0m[0m Service is started at:');
          await console.log('- [91mLocal[0m:   [36mhttp://' + _config_.main_config.app_host + ':' + ExpressServer.address().port + '[0m');
          await console.log('- [91mNetwork[0m: [36m' + _config_.main_config.client_host + '[0m');
          await new Promise((resolve) => resolve(this.authentication()));
          await new Promise((resolve) => resolve(this.addOn()));
          await new Promise((resolve) => resolve(this.badRequest()));
          await resolve(ExpressServer);
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
        });
        // request 404 not found
        _app_.use((req, res, next) => {
          res.status(404).json({
            code: 404,
            status: "404_NOT_FOUND",
            message: "The Endpoint not found!.",
          });
          next();
        });
        // resolve it.
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  },
  addOn() {
    return new Promise((resolve, reject) => {
      try {
        // check add-on file exists ?
        if (_config_.addOn) {
          if (fs.existsSync(appRoot + "/src/Add-on.js")) {
            console.log("- [91mAdd-On[0m:  [93mON[0m");
            let add_on = require(appRoot + "/src/Add-on.js");
            if(add_on.init()) {
              resolve(true);
            }
          } else {
            console.log("- [91mAdd-On[0m:  [90mOFF[0m");
            resolve(true);
          }
        } else {
          console.log("- [91mAdd-On[0m:  [90mOFF[0m");
          resolve(true);
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  // Authentication request
  authentication() {
    return new Promise((resolve, reject) => {
      try {
        var passport_config = null;
        var jwt = null;
        var passport = null;
        var User = null;
        var passport_config_file_exists = true;
        var jwt_allow = false;
        var jwt_db_allow = null;
        // First promise
        const checkPassport = new Promise((resolve, reject) => {
          // require jwt & passport
          if (fs.existsSync(appRoot + passport_config_file)) {
            try {
              // assign prepare data
              passport_config = require(appRoot + passport_config_file);
              global._passport_config_ = passport_config;
              jwt = require('jsonwebtoken');
              passport = require('passport');
              User = require("../../../lib/src/user");
              if (!passport_config.jwt_allow) {
                // jwt is false
                console.log("- [91mJWT[0m:     [90mOFF[0m");
                resolve(true);
              } else {
                /// jwt is true
                jwt_allow = true;
                console.log("- [91mJWT[0m:     [93mON[0m");
                // loop check db connect is true
                fs.readFile("./app.config.js", "utf-8", (err, data) => {
                  if(err) {
                    throw err;
                  } else {
                    let mineConfDb = eval(data).database_config;
                    mineConfDb.filter((e) => {
                      if(e.name == passport_config.model.name) {
                        jwt_db_allow = e.is_connect;
                        resolve(jwt_db_allow);
                      }
                    });
                  }
                });
              }
            } catch (error) {
              reject(error);
            }
          } else {
            passport_config_file_exists = false;
            resolve(true);
          }
        });

        // Second promise
        const signJWT = new Promise((resolve, reject) => {
          try {
            checkPassport.then(passportChecked => {
              if(passportChecked) {
                if (passport_config_file_exists && jwt_allow && jwt_db_allow) {
                  // declare authentication endpoint name
                  const auth_endpoint = (passport_config.auth_endpoint) ? (passport_config.auth_endpoint[ 0 ] === "/" ? passport_config.auth_endpoint : "/" + passport_config.auth_endpoint) : "/authentication";
                  // authentication endpoints
                  _app_.post(auth_endpoint, (req, res, next) => {
                    passport.authenticate('local', { session: false }, (err, user, opt) => {
                      if (err) {
                        res.status(502).json({
                          code: 502,
                          status: 'BAD_GATEWAY',
                          message: err
                        });
                      }
                      if (user) {
                        const accessToken = jwt.sign(user, passport_config.secret, {
                          expiresIn: passport_config.token_expired
                        });
                        if (passport_config.app_key_allow) {
                          if (req.headers.app_key) {
                            if (_config_.main_config.app_key == req.headers.app_key) {
                              res.status(200).json({
                                code: 200,
                                status: "AUTHORIZED",
                                user,
                                accessToken
                              });
                            } else {
                              res.status(401).json({ code: 401, message: "Unauthorized with wrong key." });
                            }
                          } else {
                            res.status(422).json({ code: 422, message: "Unprocessable Entity." });
                          }
                        } else {
                          res.status(200).json({
                            code: 200,
                            status: "AUTHORIZED",
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
                  // create auth data endpoints
                  _app_.post(auth_endpoint + '/create', (req, res) => {
                    const promise = new Promise((resolve) => {
                      if (passport_config.app_key_allow) {
                        if (req.headers.app_key) {
                          if (_config_.main_config.app_key == req.headers.app_key) {
                            resolve(true);
                          } else {
                            res.status(401).json({ code: 401, message: "Unauthorized with wrong key." });
                          }
                        } else {
                          res.status(422).json({ code: 422, message: "Unprocessable Entity." });
                        }
                      } else {
                        resolve(true);
                      }
                    });
                    // store data
                    Promise.all([promise])
                      .then((secret) => {
                        if(secret) {
                          User.Store(req.body, (err, result) => {
                            if (err) {
                              res.status(501).json({ code: 501, status: "CREATE_FAILED", error: err });
                            } else {
                              res.status(201).json({ code: 201, status: "CREATE_SUCCESS", result });
                            }
                          });
                        } else {
                          res.status(501).json({ code: 501, status: "NOT_IMPLIMENTED" });
                        }
                      })
                      .catch(err => {
                        res.status(501).json({ code: 501, status: "NOT_IMPLIMENTED", error: err
                      });
                    });
                  });
                  // patch auth data endpoints
                  _app_.patch(auth_endpoint + '/update/:id', auth.credentials, (req, res) => {
                    const promise = new Promise((resolve) => {
                      if (passport_config.app_key_allow) {
                        if (req.headers.app_key) {
                          if (_config_.main_config.app_key == req.headers.app_key) {
                            resolve(true);
                          } else {
                            res.status(401).json({ code: 401, message: "Unauthorized with wrong key." });
                          }
                        } else {
                          res.status(422).json({ code: 422, message: "Unprocessable Entity." });
                        }
                      } else {
                        resolve(true);
                      }
                    });
                    // update data
                    Promise.all([promise])
                      .then((secret) => {
                        if(secret) {
                          // require some fields with body params
                          User.Update(req.body, req.params.id, (err, result) => {
                            if (err) {
                              res.status(501).json({ code: 501, status: "UPDATE_FAILED", error: err });
                            } else {
                              res.status(200).json({ code: 200, status: "UPDATE_SUCCESS", result });
                            }
                          });
                        } else {
                          res.status(501).json({ code: 501, status: "NOT_IMPLIMENTED" });
                        }
                      })
                      .catch(err => {
                        res.status(501).json({ code: 501, status: "NOT_IMPLIMENTED", error: err
                      });
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
                    const googleCallback = (passport_config.strategy.google.callbackURL) ? (passport_config.strategy.google.callbackURL[ 0 ] === "/" ? passport_config.strategy.google.callbackURL : "/" + passport_config.strategy.google.callbackURL) : "/google/callback";
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
                          user: req.user,
                          accessToken
                        });
                      } else {
                        let condUser = {};
                        condUser[ (passport_config.strategy.google.local_profile_fields.google_id) ? passport_config.strategy.google.local_profile_fields.google_id : "google_id" ] = req.user.google.id;
                        User.FindOne([], condUser, (err, result) => {
                          if (err) {
                            res.status(500).json({
                              code: 500,
                              status: "INTERNAL_SERVER_ERR",
                              error: err
                            });
                          } else {
                            let user = JSON.parse(JSON.stringify(result[ 0 ]));
                            const accessToken = jwt.sign(user, passport_config.secret, {
                              expiresIn: passport_config.token_expired
                            });
                            // response JWT
                            res.status(201).json({
                              code: 201,
                              status: "AUTHORIZED",
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
                    _app_.get(auth_endpoint + '/facebook', passport.authenticate('facebook', { scope: [ 'email', 'public_profile' ] }));
                    // facebook callback
                    const facebookCallback = (passport_config.strategy.facebook.callbackURL) ? (passport_config.strategy.facebook.callbackURL[ 0 ] === "/" ? passport_config.strategy.facebook.callbackURL : "/" + passport_config.strategy.facebook.callbackURL) : "/facebook/callback";
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
                          user: req.user,
                          accessToken
                        });
                      } else {
                        let condUser = {};
                        condUser[ (passport_config.strategy.facebook.local_profile_fields.facebook_id) ? passport_config.strategy.facebook.local_profile_fields.facebook_id : "facebook_id" ] = req.user.facebook.id;
                        User.FindOne([], condUser, (err, result) => {
                          if (err) {
                            res.status(500).json({
                              code: 500,
                              status: "INTERNAL_SERVER_ERR",
                              error: err
                            });
                          } else {
                            let user = JSON.parse(JSON.stringify(result[ 0 ]));
                            const accessToken = jwt.sign(user, passport_config.secret, {
                              expiresIn: passport_config.token_expired
                            });
                            // response JWT
                            res.status(201).json({
                              code: 201,
                              status: "AUTHORIZED",
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
                  // Perfectly and resolve it.
                  resolve(true);
                } else {
                  // Perfectly and resolve it.
                  resolve(false);
                }
              } else {
                // checkPassport is Catch.
                resolve(false);
              }
            });
          } catch (error) {
            reject(error);
          }
        });
        // Promise all
        Promise.all([ signJWT ]).then(async (final) => {
          // [signJWT=init auth endpoint]
          if(final[0]) {
            resolve(true);
          } else {
            // resolve false to JWT turn OFF
            resolve(false);
          }
        }).catch((err) => reject(err));
      } catch (error) {
        reject(error);
      }
    });
  }
}