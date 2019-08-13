// Server start using by Express
exports.expressStart = () => {
  return new Promise((resolve, reject) => {
    try {
      // Create express server
      const ExpressServer = app.listen(_config.main_config.app_port, () => {
        console.log('[102m[90m Passed [0m[0m Express server started : http://' + _config.main_config.app_host + ':' + ExpressServer.address().port);
        this.badRequest()
          .then(this.wrongRequest())
          .catch(err => {
            throw err
          })
        resolve(ExpressServer)
      });
    } catch (error) {
      reject(error)
    }
  });
}

// Express server get variable
exports.getExpressServer = (serve) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(serve)
    } catch (error) {
      reject(error)
    }
  });
}

/* // Server stop using by Express
exports.expressStop = () => {
  return new Promise((resolve, reject) => {
    try {
      _SERVER.close()
      //serve.close()

      // Killer service
      app.get('/killService', (req, res) => {
        let data = {}
        _SERVER.close()
        data.code = 200
        data.message = 'Kill successfully.'
        res.json(data)
      })


    } catch (error) {
      reject(error)
    }
  });
} */

// Bad request
exports.badRequest = () => {
  return new Promise((resolve, reject) => {
    try {
      app.get('/', (req, res) => {
        let data = {}
        data.code = 200
        data.message = 'Not get allow.'
        res.json(data)
        resolve(data)
      });
    } catch (error) {
      reject(error)
    }
  });
}

// Default route if request went wrong
exports.wrongRequest = () => {
  return new Promise((resolve, reject) => {
    try {
      app.use((req, res, next) => {
        res.status(404).send({ code: 404, message: req.url + ' not found.' });
        resolve(404)
        next()
      });
    } catch (error) {
      reject(error)
    }
  });
}
