const Sequelize = require('sequelize');
const { DeHashIt, M, X } = require(__dirname + "/../helpers/math");
global.sql = {};

exports.connect = () => {
  return new Promise((resolve, reject) => {
    try {
      connectInProcess(_config_.database_config, true, (err, result) => {
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

connectInProcess = async (database_config, headDbShow, cb) => {
  try {
    let val = database_config.shift();
    // checking turn on db connect
    if (val.is_connect) {
      const promise = new Promise((resolve) => {
        // check hash ?
        if(val.username.length < 10 || val.password < 10) {
          return cb("Error: No Hash access for connect to database.\n", null);
        }
        let accessDb = [];
        [val.username, val.password].map((e, k) => {
          DeHashIt(e.toString(), null, (17).toString().slice(0,-1).length, (d) => {
            accessDb.push(d.split("sh,")[1].split(M(X).toString().slice(0,2)+M(X).toString())[0].slice(0,-1));
          });
          if(k+1==2) {
            resolve(accessDb);
          }
        });
      });
      Promise.all([promise]).then(async (final) => {
        const sq = await new Sequelize({
          // one of 'mysql' | 'sqlite' | 'mariadb' | 'postgres' | 'mssql'
          dialect: val.dialect || "mysql",
  
          // for postgres, you can also specify an absolute path to a directory
          // containing a UNIX socket to connect over
          // host: '/sockets/psql_sockets'.
          host: val.host,
          username: final[0][0],
          password: final[0][1],
          database: val.database,
          port: val.port,
  
          // the storage engine for sqlite
          // - default ':memory:'
          storage: val.storage || ":memory:",
  
          // custom protocol; default: 'tcp'
          // postgres only, useful for Heroku
          protocol: val.protocol || null,
          // disable logging or provide a custom logging function; default: console.log
          logging: val.logging || false,
  
          // you can also pass any dialect options to the underlying dialect library
          // - default is empty
          // - currently supported: 'mysql', 'postgres', 'mssql'
          dialectOptions: {
            socketPath: ((val.dialectOptions) ? ((val.dialectOptions.socketPath) ? val.dialectOptions.socketPath : "") : ""), //Applications/MAMP/tmp/mysql/mysql.sock
            supportBigNumbers: ((val.dialectOptions) ? ((val.dialectOptions.supportBigNumbers) ? val.dialectOptions.supportBigNumbers : false) : false),
            bigNumberStrings: ((val.dialectOptions) ? ((val.dialectOptions.bigNumberStrings) ? val.dialectOptions.bigNumberStrings : false) : false),
            options: ((val.dialectOptions) ? ((val.dialectOptions.options) ? ({ encrypt: false, ...val.dialectOptions.options }) : { encrypt: false }) : { encrypt: false }),
          },
  
          // disable inserting undefined values as NULL
          // - default: false
          omitNull: val.omitNull || false,
  
          // a flag for using a native library or not.
          // in the case of 'pg' -- set this to true will allow SSL support
          // - default: false
          native: val.native || false,
  
          // Specify options, which are used when sequelize.define is called.
          // The following example:
          //   define: { timestamps: false }
          // is basically the same as:
          //   Model.init(attributes, { timestamps: false });
          //   sequelize.define(name, attributes, { timestamps: false });
          // so defining the timestamps for each model will be not necessary
          define: {
            underscored: ((val.define) ? ((val.define.underscored) ? val.define.underscored : false) : false),
            freezeTableName: ((val.define) ? ((val.define.freezeTableName === false) ? val.define.freezeTableName : true) : true),
            charset: ((val.define) ? ((val.define.charset) ? val.define.charset : "utf8") : "utf8"),
            dialectOptions: {
              collate: ((val.define) ? ((val.define.dialectOptions) ? ((val.define.dialectOptions.timestamps) ? val.define.dialectOptions.timestamps : "utf8_general_ci") : "utf8_general_ci") : "utf8_general_ci"),
            },
            timestamps: ((val.define) ? ((val.define.timestamps) ? val.define.timestamps : false) : false),
          },
  
          // similar for sync: you can define this to always force sync for models
          sync: {
            force: ((val.sync) ? ((val.sync.force) ? val.sync.force : false) : false),
          },
  
          // pool configuration used to pool database connections
          pool: {
            max: ((val.pool) ? ((val.pool.max) ? val.pool.max : 5) : 5),
            idle: ((val.pool) ? ((val.pool.idle) ? val.pool.idle : 30000) : 30000),
            acquire: ((val.pool) ? ((val.pool.acquire) ? val.pool.acquire : 60000) : 60000),
          },
  
          // isolation level of each transaction
          // defaults to dialect default
          isolationLevel: val.isolationLevel || "Transaction.ISOLATION_LEVELS.REPEATABLE_READ",
  
          // JSON response
          query: {
            raw: ((val.query) ? ((val.query.raw) ? val.query.raw : true) : true),
            nest: ((val.query) ? ((val.query.nest) ? val.query.nest : true) : true),
          }
        });
  
        // show only one text db connnections
        if (headDbShow) {
          console.log('\n[102m[90m Passed [0m [0mDatabase is connected at:');
          headDbShow = false;
        }
  
        // checking shout by dialect sql
        if (val.dialect == "sqlite") {
          // shout for sqlite
          console.log('- [91m[' + val.dialect + '] [0m[36m' + val.name + ' [0m->[93m ' + sq.options.storage + '[0m');
        } else {
          // shuout
          console.log('- [91m[' + val.dialect + '] [0m[36m' + val.name + ' [0m->[93m ' + sq.config.database + ':' + sq.config.port + '[0m');
        }
  
        // connection
        await sq.authenticate()
          .then(() => {
            // create database pool
            sql[ val.name ] = sq;
            // checking recursive database connection
            if (database_config.length > 0) {
              connectInProcess(database_config, headDbShow, e => {
                cb(e, true);
              });
            } else {
              // perfectly recursive
              cb(null, true);
            }
          })
          .catch(err => {
            console.error('Unable to connect to the database:', err);
          });
      });
    } else {
      if (database_config.length > 0) {
        connectInProcess(database_config, headDbShow, e => {
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