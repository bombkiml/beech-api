const logUpdate = require("log-update");
const emoji = require('node-emoji')
const { DeHashIt, M, X } = require(__dirname + "/../helpers/math");
const Sequelize = require('sequelize');
const fs = require("fs");
let testSql = {};

function filterDbIsTrue(dbConfig, cb) {
  try {
    let dbIsTrue = [];
    dbConfig.filter((e, k) => {
      if (e.is_connect) {
        dbIsTrue.push(e);
      }
      if (dbConfig.length == k + 1) {
        if(dbIsTrue.length) {
          console.log('\n[102m[90m Pre-Flight [0m [0mTesting Database connection:');
        }
        setTimeout(() => {
          cb(null, dbIsTrue);
        }, 300);
      }
    });
  } catch (error) {
    cb(error, null);
  }
}

function testConnectInProcess(database_config, dbConnTotal, cb) {
  try {
    // Recursive test connection
    let val = database_config.shift();
    if (val) {
      initSequelize(val, true, async (err, sq) => {
        if (err) {
          //console.error("[101m Failed [0m Can't connect to connection name:[36m", val.name, "[0m\n", err);
          return cb(err, null, null);
        }
        // Test connection
        await sq.authenticate()
          .then(() => {
            // Database some is true perfectly.
            if (database_config.length == 0) {
              if (sq) {
                testSql[ val.name ] = sq;
                //console.log("DB true, Perfectly.", val.name);
                return cb(null, true, testSql);
              }
            } else {
              testSql[ val.name ] = sq;
              testConnectInProcess(database_config, dbConnTotal, cb);
            }
          })
          .catch(err => {
            console.error("[101m Failed [0m Unable to connect to the database:[36m", val.name, "[0m\n", err);
            return cb(err, null, null);
          });
      });
    } else if (!dbConnTotal) {
      // All Database is falsly perfectly.
      //console.log("DB all false, Perfectly.");
      return cb(null, true, testSql);
    }
  } catch (error) {
    return cb(error, null, null);
  }
}

function disConnectTestDB(dbConfigTruthy, dbs, cb) {
  try {
    dbConfigTruthy.map((e, k) => {
      // Closing database
      if (dbs[ e.name ].close()) {
        if (dbConfigTruthy.length == k + 1) {
          cb(null, dbConfigTruthy);
        }
      } else {
        cb(`Close database failed, ${e.name}`, null);
      }
    });
  } catch (error) {
    cb(error, null);
  }
}

function logit(msg, next = false) {
  logUpdate(msg);
  if(next) {
    logUpdate.done();
  }
}

