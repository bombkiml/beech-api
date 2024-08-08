const { rateLimit } = require("../../cli/core/middleware/express/rateLimit");
const { slowDown } = require("../../cli/core/middleware/express/slowDown");
let specificExpress = () => {
  return { rateLimit, slowDown };
};
module.exports = { specificExpress };
