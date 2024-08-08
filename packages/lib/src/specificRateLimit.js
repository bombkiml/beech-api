const { rateLimit } = require("../../cli/core/middleware/express/rateLimit");
let ExpressRateLimit = () => {
  return { rateLimit };
};
module.exports = { ExpressRateLimit };
