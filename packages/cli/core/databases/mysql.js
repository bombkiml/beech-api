const mysql = require("mysql");
global.sql = {};

exports.connect = () => {
  return new Promise((resolve, reject) => {
    try {
      mysqlInProcess(_config_.database_config, true, (err, result) => {
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

mysqlInProcess = (database_config, headDbShow, cb) => {
  try {
    let val = database_config.shift();
    // checking turn on db connect
    if (val.is_connect) {
      // db connection config
      let connection = mysql.createConnection({
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
          sql[ val.name ] = connection;
          console.log(' - [36m ' + val.name + ' [0m->[93m ' + connection.config.database + ':' + connection.config.port + '[0m');
          // checking recursive database connection
          if (database_config.length > 0) {
            mysqlInProcess(database_config, headDbShow, e => {
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
    } else {
      if (database_config.length > 0) {
        mysqlInProcess(database_config, headDbShow, e => {
          cb(e, true);
        });
      } else {
        // perfectly recursive
        cb(null, true);
      }
    }
  } catch (error) {
    cb(error, null);
  }
}