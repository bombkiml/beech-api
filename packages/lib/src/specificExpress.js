const { rateLimit } = require("../../cli/core/middleware/express/rateLimit");
const { slowDown } = require("../../cli/core/middleware/express/slowDown");
const { duplicateRequest } = require("../../cli/core/middleware/express/duplicateRequest");
let specificExpress = () => {
  return { rateLimit, slowDown, duplicateRequest };
};
module.exports = { specificExpress };
