const fs = require("fs");
const packages = require("./node_modules/beech-api/package.json");

module.exports = {
  setupFilesAfterEnv: [(fs.existsSync(packages.jest.prdFile)) ? packages.jest.prdFile : packages.jest.devFile],
  verbose: true
};