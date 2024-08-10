const { rateLimit } = require("../../cli/core/middleware/express/rateLimit");
const { rateDelay } = require("../../cli/core/middleware/express/rateDelay");
const { slowDown } = require("../../cli/core/middleware/express/slowDown");
let specificExpress = () => {
  return { rateLimit, rateDelay, slowDown };
};
module.exports = { specificExpress };
