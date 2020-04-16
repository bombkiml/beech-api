module.exports = {
  init() {
    // example declare global varables library, config and anything
    global.__root = require("app-root-path");
    global.app_secret = require('./app.config.js').main_config.app_secret;
  }
}