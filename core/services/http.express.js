/**
 * Server start using by Express
 * 
 */
exports.expressStart = () => {
  return new Promise((resolve, reject) => {
    try {
      app.use((err, req, res, next) => {
        res.status(err.status || 500);
        var data = {};
        data.code = 500;
        data.message = err.message;
        res.json(data);
      });
      const ExpressServer = app.listen(_config.main_config.app_port, () => {
        console.log('[102m[90m Passed [0m[0m Express server started : http://' + _config.main_config.app_host + ':' + ExpressServer.address().port);
        resolve(ExpressServer)
      });
    } catch (error) {
      reject(error)
    }
  });
}

/**
 * Express server get variable
 * 
 */
exports.getExpressServer = (serve) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(serve)
    } catch (error) {
      reject(error)
    }
  });
}

/**
 * Server stop using by Express
 * 
 */
exports.expressStop = () => {
  return new Promise((resolve, reject) => {
    try {
      _SERVER.close()
      //serve.close()
    } catch (error) {
      reject(error)
    }
  });
}
