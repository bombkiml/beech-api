module.exports.init = () => {
  // Pool base config
  global.pool_base = "basic"; // one of "basic" | "sequelize"

  // Example declare global varables library, config and anything
  global.app_secret = require("./app.config.js").main_config.app_secret;
  
  // Anything global config for you ...
}