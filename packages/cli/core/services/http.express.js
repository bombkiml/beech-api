// Server start using by Express
exports.expressStart = () => {
  return new Promise((resolve, reject) => {
    try {
      // Create express server
      const ExpressServer = express.listen(_config.main_config.app_port, () => {
        console.log('\n[102m[90m Passed [0m[0m Service is started at:\n - Local:   [36mhttp://' + _config.main_config.app_host + ':' + ExpressServer.address().port, '[0m\n - Network: [36m' + _config.main_config.client_host + '[0m\n');
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
      express.get('/', (req, res) => {
        let data = {};
        data.code = 200;
        data.message = 'Got it.';
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
      express.use((req, res, next) => {
        res.status(404).send({ code: 404, message: 'Cannot request to ' + req.url });
        resolve(404);
        next();
      });
    } catch (error) {
      reject(error);
    }
  });
}
