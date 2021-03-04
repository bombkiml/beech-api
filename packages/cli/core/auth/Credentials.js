const passport = require('passport');
module.exports = {
  credentials: (req, res, next) => {
    return passport.authenticate("jwt", {
      session: false
    }, (err, user, info) => {
      if (err) {
        console.log(err, info);
        return next(err);
      }
      if (!user) {
        return res.status(401).json({
          code: 401,
          status: 'error',
          error: 'UNAUTHORIZED_USER'
        });
      }
      // Forward user information to the next middleware
      req.user = user;
      next();
    })(req, res, next);
  }
}