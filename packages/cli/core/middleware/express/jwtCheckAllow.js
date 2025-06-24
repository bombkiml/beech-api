const passport = require("passport");

const checkRoleMiddleware = (options) => {
  return function (req, res, next) {
    if(!Array.isArray(options)) {
      return next();
    } else {
      passport.authenticate("jwt", {
        session: false,
      }, (err, user, info) => {
        // error check
        if (err) {
          console.log(err, info);
          return res.status(403).json({
            code: 403,
            status: "FORBIDDEN",
            message: "Forbidden: Insufficient role",
            info: {
              error: err,
            },
          });
        } else {
          let isPerfectly = true;
          options.forEach((element, key) => {
            let checkVal = Object.values(element).flat();
            let checkKey = Object.keys(element);
            if(user && user[checkKey]) {
              if(checkVal.includes(user[checkKey])) {
                if(options.length -1 === key) {
                  if(isPerfectly) {
                    // Perfectly
                    return next();
                  }
                }
              } else {
                if(isPerfectly) {
                  res.status(403).json({
                    code: 403,
                    status: "FORBIDDEN",
                    message: "Forbidden: Insufficient role",
                  });
                }
                isPerfectly = false;
              }
            } else {
              if(isPerfectly) {
                res.status(403).json({
                  code: 403,
                  status: "FORBIDDEN",
                  message: `No ${checkKey} assigned to token.`,
                });
              }
              isPerfectly = false;
            }
          });
        }
      })(req, res, next);
    }
  }
}

const checkRoleMiddlewareWithDefaultProject = (options) => {
  return function (req, res, next) {
    return checkRoleMiddleware(options)(req, res, next);
  }
}

module.exports = { checkRoleMiddleware, checkRoleMiddlewareWithDefaultProject }