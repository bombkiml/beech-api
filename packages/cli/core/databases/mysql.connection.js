exports.mySqlConnection = () => {
  return new Promise((resolve, reject) => {
    try {
      global.mysql = {};
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
              mysql[val.name] = connection;
              console.log('[102m[90m Passed [0m[0m `' + val.name + '` is connected : [[93m' + connection.config.database + ':' + connection.config.port + '[0m]');
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