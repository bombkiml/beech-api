/**
 * MySQL connection
 * 
 */
exports.mySqlConnection = () => {
  return new Promise((resolve, reject) => {
    try {
      // loop database connection
      _config.mySqlConfig.map(val => {
        if (!val.isConnect) {
          resolve(true);
          return;
        } else {
          let connection = _mysql.createConnection({
            host: val.host,
            user: val.username,
            password: val.password,
            database: val.database,
            charset: val.charset,
            port: val.port
          })
          connection.connect((err) => {
            if (!err) {
              connection.query("SET NAMES UTF8");
              val.name = connection;
              //console.log(val.name)
              console.log('[102m[90m Passed [0m[0m `' + connection.config.host + '` database is connected : [[93m' + connection.config.database + ':' + connection.config.port + '[0m]');
              resolve(connection);
            } else {
              console.log('[101m Failed [0m [91mDatabase `' + val.name + '` is connect failed.[0m');
              throw err;
            }
          })
        }
      });
    } catch (error) {
      reject(error);
    }
  })
}

/**
 * Second connection
 * 
 */
exports.secondConnection = () => {
  return new Promise((resolve, reject) => {
    try {
      // Check flag connecting
      if (!_config.secondSqlConfig.isConnect) {
        resolve(true);
        return;
      } else {
        let connection = _mysql.createConnection({
          host: _config.secondSqlConfig.host,
          user: _config.secondSqlConfig.username,
          password: _config.secondSqlConfig.password,
          database: _config.secondSqlConfig.database,
          charset: _config.secondSqlConfig.charset,
          port: _config.secondSqlConfig.port
        })
        connection.connect((err) => {
          if (!err) {
            connection.query("SET NAMES UTF8");
            db2 = connection;
            console.log('[102m[90m Passed [0m[0m Database `' + _config.secondSqlConfig.name + '` is connected : [[93m' + connection.config.database + ':' + connection.config.port + '[0m]');
            resolve(connection);
          } else {
            console.log('[101m Failed [0m [91mDatabase `' + _config.secondSqlConfig.name + '` is connect failed.[0m');
            throw err;
          }
        })
      }
    } catch (error) {
      reject(error);
    }
  })
}
