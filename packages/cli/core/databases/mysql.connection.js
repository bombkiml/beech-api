exports.mySqlConnection = () => {
  return new Promise((resolve, reject) => {
    try {
      global.mysql = {};
      // loop database connection
      _config.mySqlConfig.map((val, index) => {
        if (val.isConnect) {
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
              mysql[val.name] = connection;
              console.log('[102m[90m Passed [0m [0mDatabase is connected at [[93m' + val.name, '[0m->[93m', connection.config.database + ':' + connection.config.port + '[0m]');
              // checking for resolve
              if ((index + 1) == _config.mySqlConfig.length) {
                resolve(true);
              }
            } else {
              console.log('[101m Failed [0m [91mDatabase `' + val.name + '` is connect failed.[0m');
              throw err;
            }
          })
        } else {
          // checking for resolve
          if ((index + 1) == _config.mySqlConfig.length) {
            resolve(true);
          }
        }
      });
    } catch (error) {
      reject(error);
    }
  })
}