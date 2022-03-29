exports.mySqlConnection = () => {
  return new Promise((resolve, reject) => {
    try {
      global.mysql = {};
      var headDbShow = true;
      // loop database connection
      _config_.mysql_config.map((val, index) => {
        if (val.is_connect) {
          // show only one text db connnections
          if (headDbShow) {
            console.log('\n[102m[90m Passed [0m [0mDatabase is connected at:');
            headDbShow = false;
          }
          // db connection config
          let connection = _mysql_.createConnection({
            host: val.host,
            user: val.username,
            password: val.password,
            database: val.database,
            charset: val.charset,
            port: val.port
          })
          // db connecting
          connection.connect((err) => {
            if (!err) {
              mysql[val.name] = connection;
              console.log(' - [36m' + val.name, '[0m->[93m', connection.config.database + ':' + connection.config.port + '[0m');
              // checking for resolve
              if ((index + 1) == _config_.mysql_config.length) {
                resolve(true);
              }
            } else {
              console.log('[101m Failed [0m [91mDatabase `' + val.name + '` is connect failed.[0m');
              throw err;
            }
          })
        } else {
          // checking for resolve
          if ((index + 1) == _config_.mysql_config.length) {
            resolve(true);
          }
        }
      });
    } catch (error) {
      reject(error);
    }
  })
}