const _beech_ = require(appRoot + "/beech.config.js");
const { duplicateRequest } = require("express-duplicate-request");
const nextDuplicater = (req, res, next) => next();
const defaultConfigure = {
  expiration: _beech_.defineConfig.server.duplicateRequest ? _beech_.defineConfig.server.duplicateRequest.expiration : 0,
};
const baseConfigure = {
  ..._beech_.defineConfig.server.duplicateRequest, // Override default configure with user configure.
  ...defaultConfigure,
};
const Duplicater = (more_configure = {}) => {
  const config = { ...baseConfigure, ...more_configure };
  return config.expiration ? duplicateRequest(config) : nextDuplicater;
};

module.exports = { Duplicater, duplicateRequest };
