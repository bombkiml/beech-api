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
// passport
const passport = require("./auth/Passport");
// Read folder in ./src/endpoints/*
const walk = require("walk");
let jsfiles = [];
let walker = walk.walk(appRoot + "/src/endpoints", { followLinks: false });
walker.on("file", (root, stat, next) => {
  jsfiles.push(root + "/" + stat.name);
  next();
});
walker.on("end", () => {
  init(jsfiles);
});
// Initialize the application
init = async (jsfiles) => {
  try {
    await httpExpress.expressStart();
    await dbConnect.mySqlConnection();
    await passport.init();
    await fileWalk.fileWalk(jsfiles);
  } catch (error) {
    throw error;
  }
}
// use router
_app_.use(endpoint);