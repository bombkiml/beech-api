#!/usr/bin/env node
const logUpdate = require("log-update");
const notifier = require("node-notifier");
const path = require("path");
const clear = require("cli-clear");
const express = require("express");
const Sequelize = require('sequelize');
const _app_ = express();
let testSql = {};

class Beech {
  constructor() {
    this.embed(process.argv)
      .then(() => this.init()
        .then(status => console.log(status))
        .catch(err => {
          throw err;
        })
      );
  }

  init() {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.option == "serve") {
          let turnNoti = true;
          if (this.argument == "--silent" || this.argument == "-S") {
            turnNoti = false;
          }
          // check project config file exists ?
          if (this.fs.existsSync(this.configFile)) {
            let testServ = require("http").createServer(_app_);
            testServ.listen(this._config_.main_config.app_port, async () => {
              await testServ.close();
              // Start real service.
              await this.getStart(turnNoti, this.argument, (err, res) => {
                if (err) {
                  reject("\n[101m Faltal [0m start service catch.");
                  return;
                }
                // show info
                //console.log(res);
                console.clear();
              });
            }).on('error', (err) => {
              console.log("\n[101m Faltal [0m", err);
            })
          } else {
            resolve("\n[101m Faltal [0m The app.conifg.js file is not found.");
          }
        } else if (!this.option || this.option == "-h" || this.option == "?" || this.option == "--help") {
          // help for see avaliable command
          this.help()
            .then(help => resolve(help))
            .catch(err => reject(err));
        } else if (this.option == "build") {
          resolve("\n[101m Notic. [0m The commnad it's not supported, Please wait for next version.");
        } else {
          // help for see avaliable command
          this.help()
            .then(help => resolve(help))
            .catch(err => reject(err));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  filterDbIsTrue(dbConfig, cb) {
    try {
      let dbIsTrue = [];
      dbConfig.filter((e, k) => {
        if (e.is_connect) {
          dbIsTrue.push(e);
        }
        if (dbConfig.length == k + 1) {
          cb(null, dbIsTrue);
        }
      });
    } catch (error) {
      cb(error, null);
    }
  }

  initSequelize(val, cb) {
    try {
      const { DeHashIt, M, X } = require(__dirname + "/../core/helpers/math");
      //let app_key = "";
      const promise = new Promise((resolve) => {
        // check hash ?
        if(val.username.length < 10 || val.password < 10) {
          return cb("Error: No Hash access for connect to database.\n", null);
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
      });
      Promise.all([promise]).then(final => {
        const sq = new Sequelize({
          dialect: val.dialect || "mysql",
          host: val.host,
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
        cb(false, sq);
      });
    } catch (error) {
      cb(error, null);
    }
  }

  testConnectInProcess = (database_config, dbConnTotal, cb) => {
    try {
      let val = database_config.shift();
      if (val) {
        this.initSequelize(val, async (err, sq) => {
          if (err) {
            console.error("[101m Failed [0m Can't to create a Sequelize instance:[36m", val.name, "[0m\n", err);
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
                this.testConnectInProcess(database_config, dbConnTotal, cb);
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

  getStart(turnNoti, argument, cb) {
    try {
      clear();
      logUpdate("[36mCompiling...[0m");
      // filter for check dabatase only true
      this.filterDbIsTrue(this._config_.database_config, (err, dbConnectIsTrueOnly) => {
        if (err) {
          logUpdate("Config file crash.", err);
          return;
        }
        // leave data to disconnect database
        let leaveDataForDisconnect = dbConnectIsTrueOnly.slice(0);
        // check db connect truthy length ?
        if (dbConnectIsTrueOnly.length > 0) {
          // Test connect process
          this.testConnectInProcess(dbConnectIsTrueOnly, dbConnectIsTrueOnly.length, (err, result, dbs) => {
            if (err) {
              logUpdate("[101m Failed [0m Database connect failed.", err);
              return;
            }
            if (result) {
              // Disconnect database
              this.disConnectTestDB(leaveDataForDisconnect, dbs, (err, disResult) => {
                if (err) {
                  logUpdate("[101m Failed [0m Testing Database connect failed.", err);
                  return;
                }
                if (disResult) {
                  // Start service
                  this.serviceDevStart(argument);
                  // check turn on nofi
                  if (turnNoti) {
                    this.notiCompile();
                  }
                } else {
                  cb(err, null);
                }
              });
            }
          });
        } else {
          this.serviceDevStart(argument);
        }
      });
    } catch (error) {
      cb(error, null);
    }
  }

  serviceDevStart(argument) {
    let firstCount = 0;
    // check Dev. run service
    let command = this.cmd.get(`npx which`); // run which
    if(argument == "-D" || argument == "--dev") {
      //command = this.cmd.get(`npx run ./cli/beech`); // For Dev.
      command = this.cmd.get(`npx nodemon -q ./cli/beech`); // For Dev.
    } else {
      command = this.cmd.get(`npx nodemon -q ./node_modules/beech-api/packages/cli/beech`); // For Prd.
    }
    // delay for start service
    setTimeout(() => {
      command.stdout.on('data', (data) => {
        firstCount++;
        let leaveData = data.slice(0);
        if (firstCount == 1) {
          clear();
        }
        // shout out
        if (data.trim().slice(-1) == ":") {
          console.log("\n", leaveData.trim());
        } else {
          let serviceShoutOut = leaveData.trim().split('- ');
          //console.log(serviceShoutOut.length);
          if (serviceShoutOut.length == 3 || serviceShoutOut.length == 4) {
            let localShoutOutTxt = serviceShoutOut[ 1 ].trim().split(':')[ 0 ];
            let networkShoutOutTxt = serviceShoutOut[ 2 ].trim().split(':')[ 0 ];
            if (localShoutOutTxt.length == 14 && networkShoutOutTxt.length == 16) { // 14 local, 16 network
              console.log("  -", serviceShoutOut[ 1 ].trim());
              console.log("  -", serviceShoutOut[ 2 ].trim());
            }
            if (serviceShoutOut.length == 4) {
              console.log("  -", serviceShoutOut[ 3 ].trim());
            }
          } else {
            console.log(" ", leaveData.trim());
          }
        }
      });
    }, 200);
  }

  notiCompile() {
    notifier.notify({
      title: 'Beech API',
      subtitle: 'Beech service getting started.',
      message: "Service getting started.",
      sound: 'Funk',
      wait: false,
      icon: path.join(__dirname, "/../../public/icon/beech_128.png"),
      contentImage: path.join(__dirname, "../../public/icon/beech_128.png"),
    });
  }

  disConnectTestDB(dbConfigTruthy, dbs, cb) {
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

  help() {
    return new Promise((resolve, reject) => {
      try {
        this.fs.readFile(__dirname + "/../core/generator/_help_service", "utf8", (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  embed(argv) {
    return new Promise((resolve, reject) => {
      try {
        this.fs = require("fs");
        this.cmd = require("node-cmd");
        this.argv = argv;
        this.option = argv[ 2 ]; // serve|build
        this.argument = argv[ 3 ]; // --silent -S | --dev -D
        this.configFile = path.resolve("./app.config.js");
        this._config_ = require(this.configFile);
        resolve(this);
      } catch (error) {
        reject(error);
      }
    });
  }
}

new Beech();