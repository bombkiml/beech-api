const _beech_ = require(appRoot + "/beech.config.js");
const { duplicateRequest } = require("express-duplicate-request");
const nextDuplicater = (req, res, next) => {
  next();
};
let configure = {
  expiration: _beech_.defineConfig.server.duplicateRequest ? _beech_.defineConfig.server.duplicateRequest.expiration : 0,
};
configure = { ...configure, ..._beech_.defineConfig.server.duplicateRequest };
const Duplicater = configure.expiration ? duplicateRequest(configure) : nextDuplicater;

module.exports = { Duplicater, duplicateRequest };
