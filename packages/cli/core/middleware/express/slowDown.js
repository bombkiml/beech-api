const _beech_ = require(appRoot + "/beech.config.js");
const { slowDown } = require("express-duplicate-request");

let configure = {
  expiration: _beech_.defineConfig.server.slowDown ? _beech_.defineConfig.server.slowDown.expiration : 300,
};
configure = { ...configure, ..._beech_.defineConfig.server.slowDown };
const Slower = slowDown(configure);

module.exports = { Slower, slowDown };
