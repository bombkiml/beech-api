module.exports.init = () => {
  // pool base config
  global.pool_base = "sequelize"; // one of "basic" | "sequelize"

  // example declare global varables library, config and anything
  global.app_secret = require("./app.config.js").main_config.app_secret;
  
  // anything config for up to you ...
}