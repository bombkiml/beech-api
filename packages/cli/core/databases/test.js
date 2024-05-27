const logUpdate = require("log-update");
const emoji = require('node-emoji')
const { DeHashIt, M, X } = require(__dirname + "/../helpers/math");
const Sequelize = require('sequelize');
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

function testConnectInProcess (database_config, dbConnTotal, cb) {
  try {
    let val = database_config.shift();
    if (val) {
      initSequelize(val, async (err, sq) => {
        if (err) {
          console.error("[101m Failed [0m Can't connect to connection name:[36m", val.name, "[0m\n", err);
          cb(err, null, null);
        }
        // Test connection
        await sq.authenticate()
          .then(() => {
            // Database some is true perfectly.
            if (database_config.length == 0) {
              if (sq) {
                testSql[ val.name ] = sq;
                //console.log("DB true, Perfectly.", val.name);
                cb(null, true, testSql);
              }
            } else {
              testSql[ val.name ] = sq;
              testConnectInProcess(database_config, dbConnTotal, cb);
            }
          })
          .catch(err => {
            console.error("[101m Failed [0m Unable to connect to the database:[36m", val.name, "[0m\n", err);
            cb(err, null, null);
          });
      });
    } else if (!dbConnTotal) {
      // All Database is falsly perfectly.
      //console.log("DB all false, Perfectly.");
      cb(null, true, testSql);
    }
  } catch (error) {
    cb(error, null, null);
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

function initSequelize(val, cb) {
  try {
    const promise = new Promise((resolve) => {
      // check hash ?
      if(val.username && val.password) {
        if(val.username.length < 55 || val.password < 55) {
          return cb("[91mERROR:[0m No Hash access for connect to database.\n", null);
        }
        let accessDb = [];
        [val.username, val.password].map((e, k) => {
          DeHashIt(e.toString(), null, (17).toString().slice(0,-1).length, (err, d) => {
            if(!err) {
              accessDb.push(d.split("sh,")[1].split(M(X).toString().slice(0,2)+M(X).toString())[0].slice(0,-1));
            }
          });
          if(k+1==2) {
            resolve(accessDb);
          }
        });
      } else {
        resolve([null, null]);
      }
    });
    Promise.all([promise]).then(final => {
      // stdout pre-flight connection
      logit(`- [91m[${val.dialect}] [0m[36m${val.name}[0m`);
      logit(emoji.get('heavy_multiplication_x') + `  [91m[${val.dialect}] [0m[36m${val.name}[0m`);
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
      logit(emoji.get('heavy_check_mark') + `  [91m[${val.dialect}] [0m[36m${val.name}[0m`, true);
      cb(false, sq);
    }).catch(err => {
      console.log(`[103m[90m Warning [0m[0m Connection name \`[93m${val.name}[0m\``, err);
    });
  } catch (error) {
    cb(error, null);
  }
}

module.exports = { filterDbIsTrue, testConnectInProcess, disConnectTestDB }