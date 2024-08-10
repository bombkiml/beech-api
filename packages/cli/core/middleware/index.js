const { whitelist, sign } = require("./origin/whitelist/cors");
const { Limiter } = require("./express/rateLimit");
const { Slower } = require("./express/slowDown");

module.exports = { whitelist, sign, Limiter, Slower };
