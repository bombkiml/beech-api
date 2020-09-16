const appRoot = require("app-root-path");
const fs = require("fs");
const passport_config_file = appRoot + "/passport.config.js";
const md5 = require("md5");
const secret = require("../../../lib/salt").salt;

module.exports = {
  init() {
    try {
      if (fs.existsSync(passport_config_file)) {
        var passport = require("passport"), LocalStrategy = require("passport-local").Strategy;
        var passportJWT = require("passport-jwt"), JWTStrategy = passportJWT.Strategy, ExtractJWT = passportJWT.ExtractJwt;
        const auth = require("./Credentials");
        var passport_config = require(passport_config_file);
        if (passport_config.jwt_allow) {
          global.Credentials = auth.credentials;
        } else {
          global.Credentials = [];
          return;
        }
      } else {
        global.Credentials = [];
        return;
      }
      // passport initialization
      _app_.use(passport.initialize());
      // declare constant
      let passportUsernameField = passport_config.model.username_field || "username";
      let passportPasswordField = passport_config.model.password_field || "password";
      let passportTable = passport_config.model.table || "users";
      let passportFields = (passport_config.model.fields.length) ? passport_config.model.fields : ["id", "name", "email"];
      // passport initial with token
      passport.use(new LocalStrategy({
        usernameField: passportUsernameField,
        passwordField: passportPasswordField
      }, (username, password, done) => {
        let pool = eval("mysql." + passport_config.model.name);
        if (pool) {
          pool.query("SELECT " + passportFields + " FROM ?? WHERE ?? = ? AND ?? = ?", [
            passportTable,
            passportUsernameField,
            username,
            passportPasswordField,
            md5(password + secret)
          ], (err, result) => {
            if (err) {
              return done(err);
            } else {
              return done(null, JSON.parse(JSON.stringify(result[0] || null)));
            }
          });
        } else {
          return done(null, null, true);
        }
      }));
      // passport jwt payload
      passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: passport_config.secret
      }, (jwtPayload, done) => {
        let pool = eval("mysql." + passport_config.model.name);
        if (pool) {
          pool.query("SELECT " + passportFields + " FROM ?? WHERE id = ?", [
            passportTable,
            jwtPayload.id
          ], (err, result) => {
            if (err) {
              return done(err);
            } else {
              return done(null, JSON.parse(JSON.stringify(result[0] || null)));
            }
          });
        } else {
          return done(null, null, true);
        }
      }));
    } catch (error) {
      return done(true);
    }
  }
}