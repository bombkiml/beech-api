const _beech_ = require(appRoot + "/beech.config.js");
const { slowDown } = require("express-duplicate-request");
const nextSlower = (req, res, next) => {
  next();
};
let configure = {
  expiration: _beech_.defineConfig.server.slowDown ? _beech_.defineConfig.server.slowDown.expiration : 0,
};
configure = { ...configure, ..._beech_.defineConfig.server.slowDown };
const Slower = configure.expiration ? slowDown(configure) : nextSlower;

module.exports = { Slower, slowDown };
