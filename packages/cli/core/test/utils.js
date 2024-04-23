process.env.NODE_ENV = "test";
process.setMaxListeners(0);
global.axios = require("axios");
const path = require("path");
const basePath = path.resolve();
const config = require(path.join(basePath, "app.config")).main_config;
global.baseUrl = "http://" + config.app_host.concat(":" + config.app_port);
