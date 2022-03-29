const appRoot = require("app-root-path");
const fs = require("fs");
const passport_config_file = appRoot + "/passport.config.js";
const md5 = require("md5");
const secret = require("../../../lib/salt").salt;

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
          return;
        }
      } else {
        global.Credentials = [];
        return;
      }
      // declare constant
      let passportUsernameField = passport_config.model.username_field || "username";
      let passportPasswordField = passport_config.model.password_field || "password";
      let passportTable = passport_config.model.table || "users";
      let passportFields = (passport_config.model.fields.length) ? passport_config.model.fields : ["id", "name", "email"];
      // passport initial with token (encoder)
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
      // passport jwt payload (decoder)
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
      
      // declare head authentication enpoint for all strategy
      let auth_endpoint = (passport_config.auth_endpoint) ? (passport_config.auth_endpoint[0] === "/" ? passport_config.auth_endpoint : "/" + passport_config.auth_endpoint) : "/authentication";      
      
      /**
       * Passport Google Strategy
       * 
       */
      let google_callback_endpoint = (passport_config.strategy.google.callback_endpoint) ? (passport_config.strategy.google.callback_endpoint[0] === "/" ? passport_config.strategy.google.callback_endpoint : "/" + passport_config.strategy.google.callback_endpoint) : "/google/callback";
      passport.use(new GoogleStrategy({
        clientID: passport_config.strategy.google.client_id,
        clientSecret: passport_config.strategy.google.client_secret,
        callbackURL:  auth_endpoint + google_callback_endpoint
      }, (accessToken, refreshToken, profile, done) => {
        // find google user
        let googleIdField = (passport_config.strategy.google.google_id_field) ? passport_config.strategy.google.google_id_field : "google_id";
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
       let facebook_callback_endpoint = (passport_config.strategy.facebook.callback_endpoint) ? (passport_config.strategy.facebook.callback_endpoint[0] === "/" ? passport_config.strategy.facebook.callback_endpoint : "/" + passport_config.strategy.facebook.callback_endpoint) : "/facebook/callback";
       passport.use(new FacebookStrategy({
        clientID: passport_config.strategy.facebook.app_id,
        clientSecret: passport_config.strategy.facebook.app_secret,
        callbackURL: auth_endpoint + facebook_callback_endpoint
      }, (accessToken, refreshToken, profile, done) => {

        console.log(accessToken, refreshToken, profile);

        // fix somthing went wrong


        //return
        
        // find facebook user
        let faecbookIdField = (passport_config.strategy.facebook.google_id_field) ? passport_config.strategy.facebook.facebook_id_field : "facebook_id";
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
  findOrCreate(passport_config, strategy_name, passportFields, passportTable, accessToken, refreshToken, profile, googleIdField, cb) {
    let pool = eval("mysql." + passport_config.model.name);
    if (pool) {
      pool.query("SELECT " + passportFields + " FROM ?? WHERE ?? = ?", [
        passportTable,
        googleIdField,
        profile.id
      ], (err, result) => {
        if (err) {
          cb(err);
        } else {
          // declare data response
          let data = {};
          // check strategy name for store
          if (strategy_name == "google") {
            if (!result[0]) { // find not found and create
              // filter fields
              let fields = [].concat.apply([], [
                (passport_config.strategy.google.profile_fields.name) ? passport_config.strategy.google.profile_fields.name : null,
                (passport_config.strategy.google.profile_fields.email) ? passport_config.strategy.google.profile_fields.email : null,
                (passport_config.strategy.google.profile_fields.photos) ? passport_config.strategy.google.profile_fields.photos : null,
                (passport_config.strategy.google.profile_fields.locate) ? passport_config.strategy.google.profile_fields.locate : null
              ].filter((el) => el != null));
              // fileter values
              let values = [].concat.apply([], [
                (passport_config.strategy.google.profile_fields.name) ? profile.displayName : null,
                (passport_config.strategy.google.profile_fields.email) ? profile.emails[0].value : null,
                (passport_config.strategy.google.profile_fields.photos) ? profile.photos[0].value : null,
                (passport_config.strategy.google.profile_fields.locate) ? profile._json.locale : null
              ].filter((el) => el != null));
              // Store google profile
              pool.query("INSERT INTO ??(??,??,??,??) VALUES(?,?,?,?)", [
                passportTable,
                passport_config.model.username_field || "username",
                passport_config.model.password_field || "password",
                googleIdField,
                fields,
                profile.emails[0].value.split("@")[0],
                md5(profile.id + secret),
                profile.id,
                values
              ], (err, result) => {
                data.result = result;
                data.google = profile;
                cb(err, data);
              });
            } else { // find found
              let users = {};
              users.google = profile;
              users.google.accessToken = accessToken;
              users.google.refreshToken = refreshToken;
              users.user = result[0];
              cb(err, users);
            }
          } else if (strategy_name == "facebook") {

            console.log(result)

          }
        }
      });          
    } else {
      cb(null, null, true);
    }
  }

}