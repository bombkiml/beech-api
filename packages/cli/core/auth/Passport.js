const appRoot = require("app-root-path");
const fs = require("fs");
const passport_config_file = appRoot + "\\passport.config.js";
const md5 = require("md5");
const secret = require("../../../lib/src/salt").salt;
const { QueryTypes } = require("sequelize");

module.exports = {
  init() {
    try {
      if (fs.existsSync(passport_config_file)) {
        var passport = require("passport"),
          LocalStrategy = require("passport-local").Strategy,
          GoogleStrategy = require("passport-google-oauth").OAuth2Strategy,
          FacebookStrategy = require('passport-facebook').Strategy;
        var passportJWT = require("passport-jwt"),
          JWTStrategy = passportJWT.Strategy,
          ExtractJWT = passportJWT.ExtractJwt;
        const auth = require("./Credentials");
        var passport_config = require(passport_config_file);
        if (passport_config.jwt_allow) {
          global.Credentials = auth.credentials;
        } else {
          global.Credentials = [];
        }
      } else {
        global.Credentials = [];
        //const Requests = require("./Request");
        //global.Credentials = Requests.requests; ----> // [Closed] TODO check passport.config file if not exists show error when file src/ using the JWT (maybe for show JWT is ON/OFF)
        return;
      }
      // declare constant
      let passportUsernameField = passport_config.model.username_field || "username";
      let passportPasswordField = passport_config.model.password_field || "password";
      let passportTable = passport_config.model.table || "users";
      let passportFields = (passport_config.model.fields.length) ? passport_config.model.fields : [ "id", "name", "email" ];
      // passport initial with token (encoder)
      passport.use(new LocalStrategy({
        usernameField: passportUsernameField,
        passwordField: passportPasswordField
      }, async (username, password, done) => {
        let pool = eval("sql." + passport_config.model.name);
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
            return done({ error: "Base pool SQL error." }, null);
          }
        } else {
          return done(null, null, true);
        }
      }));
      // passport jwt payload (decoder)
      passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: passport_config.secret
      }, async (jwtPayload, done) => {
        let pool = eval("sql." + passport_config.model.name);
        if (pool) {
          if (pool_base == "basic") {
            // pool base is MySQL
            pool.query("SELECT " + passportFields + " FROM ?? WHERE id = ?", [
              passportTable,
              jwtPayload.id
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
              let result = await pool.query("SELECT " + passportFields + " FROM " + passportTable + " WHERE id = :id", {
                replacements: {
                  id: jwtPayload.id
                },
                type: QueryTypes.SELECT
              });
              return done(null, JSON.parse(JSON.stringify(result[ 0 ] || null)));
            } catch (error) {
              return done(error, null);
            }
          } else {
            return done({ error: "Base pool SQL error." }, null);
          }
        } else {
          return done(null, null, true);
        }
      }));

      // declare head authentication enpoint for all strategy
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
      let allow_permisions_fields = [ ...new Set([ ...[ 'id', 'email' ], ...passport_config.strategy.facebook.profileFieldsAllow ]) ];
      passport.use(new FacebookStrategy({
        clientID: passport_config.strategy.facebook.app_id,
        clientSecret: passport_config.strategy.facebook.app_secret,
        callbackURL: auth_endpoint + facebook_callbackURL,
        profileFields: allow_permisions_fields
      }, (accessToken, refreshToken, profile, done) => {
        // Check if the email permission is granted
        if (!profile.emails || profile.emails.length === 0) {
          return done(new Error('Email permission not granted.'));
        }
        // find facebook user
        let faecbookIdField = (passport_config.strategy.facebook.local_profile_fields.facebook_id) ? passport_config.strategy.facebook.local_profile_fields.facebook_id : "facebook_id";
        this.findOrCreate(passport_config, "facebook", passportFields, passportTable, accessToken, refreshToken, profile, faecbookIdField, (err, res, dbFailed) => {
          if (err) {
            return done(err);
          } else {
            return done(err, res, dbFailed);
          }
        });
      }
      ));
    } catch (error) {
      throw error;
    }
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
          let profileEmail = profile.emails[ 0 ].value.split("@")[ 0 ];
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
                // pool base is MySQL
                pool.query("INSERT INTO ??(??,??,??,??) VALUES(?,?,?,?)", [
                  passportTable,
                  usr,
                  psw,
                  idField,
                  fields,
                  profileEmail,
                  md5Psw,
                  profile.id,
                  values
                ], (err, result) => {
                  data.result = result;
                  data.google = profile;
                  cb(err, data);
                });
              } else if (pool_base == "sequelize") {
                // pool base is Sequelize
                try {
                  let result = await pool.query(`INSERT INTO ${passportTable}(${usr},${psw},${idField},${fields}) VALUES(:profileEmail,:md5Psw,:profileId,:values)`, {
                    replacements: {
                      usr: usr,
                      psw: psw,
                      idField: idField,
                      profileEmail: profileEmail,
                      md5Psw: md5Psw,
                      profileId: profile.id,
                      values: values
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
                cb({ error: "Base pool SQL error." }, null);
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
            if (!result[ 0 ]) { // find not found and create
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
                (passport_config.strategy.facebook.local_profile_fields.email) ? profile.emails[ 0 ].value : null,
                (passport_config.strategy.facebook.local_profile_fields.photos) ? profile.photos[ 0 ].value : null,
                (passport_config.strategy.facebook.local_profile_fields.locate) ? profile._json.location.name : null
              ].filter((el) => el != null));
              // Store facebook profile
              if (pool_base == "basic") {
                // pool base is MySQL
                pool.query("INSERT INTO ??(??,??,??,??) VALUES(?,?,?,?)", [
                  passportTable,
                  usr,
                  psw,
                  idField,
                  fields,
                  profileEmail,
                  md5Psw,
                  profile.id,
                  values
                ], (err, result) => {
                  data.result = result;
                  data.facebook = profile;
                  cb(err, data);
                });
              } else if (pool_base == "sequelize") {
                // pool base is Sequelize
                try {
                  let result = await pool.query(`INSERT INTO ${passportTable}(${usr},${psw},${idField},${fields}) VALUES(:profileEmail,:md5Psw,:profileId,:values)`, {
                    replacements: {
                      usr: usr,
                      psw: psw,
                      idField: idField,
                      profileEmail: profileEmail,
                      md5Psw: md5Psw,
                      profileId: profile.id,
                      values: values
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
                cb({ error: "Base pool SQL error." }, null);
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
        return done({ error: "Base pool SQL error." }, null);
      }
    } catch (error) {
      cb(error, null);
    }
  }

}