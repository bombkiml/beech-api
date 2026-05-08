const _beech_ = require(appRoot + "/beech.config.js");
const rateLimit = require("express-rate-limit");
const tooManyMsg = {
  code: 429,
  status: "TOO_MANY_REQUEST",
  message: "Too Many Requests.",
};
let configure = {
  windowMs: (_beech_.defineConfig.server.rateLimit) ? _beech_.defineConfig.server.rateLimit.windowMs : 0,
  standardHeaders: (_beech_.defineConfig.server.rateLimit) ? (_beech_.defineConfig.server.rateLimit.standardHeaders || "draft-7") : "draft-7",
  legacyHeaders: (_beech_.defineConfig.server.rateLimit) ? (_beech_.defineConfig.server.rateLimit.legacyHeaders || false) : false,
  message: (_beech_.defineConfig.server.rateLimit) ? (_beech_.defineConfig.server.rateLimit.message || tooManyMsg) : tooManyMsg,
};
configure = {
  ..._beech_.defineConfig.server.rateLimit, // Override default configure with user configure.
  ...configure,
  keyGenerator: (req) => `${req.ip}:${req.params.hash}${req.params['0']}`,
};
const Limiter = (more_configure = {}) => {
  const middleware = rateLimit({
    ...configure,
    ...more_configure,
  });
  return (req, res, next) => {
    middleware(req, res, next);
  };
};

module.exports = { Limiter, rateLimit };
