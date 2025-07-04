global.appRoot = require("app-root-path");
const moment = require("moment");
const { performance } = require("perf_hooks");
const moduleAlias = require("module-alias");
moduleAlias.addAlias("@", appRoot + "/src");
const _express_ = require("express");
global._app_ = _express_();
// Compression
const compression = require("compression");
_app_.use(compression());
// Helmet
const helmet = require("helmet");
_app_.use(helmet());
// CORS
const cors = require("cors");
global.endpoint = _express_.Router();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const expressSession = require("express-session");
const expressValidator = require("express-validator");
const globalVariable = require(appRoot + "/global.config.js");
globalVariable.init();
// Local environments
global._config_ = require(appRoot + "/app.config");
const _beech_ = require(appRoot + "/beech.config.js").defineConfig;
global._publicPath_ = _beech_.base;
const mySqlDbConnect = require("./databases/mysql");
const SequelizeDbConnect = require("./databases/sequelize");
// Rate Request middleware
const { Limiter, Duplicater } = require("./middleware/index");
endpoint.use(Limiter);
endpoint.use(Duplicater);
// Database test
const {
  testConnectInProcess,
  filterDbIsTrue,
  disConnectTestDB,
} = require("./databases/test");
// create global sequelize object
const { QueryTypes, DataTypes, Op } = require("sequelize");
global.QueryTypes = QueryTypes;
global.DataTypes = DataTypes;
global.Op = Op;
// Allow whitelist cors
const { whitelist, sign, avg } = require("./middleware/index");
_app_.use(cors({ origin: true, credentials: true }));
_app_.use((req, res, next) => {
  whitelist(async (lists, originSensitive) => {
    sign(req, res, lists, originSensitive, (err) => {
      if (!err) {
        next();
      } else {
        throw err;
      }
    });
  });
});
// View engine
_app_.use(bodyParser.json());
_app_.use(bodyParser.urlencoded({ extended: true }));
_app_.use(methodOverride());
_app_.use(cookieParser());
_app_.use(expressSession({
  secret: "surprise you mother f*cker",
  resave: true,
  saveUninitialized: true,
}));
_app_.use(expressValidator());
// Dev. activity
global._requestTime_ = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
_app_.use((req, res, next) => {
  console.log(`[${_requestTime_}] : Request ${req.method} ${req.originalUrl}`);
  const t0 = performance.now();
  res.on('finish', () => {
    const responseTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const t1 = performance.now();
    const duration = (t1 - t0).toFixed(0);
    console.log(`[${responseTime}] : Response ${res.statusCode} (${duration}ms)`);
  });
  next();
});
// Check Syntax error.
_app_.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    res.status(400).json({
      ...error,
      status: "BAD_REQUEST",
      message: "Bad Request.",
      body: error.body,
    });
  } else {
    next();
  }
});
// Advance Guard
_app_.use(avg);
// Engine import
const httpExpress = require("./services/http.express");
const fileWalk = require("./file-walk/file-walk");
// Passport initialization
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
// Endpoint magic
const { Base } = require("../../lib/index");
// Read folder in ./src/endpoints/*
const walk = require("walk");
let jsfiles = [];
let walker = walk.walk(appRoot + "/src/endpoints", { followLinks: false });
// Walk file on push
walker.on("file", (root, stat, next) => {
  jsfiles.push(root + "/" + stat.name);
  next();
});
// Walking
walker.on("end", () => {
  init(jsfiles);
});
// Initialize the application
init = async (jsfiles) => {
  try {
    const testConnectToDB = new Promise((resolve) => {
      filterDbIsTrue(_config_.database_config, (err, dbTruthy) => {
        if (err) {
          throw ("Config file crash.", err);
        }
        // leave data to disconnect database
        let leaveDataForDisconnect = dbTruthy.slice(0);
        // check db connect truthy length ?
        if (dbTruthy.length > 0) {
          testConnectInProcess(dbTruthy, dbTruthy.length, (err, result, dbs) => {
            if (err) {
              throw ("[101m Failed [0m Database connect failed.", err);
            }
            if (result) {
              // Disconnect database
              disConnectTestDB(leaveDataForDisconnect, dbs, (err, disResult) => {
                if (err) {
                  throw ("[101m Failed [0m Testing Database connect failed.", err);
                }
                if (disResult) {
                  // Disconnect and Next to real
                  resolve(true);
                } else {
                  throw err;
                }
              });
            }
          });
        } else {
          // Not ON connect, Next to real
          resolve(true);
        }
      });
    });
    Promise.all([testConnectToDB]).then(async (x) => {
      if (x[0]) {
        await (pool_base == "basic" ? new Promise((resolve) => resolve(mySqlDbConnect.connect())) : new Promise((resolve) => resolve(SequelizeDbConnect.connect())));
          await authPassport.init().then(async (x) => {
            if (x[0]) {
              throw x[0];
            } else {
              await new Promise((resolve) => resolve(fileWalk.fileWalk(jsfiles)));
              await (pool_base == "basic" ? new Promise((resolve) => resolve()) : new Promise((resolve) => resolve(Base())));
              await new Promise((resolve) => {
                httpExpress.expressStart().then((expss) => {
                  resolve(expss);
                });
              });
            }
          });
      }
    });
  } catch (error) {
    console.log("[101m Compile failed [0m", error);
    throw error;
  }
};
// Use router
_app_.use(_publicPath_, endpoint);