function initSequelize(val, testConn = true, cb) {
  try {
    const promise = new Promise((resolve) => {
      // check hash ?
      if(val.username && val.password) {
        if(val.username.length < 55 || val.password < 55) {
          return cb("[91mERR:[0m Incorrect Hash access for connect to database, Please Hashing your access by command `beech hash:<your_access>`\n", null);
        }
        let accessDb = [];
        [val.username, val.password].map(async (e, k) => {
          await DeHashIt(e.toString(), null, (17).toString().slice(0,-1).length, async (err, d) => {
            if(err) {
              cb("[91mERR:[0m Hash access error,", err);
              throw err;
            }
            accessDb.push(d.split("sh,")[1].split(M(X).toString().slice(0,2)+M(X).toString())[0].slice(0,-1));
            // Finally username & password
            if(k+1==2) {
              // Last push dialect connection
              accessDb.push(val.dialect);
              // resolve it
              resolve(accessDb);
            }
          });
        });
      } else {
        resolve([null, null]);
      }
    });
    Promise.all([promise]).then(final => {
      /**
       * The final callback variable : [['hashed', 'hashed', 'dialect']]
       * 
       * final[0][0] : username hashed
       * final[0][1] : password hashed
       * final[0][2] : dialect
       * 
       */

      // Check test connection for stdout pre-flight
      if(testConn) {
        // stdout pre-flight connection
        logit(`- [91m[${val.dialect}] [0m[36m${val.name}[0m`);
        logit(emoji.get('heavy_multiplication_x') + `  [91m[${val.dialect}] [0m[36m${val.name}[0m`);
      }
      fs.readFile("./global.config.js", 'utf8', (err, data) => {
        if (err) {
          console.log("\n[101m Faltal [0m Can't read `global.config.js` file.\n", err);
          return; // break;
        } else {
          let buffer = Buffer.from(data);
          let buf2str = buffer.toString();
          let buf2json = JSON.parse(JSON.stringify(buf2str));
          let pool_base = /global.pool_base\s+=\s+(?:"|')([^"]+)(?:"|')(?:\r|\n|$|;|\r)/i.exec(buf2json);
          if (pool_base) {
            if(pool_base == "basic") {
              if(final[0][2] != "mysql") {
                return cb(`The Basic pool engine not support with: ${val.dialect}, Please use Sequelize engine.`, null);
              }
            }
          }
        }
      });
      // create connection
      const sq = new Sequelize({
        dialect: val.dialect || "mysql",
        host: (val.host == "localhost" || val.host == "http://localhost") ? "127.0.0.1" : val.host,
        username: final[0][0],
        password: final[0][1],
        database: val.database,
        port: val.port,
        storage: val.storage || ":memory:",
        protocol: val.protocol || null,
        logging: val.logging || false,
        dialectOptions: {
          socketPath: ((val.dialectOptions) ? ((val.dialectOptions.socketPath) ? val.dialectOptions.socketPath : "") : ""), //Applications/MAMP/tmp/mysql/mysql.sock
          supportBigNumbers: ((val.dialectOptions) ? ((val.dialectOptions.supportBigNumbers) ? val.dialectOptions.supportBigNumbers : false) : false),
          bigNumberStrings: ((val.dialectOptions) ? ((val.dialectOptions.bigNumberStrings) ? val.dialectOptions.bigNumberStrings : false) : false),
          options: ((val.dialectOptions) ? ((val.dialectOptions.options) ? ({ encrypt: false, ...val.dialectOptions.options }) : { encrypt: false }) : { encrypt: false }),
        },
        omitNull: val.omitNull || false,
        native: val.native || false,
        define: {
          underscored: ((val.define) ? ((val.define.underscored) ? val.define.underscored : false) : false),
          freezeTableName: ((val.define) ? ((val.define.freezeTableName === false) ? val.define.freezeTableName : true) : true),
          charset: ((val.define) ? ((val.define.charset) ? val.define.charset : "utf8") : "utf8"),
          dialectOptions: {
            collate: ((val.define) ? ((val.define.dialectOptions) ? ((val.define.dialectOptions.timestamps) ? val.define.dialectOptions.timestamps : "utf8_general_ci") : "utf8_general_ci") : "utf8_general_ci"),
          },
          timestamps: ((val.define) ? ((val.define.timestamps) ? val.define.timestamps : false) : false),
        },
        sync: {
          force: ((val.sync) ? ((val.sync.force) ? val.sync.force : false) : false),
        },
        pool: {
          max: ((val.pool) ? ((val.pool.max) ? val.pool.max : 5) : 5),
          idle: ((val.pool) ? ((val.pool.idle) ? val.pool.idle : 30000) : 30000),
          acquire: ((val.pool) ? ((val.pool.acquire) ? val.pool.acquire : 60000) : 60000),
        },
        isolationLevel: val.isolationLevel || "Transaction.ISOLATION_LEVELS.REPEATABLE_READ",
        query: {
          raw: ((val.query) ? ((val.query.raw) ? val.query.raw : true) : true),
          nest: ((val.query) ? ((val.query.nest) ? val.query.nest : true) : true),
        }
      });
      // Check test connection for stdout pre-flight (mark)
      if(testConn) {
        logit(emoji.get('heavy_check_mark') + `  [91m[${val.dialect}] [0m[36m${val.name}[0m`, true);
      }
      cb(false, sq);
    }).catch(err => {
      console.log(`[103m[90m Warning [0m[0m Connection name \`[93m${val.name}[0m\``, err);
    });
  } catch (error) {
    cb(error, null);
  }
}

function connectForGenerateModel(dbConnectName, tableName, databaseConfig, cb) {
  /**
   * Callback
   * 
   * err String : Error message
   * tableSchema Object : Schema of table
   * tableName String : table name
   * 
   */
  const connectionChoose = databaseConfig.filter((e) => e.name == dbConnectName)[0];
  initSequelize(connectionChoose, false, async (err, sq) => {
    if (err) {
      cb(err, null, null);
    }
    // Connection
    await sq.authenticate()
      .then(() => {
        getTableSchema(sq, tableName, (errSchema, tableSchema) => {
          if(errSchema) {
            cb(errSchema, null, null);
          } else {
            // Closing database
            sq.close();
            // Callback
            cb(null, tableSchema, tableName);
          }
        });
      })
      .catch(err => {
        cb(err, null, null);
      });
  });
}

async function getTableSchema(sq, tableName, cb) {
  try {
    const queryInterface = sq.getQueryInterface();
    const schema = await queryInterface.describeTable(tableName);
    cb(null, schema);
  } catch (error) {
    cb("Fetching table schema " + error, null);
  }
}

module.exports = { filterDbIsTrue, testConnectInProcess, disConnectTestDB, connectForGenerateModel }