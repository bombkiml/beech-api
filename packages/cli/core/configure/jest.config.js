const fs = require("fs");

module.exports = {
  verbose: true,
  setupFilesAfterEnv: [(fs.existsSync("./node_modules/beech-api/packages/cli/core/test/utils")) || "./core/test/utils"]
};