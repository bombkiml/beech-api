module.exports = {
  init() {
    // example declare global library
    global.root = require("app-root-path");
    global.main_config = requrie('./package.json').main_config;
  }
};