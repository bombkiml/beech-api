const appRoot = require("app-root-path");
const package = require(appRoot + '/package.json');
// Server start using by Express
exports.expressStart = () => {
  return new Promise((resolve, reject) => {
    try {
      // Create express server
      const ExpressServer = _app_.listen(_config_.main_config.app_port, () => {
        console.log('\n[102m[90m Passed [0m[0m Service is started at:\n - Local:   [36mhttp://' + _config_.main_config.app_host + ':' + ExpressServer.address().port, '[0m\n - Network: [36m' + _config_.main_config.client_host + '[0m\n');
        this.badRequest()
          .then(this.wrongRequest())
          .catch(err => {
            throw err;
          });
        resolve(ExpressServer);
      });
    } catch (error) {
      reject(error);
    }
  });
}
// Express server get variable
exports.getExpressServer = (serve) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(serve);
    } catch (error) {
      reject(error);
    }
  });
}
// Bad request
exports.badRequest = () => {
  return new Promise((resolve, reject) => {
    try {
      _app_.get('/', (req, res) => {
        let data = {};
        data.code = 200;
        data.message = `Welcome to ${package.name} (version ${package.version})`;
        res.json(data);
        resolve(data);
      });
    } catch (error) {
      reject(error);
    }
  });
}
// Default route if request went wrong
exports.wrongRequest = () => {
  return new Promise((resolve, reject) => {
    try {
      _app_.use((req, res, next) => {
        res.status(404).send({ code: 404, message: '404 Not found, cannot request to ' + req.url });
        resolve(404);
        next();
      });
    } catch (error) {
      reject(error);
    }
  });
}
