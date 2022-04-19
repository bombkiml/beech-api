exports.mySqlConnection = () => {
  return new Promise((resolve, reject) => {
    try {
      mysqlInProcess(_config_.mysql_config, true, (err, result) => {
        if (!err) {
          resolve(result);
        } else {
          reject(err);
        }
      });
    } catch (error) {
      reject(error);
    }
  })
}

mysqlInProcess = (mysql_config, headDbShow, cb) => {
  try {
    global.mysql = {};
    let val = mysql_config.shift();
    // checking turn on db connect
    if (val.is_connect) {
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
      connection.connect(err => {
        if (!err) {
          // show only one text db connnections
          if (headDbShow) {
            console.log('\n[102m[90m Passed [0m [0mDatabase is connected at:');
            headDbShow = false;
          }
          // declare to global mysql variable
          mysql[ val.name ] = connection;
          console.log(' - [36m ' + val.name + ' [0m->[93m ' + connection.config.database + ':' + connection.config.port + '[0m');
          // checking recursive database connection
          if (mysql_config.length > 0) {
            mysqlInProcess(mysql_config, headDbShow, e => {
              cb(e, true);
            });
          } else {
            // perfectly recursive
            cb(err, true);
          }
        } else {
          console.log('[101m Failed [0m [91mDatabase `' + val.name + '` is connect failed.[0m');
          cb(err, null);
        }
      });
    }
  } catch (error) {
    cb(error, null);
  }
}