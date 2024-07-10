const appRoot = require("app-root-path");
const fs = require("fs");
const passport_config_file = appRoot + "\\passport.config.js";
const md5 = require("md5");
const secret = require("../../../lib/src/salt").salt;
const { findPassportPk, checkAuthFields } = require("../helpers/poolEntity");
const { Rand } = require("../helpers/math");
const { QueryTypes } = require("sequelize");

module.exports = {
  init() {
    return new Promise((resolve) => {
      try {
        var passport_config;
        const p1 = new Promise((resolve, reject) => {
          /**
           * Resolve ref:
           * [0=passport_file_exists, 1=jwt_allow, 2=db_passport_map_is_connect]
           * 
           */
          if (fs.existsSync(passport_config_file)) {
            const auth = require("./Credentials");
            passport_config = require(passport_config_file);
            if (passport_config.jwt_allow) {
              global.Credentials = auth.credentials;
              // loop check db connect is true
              fs.readFile("./app.config.js", "utf-8", (err, data) => {
                if(err) {
                  reject(err);
                } else {
                  let mineConfDb = eval(data).database_config;
                  mineConfDb.filter((e, k) => {
                    if(e.name == passport_config.model.name) {
                      if(e.is_connect) {
                        resolve([true, true, true]);
                      } else {
                        // Database of Passport mapped is closed.
                        resolve([true, true, false]);
                      }
                    } else {
                      if(mineConfDb.length == k+1) {
                        // Database of Passport mapped is Name not match.
                        resolve([true, true, null]);
                      }
                    }
                  });
                }
              });
            } else if (passport_config.app_key_allow) {
              global.Credentials = auth.credentialsGuard;
              resolve([true, false, null]);
            } else {
              global.Credentials = [];
              resolve([true, false, null]);
            }
          } else {
            global.Credentials = [];
            //const Requests = require("./_Request");
            //global.Credentials = Requests.requests; ----> // [Closed] TODO check passport.config file if not exists show error when file src/ using the JWT (maybe for show JWT is ON/OFF)
            resolve([false, null, null]);
          }
        });
        Promise.all([p1]).then(final => {
          // Checking passport file, allow, mapped
          if(final[0][0] && final[0][1] && final[0][2]) {
            var passport = require("passport")
                LocalStrategy = require("passport-local").Strategy,
                GoogleStrategy = require("passport-google-oauth").OAuth2Strategy,
                FacebookStrategy = require('passport-facebook').Strategy;
            var passportJWT = require("passport-jwt"),
                JWTStrategy = passportJWT.Strategy,
                ExtractJWT = passportJWT.ExtractJwt;
            // declare constant
            var passportUsernameField = passport_config.model.username_field || "username";
            var passportPasswordField = passport_config.model.password_field || "password";
            var passportTable = passport_config.model.table || "users";
            var pool = eval("sql." + passport_config.model.name);
            checkAuthFields(pool_base, pool, passportTable, passport_config.model.fields, (err, msg) => {
              if(err) {
                console.error("\n[101m Error [0m", err);
                return;
              } else {
                // find passport primary key
                findPassportPk(pool_base, pool, passportTable, passport_config.model.fields, (err, passportFields) => {
                  if(err) {
                    resolve([err, true, true, true]);
                  } else {
                    // Passport initial with token (encoder)
                    passport.use(new LocalStrategy({
                      usernameField: passportUsernameField,
                      passwordField: passportPasswordField
                    }, async (username, password, done) => {
                      if (pool) {
                        if (pool_base == "basic") {
                          // pool base is MySQL
                          pool.query("SELECT " + passportFields + " FROM ?? WHERE ?? = ? AND ?? = ?", [
                            passportTable,
                            passportUsernameField,
                            username,
                            passportPasswordField,
                            md5(password + secret)
                          ], (err, result) => {
                            if (err) {
                              return done(err, null);
                            } else {
                              return done(null, JSON.parse(JSON.stringify(result[ 0 ] || null)));
                            }
                          });
                        } else if (pool_base == "sequelize") {
                          // pool base is Sequelize
                          try {
                            let result = await pool.query("SELECT " + passportFields + " FROM " + passportTable + " WHERE " + passportUsernameField + " = :username AND " + passportPasswordField + " = :password", {
                              replacements: {
                                fields: passportFields,
                                username: username,
                                password: md5(password + secret)
                              },
                              type: QueryTypes.SELECT
                            });
                            return done(null, JSON.parse(JSON.stringify(result[ 0 ] || null)));
                          } catch (error) {
                            return done(error, null);
                          }
                        } else {
                          return done({ error: "The Base pool error. UNKNOWN pool_base = '"+ pool_base +"'" }, null);
                        }
                      } else {
                        return done(null, null, true);
                      }
                    }));
      
                    // Passport jwt payload (decoder)
                    passport.use(new JWTStrategy({
                      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
                      secretOrKey: passport_config.secret
                    }, async (jwtPayload, done) => {
                      let pool = eval("sql." + passport_config.model.name);
                      if (pool) {
                        if (pool_base == "basic") {
                          pool.query("SHOW KEYS FROM " + passportTable + " WHERE Key_name = 'PRIMARY'", (err, pk) => {
                            if(err) {
                              return done(err, null);
                            } else {
                              let fieldPk = pk[0].Column_name;
                              // pool base is MySQL
                              pool.query("SELECT " + passportFields + " FROM ?? WHERE " + fieldPk + " = ?", [
                                passportTable,
                                jwtPayload[fieldPk]
                              ], (err, result) => {
                                if (err) {
                                  return done(err, null);
                                } else {
                                  return done(null, JSON.parse(JSON.stringify(result[ 0 ] || null)));
                                }
                              });
                            }
                          });
                        } else if (pool_base == "sequelize") {
                          // pool base is Sequelize
                          try {
                            pool.query("SHOW KEYS FROM " + passportTable + " WHERE Key_name = 'PRIMARY'", { type: QueryTypes.SELECT }).then((pk) => {
                              let fieldPk = pk[0].Column_name;
                              pool.query("SELECT " + passportFields + " FROM " + passportTable + " WHERE " + fieldPk + " = :pk", {
                                replacements: {
                                  pk: + jwtPayload[fieldPk]
                                },
                                type: QueryTypes.SELECT,
                              }).then((result) => {
                                return done(null, JSON.parse(JSON.stringify(result[ 0 ] || null)));
                              }).catch((err) => {
                                return done(err, null);
                              });
                            }).catch((err) => {
                              return done(err, null);
                            });
                          } catch (error) {
                            return done(error, null);
                          }
                        } else {
                          return done({ error: "The Base pool error. UNKNOWN pool_base = '"+ pool_base +"'" }, null);
                        }
                      } else {
                        return done(null, null, true);
                      }
                    }));
      
                    // Declare head authentication enpoint for all strategy
                    let auth_endpoint = (passport_config.auth_endpoint) ? (passport_config.auth_endpoint[ 0 ] === "/" ? passport_config.auth_endpoint : "/" + passport_config.auth_endpoint) : "/authentication";
      
                    /**
                     * Passport Google Strategy
                     * 
                     */
                    let google_callbackURL = (passport_config.strategy.google.callbackURL) ? (passport_config.strategy.google.callbackURL[ 0 ] === "/" ? passport_config.strategy.google.callbackURL : "/" + passport_config.strategy.google.callbackURL) : "/google/callback";
                    passport.use(new GoogleStrategy({
                      clientID: passport_config.strategy.google.client_id,
                      clientSecret: passport_config.strategy.google.client_secret,
                      callbackURL: auth_endpoint + google_callbackURL
                    }, (accessToken, refreshToken, profile, done) => {
                      // find google user
                      let googleIdField = (passport_config.strategy.google.local_profile_fields.google_id) ? passport_config.strategy.google.local_profile_fields.google_id : "google_id";
                      this.findOrCreate(passport_config, "google", passportFields, passportTable, accessToken, refreshToken, profile, googleIdField, (err, res, dbFailed) => {
                        if (err) {
                          return done(err);
                        } else {
                          return done(err, res, dbFailed);
                        }
                      });
                    }));
      
                    /**
                     * Passport Facebook Strategy
                     * 
                     */
                    let facebook_callbackURL = (passport_config.strategy.facebook.callbackURL) ? (passport_config.strategy.facebook.callbackURL[ 0 ] === "/" ? passport_config.strategy.facebook.callbackURL : "/" + passport_config.strategy.facebook.callbackURL) : "/facebook/callback";
                    // merge fields permisions
                    let allow_permisions_fields = [ ...new Set([ ...[ 'id', 'displayName', 'name', 'photos', 'email', 'location' ], ...(passport_config.strategy.facebook.profileFieldsAllow || []) ]) ];
                    passport.use(new FacebookStrategy({
                      clientID: passport_config.strategy.facebook.app_id,
                      clientSecret: passport_config.strategy.facebook.app_secret,
                      callbackURL: auth_endpoint + facebook_callbackURL,
                      profileFields: allow_permisions_fields
                    }, (accessToken, refreshToken, profile, done) => {
                      // Check if the email permission is granted
                      /**
                       * Update : Permissions Reference for Meta Technologies APIs.
                       * Starting on or after October 27, 2023, if your app requests permission to use an endpoint to access an app user’s data
                       * Learn more : https://developers.facebook.com/docs/permissions
                       * 
                       * From now! Disabled check if email permission granted
                       */
                      //if (!profile.emails || profile.emails.length === 0) {
                      //  return done(new Error('Email permission not granted.'));
                      //}
                      // find facebook user
                      let faecbookIdField = (passport_config.strategy.facebook.local_profile_fields.facebook_id) ? passport_config.strategy.facebook.local_profile_fields.facebook_id : "facebook_id";
                      this.findOrCreate(passport_config, "facebook", passportFields, passportTable, accessToken, refreshToken, profile, faecbookIdField, (err, res, dbFailed) => {
                        if (err) {
                          return done(err);
                        } else {
                          return done(err, res, dbFailed);
                        }
                      });
                    }));
                    // Everything is Perfectly
                    resolve([null, true, true, true]);
                  } // end if check err findPassportPk
                }); // end findPassportPk
              } // end checkAuthFields
            });
          } else if(final[0][0] && final[0][1] && final[0][2] === false) {
            // Database connection mapped is Closed.
            resolve([`Database connection name \`${passport_config.model.name}\` is CLOSED. Checking ON/OFF inside app.conifg.js file.`, true, true, false]);
          } else if(final[0][0] && final[0][1] && !final[0][2]) {
            // Passport Database connection name is NOT MATCH.
            resolve([`Connection name \`${passport_config.model.name}\` with Passport model name mapped is NOT MATCH. Checking name to match it.`, true, true, false]);
          } else if(final[0][0] && !final[0][1] && final[0][2] === null) {
            // JWT not allow
            resolve([null, true, false, null]);
          } else {
            // JWT file not found, Or JWT not intitialize.
            resolve([null, false, null, null]);
          } // end if check Resolve ref:
        }).catch(err => {
          throw err;
        });
      } catch (error) {
        throw error;
      }
    });
  },
  findOrCreate(passport_config, strategy_name, passportFields, passportTable, accessToken, refreshToken, profile, idField, cb) {
    let pool = eval("sql." + passport_config.model.name);
    if (pool) {
      this.query_one_where(pool, "SELECT " + passportFields + " FROM " + passportTable, idField, profile.id, async (err, result) => {
        if (err) {
          cb(err);
        } else {
          // declare data response
          let data = {};
          // prepare data for store
          let usr = passport_config.model.username_field || "username";
          let psw = passport_config.model.password_field || "password";
          let usrProfile = Rand(10);
          let md5Psw = md5(profile.id + secret);
          // check strategy name for store
          if (strategy_name == "google") {
            if (!result[ 0 ]) { // find not found and create
              // filter fields
              let fields = [].concat.apply([], [
                (passport_config.strategy.google.local_profile_fields.name) ? passport_config.strategy.google.local_profile_fields.name : null,
                (passport_config.strategy.google.local_profile_fields.email) ? passport_config.strategy.google.local_profile_fields.email : null,
                (passport_config.strategy.google.local_profile_fields.photos) ? passport_config.strategy.google.local_profile_fields.photos : null,
                (passport_config.strategy.google.local_profile_fields.locate) ? passport_config.strategy.google.local_profile_fields.locate : null
              ].filter((el) => el != null));
              // fileter values
              let values = [].concat.apply([], [
                (passport_config.strategy.google.local_profile_fields.name) ? profile.displayName : null,
                (passport_config.strategy.google.local_profile_fields.email) ? profile.emails[ 0 ].value : null,
                (passport_config.strategy.google.local_profile_fields.photos) ? profile.photos[ 0 ].value : null,
                (passport_config.strategy.google.local_profile_fields.locate) ? profile._json.locale : null
              ].filter((el) => el != null));
              // Store google profile
              if (pool_base == "basic") {
                // check null and remove it.
                let basicReplacement = new Set([
                  passportTable,
                  usr,
                  psw,
                  idField,
                  fields,
                  usrProfile,
                  md5Psw,
                  profile.id,
                  values
                ]);
                delete basicReplacement.delete(null);
                basicReplacement = Array.from(basicReplacement).filter(e => JSON.stringify(e) !== '[]');
                // pool base is MySQL
                pool.query("INSERT INTO ??(??,??,??" + (fields.length ? ",??)" : ")") + " VALUES(?,?,?" + (values.length ? ",?)" : ")"), basicReplacement, (err, result) => {
                  data.result = result;
                  data.google = profile;
                  cb(err, data);
                });
              } else if (pool_base == "sequelize") {
                // check null and remove it.
                let sequelizeReplacement = new Set([
                  passportTable,
                  usr,
                  psw,
                  idField,
                  fields,
                  usrProfile,
                  md5Psw,
                  profile.id,
                  values
                ]);
                sequelizeReplacement = Array.from(sequelizeReplacement).filter(e => JSON.stringify(e) !== '[]');
                // pool base is Sequelize
                try {
                  let result = await pool.query(`INSERT INTO ${passportTable}(${usr},${psw},${idField}${fields.length ? ',' + fields + ')' : ')'} VALUES(:usrProfile,:md5Psw,:profileId${values.length ? ',:values)' : ')'}`, {
                    replacements: {
                      usr: sequelizeReplacement[1],
                      psw: sequelizeReplacement[2],
                      idField: sequelizeReplacement[3],
                      usrProfile: usrProfile,
                      md5Psw: md5Psw,
                      profileId: profile.id,
                      values: values.length ? values : []
                    },
                    type: QueryTypes.INSERT
                  });
                  data.result = result;
                  data.google = profile;
                  cb(err, data);
                } catch (error) {
                  cb(error, null);
                }
              } else {
                cb({ error: "The Base pool error. UNKNOWN pool_base = '"+ pool_base +"'" }, null);
              }
            } else { // find found
              let users = {};
              users.google = profile;
              users.google.accessToken = accessToken;
              users.google.refreshToken = refreshToken;
              users.user = result[ 0 ];
              cb(err, users);
            }
          } else if (strategy_name == "facebook") {
            // STEP 1: check email empty for username
            if(passport_config.strategy.facebook.local_profile_fields.email) { // Now support only Google, Because Facebook requests permission: https://developers.facebook.com/docs/permissions
              if(!profile.emails) {
                return cb(JSON.stringify({
                  code: 500,
                  status: "ERR_FACEBOOK_PROFILE_PERMISSIONS",
                  error: "Facebook needed allow `email` and `public_profile` permisions: https://developers.facebook.com/docs/permissions"
                }), null);
              }
            }
            // STEP 2: find not found and create
            if (!result[ 0 ]) {
              // filter fields
              let fields = [].concat.apply([], [
                (passport_config.strategy.facebook.local_profile_fields.name) ? passport_config.strategy.facebook.local_profile_fields.name : null,
                (passport_config.strategy.facebook.local_profile_fields.email) ? passport_config.strategy.facebook.local_profile_fields.email : null,
                (passport_config.strategy.facebook.local_profile_fields.photos) ? passport_config.strategy.facebook.local_profile_fields.photos : null,
                (passport_config.strategy.facebook.local_profile_fields.locate) ? passport_config.strategy.facebook.local_profile_fields.locate : null
              ].filter((el) => el != null));
              // fileter values
              let values = [].concat.apply([], [
                (passport_config.strategy.facebook.local_profile_fields.name) ? profile.displayName : null,
                (passport_config.strategy.facebook.local_profile_fields.email) ? (profile.emails) ? profile.emails[ 0 ].value : null : null,
                (passport_config.strategy.facebook.local_profile_fields.photos) ? profile.photos[ 0 ].value : null,
                (passport_config.strategy.facebook.local_profile_fields.locate) ? profile._json.location.name : null
              ].filter((el) => el != null));
              // Store facebook profile
              if (pool_base == "basic") {
                // check null and remove it.
                let basicReplacement = new Set([
                  passportTable,
                  usr,
                  psw,
                  idField,
                  fields,
                  usrProfile,
                  md5Psw,
                  profile.id,
                  values
                ]);
                delete basicReplacement.delete(null);
                basicReplacement = Array.from(basicReplacement).filter(e => JSON.stringify(e) !== '[]');
                // pool base is MySQL
                pool.query("INSERT INTO ??(??,??,??" + (fields.length ? ",??)" : ")") + " VALUES(?,?,?" + (values.length ? ",?)" : ")"), basicReplacement, (err, result) => {
                  data.result = result;
                  data.facebook = profile;
                  cb(err, data);
                });
              } else if (pool_base == "sequelize") {
                // check null and remove it.
                let sequelizeReplacement = new Set([
                  passportTable,
                  usr,
                  psw,
                  idField,
                  fields,
                  usrProfile,
                  md5Psw,
                  profile.id,
                  values
                ]);
                sequelizeReplacement = Array.from(sequelizeReplacement).filter(e => JSON.stringify(e) !== '[]');
                // pool base is Sequelize
                try {
                  let result = await pool.query(`INSERT INTO ${passportTable}(${usr},${psw},${idField}${fields.length ? ',' + fields + ')' : ')'} VALUES(:usrProfile,:md5Psw,:profileId${values.length ? ',:values)' : ')'}`, {
                    replacements: {
                      usr: sequelizeReplacement[1],
                      psw: sequelizeReplacement[2],
                      idField: sequelizeReplacement[3],
                      usrProfile: usrProfile,
                      md5Psw: md5Psw,
                      profileId: profile.id,
                      values: values.length ? values : []
                    },
                    type: QueryTypes.INSERT
                  });
                  data.result = result;
                  data.facebook = profile;
                  cb(err, data);
                } catch (error) {
                  cb(error, null);
                }
              } else {
                cb({ error: "The Base pool error. UNKNOWN pool_base = '"+ pool_base +"'" }, null);
              }
            } else { // find found
              let users = {};
              users.facebook = profile;
              users.facebook.accessToken = accessToken;
              users.facebook.refreshToken = refreshToken;
              users.user = result[ 0 ];
              cb(err, users);
            }
          }
        }
      });
    } else {
      cb(null, null, true);
    }
  },
  async query_one_where(pool, sql, field, id, cb) {
    try {
      if (pool_base == "basic") {
        // pool base is MySQL
        pool.query(sql + " WHERE ?? = ?", [ field, id ], (err, result) => {
          if (err) {
            return cb(err, null);
          } else {
            return cb(null, JSON.parse(JSON.stringify(result || null)));
          }
        });
      } else if (pool_base == "sequelize") {
        // pool base is Sequelize
        try {
          let result = await pool.query(`${sql} WHERE ${field} = :id`, {
            replacements: {
              id: id
            },
            type: QueryTypes.SELECT
          });
          return cb(null, JSON.parse(JSON.stringify(result || null)));
        } catch (error) {
          return cb(error, null);
        }
      } else {
        return done({ error: "The Base pool error. UNKNOWN pool_base = '"+ pool_base +"'" }, null);
      }
    } catch (error) {
      cb(error, null);
    }
  },
}
