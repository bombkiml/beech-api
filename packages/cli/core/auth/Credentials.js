const passport = require("passport");
const fs = require("fs");
const passport_config_file = appRoot + "/passport.config.js";
var passport_config;
if (fs.existsSync(passport_config_file)) {
  passport_config = require(passport_config_file);
}

module.exports = {
  credentials: (req, res, next) => {
    if (passport_config.jwt_allow) {
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
        }
        // Check application key allow
        checkAppKey(req, res, (checked) => {
          if (checked) {
            // Forward user information to the next middleware
            req.user = user;
            next();
          }
        });
      }
    )(req, res, next);
  },
  credentialsGuard: (req, res, next) => {
    checkAppKey(req, res, (checked) => {
      if (checked) {
        // Perfectly
        next();
      }
    });
  },
};

function checkAppKey(req, res, cb) {
  if (_passport_config_.app_key_allow) {
    if (req.headers.app_key) {
      if (_config_.main_config.app_key == req.headers.app_key) {
        return cb(true);
      } else {
        res.status(401).json({
          code: 401,
          status: "BAD_REQUEST",
          message: "Unauthorized with wrong key.",
        });
        return cb(false);
      }
    } else {
      res.status(422).json({
        code: 422,
        status: "BAD_ENTIRY",
        message: "Unprocessable Entity.",
      });
      return cb(false);
    }
  } else {
    return cb(true);
  }
}
