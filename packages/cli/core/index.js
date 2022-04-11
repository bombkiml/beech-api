const fs = require("fs");
const appRoot = require("app-root-path");
const moduleAlias = require("module-alias");
moduleAlias.addAlias("@", appRoot + "/src");
const _express_ = require("express");
global._app_ = _express_();
const cors = require("cors");
global.endpoint = _express_.Router();
global._mysql_ = require("mysql");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const expressValidator = require("express-validator");
const globalVariable = require(appRoot + "/global.config.js");
globalVariable.init();
// Local environments
global._config_ = require(appRoot + "/app.config");
const dbConnect = require("./databases/mysql.connection");
const httpExpress = require("./services/http.express");
const fileWalk = require("./file-walk/file-walk");
// View engine
_app_.use(bodyParser.json());
_app_.use(bodyParser.urlencoded({ extended: true }));
_app_.use(cookieParser());
_app_.use(expressSession({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));
_app_.use(expressValidator());
_app_.use(cors({ origin: true, credentials: true }));
// Allow Origin
_app_.all("/", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE, OPTIONS");
  res.header("Content-Type", "application/json; charset=utf-8");
  next();
});
// passport initialization
const authPassport = require("./auth/Passport");
const passport = require("passport");
_app_.use(passport.initialize());
_app_.use(passport.session());
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});
// Read folder in ./src/endpoints/*
const walk = require("walk");
let jsfiles = [];
let walker = walk.walk(appRoot + "/src/endpoints", { followLinks: false });
walker.on("file", (root, stat, next) => {
  jsfiles.push(root + "/" + stat.name);
  // check add-on file exists ?
  if (fs.existsSync(root + "/../Add-on.js")) {
    if (_config_.addOn) {
      jsfiles.push(root + "/../Add-on.js");
    }
  }
  next();
});
// Walking
walker.on("end", () => {
  init(jsfiles);
});
// Initialize the application
init = async (jsfiles) => {
  try {
    await new Promise((resolve) => resolve(dbConnect.mySqlConnection()));
    await new Promise((resolve) => resolve(httpExpress.expressStart()));
    await new Promise((resolve) => resolve(authPassport.init()));
    await new Promise((resolve) => resolve(fileWalk.fileWalk(jsfiles)));
  } catch (error) {
    throw error;
  }
}
// use router
_app_.use(endpoint);