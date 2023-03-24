const passport = require('passport');
module.exports = {
  credentials: (req, res, next) => {
    return passport.authenticate("jwt", {
      session: false
    }, (err, user, info) => {
      // error check
      if (err) {
        console.log(err, info);
        return next(err);
      }
      // anything token check
      if (!user) {
        if (info.name == 'TokenExpiredError') {
          return res.status(401).json({
            code: 401,
            status: 'error',
            error: 'TOKEN_EXPIRED',
            message: info
          });
        }
        if (info.name == 'Error') {
          return res.status(401).json({
            code: 401,
            status: 'error',
            error: 'NO_AUTH_TOKEN',
            message: {
              name: 'NoTokenError',
              message: 'No auth token'
            }
          });
        }
        if (info.name == 'SyntaxError') {
          return res.status(401).json({
            code: 401,
            status: 'error',
            error: 'PAYLOAD_SYNTAX_ERROR',
            message: {
              name: 'SyntaxError',
              message: 'Unexpected token < in JSON at position 0'
            }
          });
        }
        return res.status(401).json({
          code: 401,
          status: 'error',
          error: 'UNAUTHORIZED_USER',
          message: info
        });
      }
      // Forward user information to the next middleware
      req.user = user;
      next();
    })(req, res, next);
  }
}