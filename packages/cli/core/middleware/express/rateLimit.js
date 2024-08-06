const _beech_ = require(appRoot + "/beech.config.js");
const rateLimit = require("express-rate-limit");
const tooManyMsg = {
  code: 429,
  status: "TOO_MANY_REQUEST",
  message: "Too Many Requests.",
};
let configure = {
  windowMs: (_beech_.defineConfig.server.rateLimit) ? _beech_.defineConfig.server.rateLimit.windowMs : 0,
  limit: (_beech_.defineConfig.server.rateLimit) ? (_beech_.defineConfig.server.rateLimit.limit || 0) : 0,
  standardHeaders: (_beech_.defineConfig.server.rateLimit) ? (_beech_.defineConfig.server.rateLimit.standardHeaders || "draft-7") : "draft-7",
  legacyHeaders: (_beech_.defineConfig.server.rateLimit) ? (_beech_.defineConfig.server.rateLimit.legacyHeaders || false) : false,
  message: (_beech_.defineConfig.server.rateLimit) ? (_beech_.defineConfig.server.rateLimit.message || tooManyMsg) : tooManyMsg,
};
configure = { ...configure, ..._beech_.defineConfig.server.rateLimit };
const Limiter = rateLimit(configure);

module.exports = { Limiter };
