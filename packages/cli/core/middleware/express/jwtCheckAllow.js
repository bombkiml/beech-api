const passport = require("passport");

const checkRoleMiddleware = (options) => {
  return (req, res, next) => {
    if(!Array.isArray(options)) {
      // Perfectly with options is not type Array
      return next();
    } else {
      passport.authenticate("jwt", {
        session: false,
      }, (err, user, info) => {
        // error check
        if (err) {
          //console.log(err, info);
          return res.status(403).json({
            code: 403,
            status: "FORBIDDEN",
            message: "Forbidden: Insufficient role",
            info: {
              error: err,
            },
          });
        } else {
          if(!options.length) {
            // Perfectly with no options
            return next();
          } else {
            const allowed = options.some(rule => {
              return Object.entries(rule).every(([key, condition]) => {
                //console.log('----matchCondition(user?.[key], condition, user)-->>', matchCondition(user?.[key], condition, user));
                return matchCondition(user?.[key], condition, user);
              });
            });
            if (allowed) {
              return next();
            } else {
              res.status(403).json({
                code: 403,
                status: "FORBIDDEN",
                message: "Forbidden: Insufficient role",
                info: {
                  status: "ROLE_NOT_ALLOWED",
                  error: "Insufficient role or User token does not have sufficient role.",
                },
              });
            }
          }
        }
      })(req, res, next);
    }
  }
}

const operators = {
  $eq: (userValue, expected) => userValue === expected,
  $ne: (userValue, expected) => userValue !== expected,
  $in: (userValue, expected) => Array.isArray(expected) && expected.includes(userValue),
  $not: (userValue, expected) => Array.isArray(expected) && !expected.includes(userValue),
  $regex: (userValue, expected) =>
    typeof userValue === 'string' && expected instanceof RegExp
      ? expected.test(userValue)
      : false,
  $fn: (userValue, fn, user) => typeof fn === 'function' && fn(userValue, user),
};

const matchCondition = (userValue, condition, user) => {
  if (typeof condition !== 'object' || condition instanceof RegExp || Array.isArray(condition)) {
    return Array.isArray(condition)
      ? operators.$in(userValue, condition)
      : operators.$eq(userValue, condition);
  }
  // operator object
  return Object.entries(condition).every(([op, expected]) => {
    const handler = operators[op];
    if (!handler) return false;
    return handler(userValue, expected, user);
  });
};

const checkRoleMiddlewareWithDefaultProject = (options) => {
  return function (req, res, next) {
    return checkRoleMiddleware(options)(req, res, next);
  }
}

module.exports = { checkRoleMiddleware, checkRoleMiddlewareWithDefaultProject };