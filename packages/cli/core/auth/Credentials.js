const passport = require("passport");
const fs = require("fs");
const { checkRoleMiddleware } = require("../middleware/express/jwtCheckAllow");
const passport_config_file = appRoot + "/passport.config.js";
var passport_config;
if (fs.existsSync(passport_config_file)) {
  passport_config = require(passport_config_file);
}

const byPassCredentials = (options, _res = {}, _next = () => {}) => {
  if(!options.length) {
    if(passport_config.jwt_broken_role ? passport_config.jwt_broken_role.length > 0 : false) {
      // CASE: jwt_broken_role DEFUALT is set
      return [credentials, checkRoleMiddleware(passport_config.jwt_broken_role)(options, _res, _next)];
    } else {
      if(!Object.keys(options).length) {
        return [credentials];
      } else {
        if("headers" in options) {
          // CASE: Only Credentials
          return [credentials(options, _res, _next)];
        } else {
          // CASE: jwt_broken_role DEFUALT is not set
          return [credentials];
        }
      }
    }
  } else {
    // CASE: options Credentials is set
    return [credentials, checkRoleMiddleware(options)];
  }
}


const credentials = (req, res, next) => {
  if (passport_config.jwt_allow === true) {
    const auth_endpoint = (passport_config.auth_endpoint) ? (passport_config.auth_endpoint[ 0 ] === "/" ? passport_config.auth_endpoint : "/" + passport_config.auth_endpoint) : "/authentication";
    if(auth_endpoint.split("/")[1] == req.params.hash) {
      return next();
    }
  }

  return passport.authenticate("jwt", {
    session: false,
  }, (err, user, info) => {
      // error check
      if (err) {
        console.log(err, info);
        return res.status(401).json({
          code: 401,
          error: "UNAUTHORIZED",
          message: {
            name: "WrongTokenError",
            message: "token error.",
          },
          /* dev: { err, info }, */ // for dev info
        });
      }
      // anything token check
      if (!user) {
        if (info) {
          if (info.name == "TokenExpiredError") {
            return res.status(401).json({
              code: 401,
              status: "TOKEN_EXPIRED",
              message: info,
            });
          }
          if (info.name == "Error") {
            return res.status(401).json({
              code: 401,
              status: "NO_AUTH_TOKEN",
              message: {
                name: "NoTokenError",
                message: "No auth token",
              },
            });
          }
          if (info.name == "SyntaxError") {
            return res.status(401).json({
              code: 401,
              status: "PAYLOAD_SYNTAX_ERROR",
              message: {
                name: "SyntaxError",
                message: "Unexpected token < in JSON at position 0",
              },
            });
          }
        }
        return res.status(401).json({
          code: 401,
          status: "UNAUTHORIZED_USER",
          message: info || {
            name: "TokenError",
            message: "Unauthorized token."
          },
        });
      } else {
        // Perfectly user jwt
        return next();
      }
    }
  )(req, res, next);
}

const credentialsGuard = (req, res, next) => {
  checkAppKey(req, res, (checked) => {
    if (checked) {
      // Perfectly
      next();
    }
  });
}

function checkAppKey(req, res, cb) {
  if (_passport_config_.app_key_allow) {
    if (req.headers.app_key) {
      if (_config_.main_config.app_key == req.headers.app_key) {
        return cb(true);
      } else {
        res.status(400).json({
          code: 400,
          status: 'BAD_REQUEST',
          message: "Bad request.",
          info: {
            status: "BAD_VALUE",
            message: "Bad with wrong key."
          },
        });
        return cb(false);
      }
    } else {
      res.status(400).json({
        code: 400,
        status: 'BAD_REQUEST',
        message: "Bad request.",
        info: {
          status: "BAD_ENTITY",
          message: "Bad with app entity key.",
        },
      });
      return cb(false);
    }
  } else {
    return cb(true);
  }
}

module.exports = { byPassCredentials, credentials, credentialsGuard };
