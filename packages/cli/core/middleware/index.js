const { whitelist, sign } = require("./origin/whitelist/cors");
const { avg } = require("./origin/guard/advance");
const { Limiter } = require("./express/rateLimit");
const { Duplicater } = require("./express/duplicateRequest");

module.exports = { whitelist, sign, Limiter, Duplicater, avg };
