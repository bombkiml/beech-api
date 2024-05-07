#!/usr/bin/env node
const logUpdate = require("log-update");
const clear = require("cli-clear");
const inquirer = require('inquirer');

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
    return new Promise((resolve, reject) => {
      try {
        if (this.option == "-v" || this.option == "--version") {
          // check beech version
          resolve("v" + require(__dirname + "/../../../package.json").version);
        } else if (this.option == "-h" || this.option == "?" || this.option == "--help") {
          // help for see avaliable command
          this.help()
            .then(help => resolve(help))
            .catch(err => reject(err));
        } else if (this.option == "create") {
          // declare temp file and paste file
          let tmpPackageFile = __dirname + '/../core/generator/_package';
          let pastePackageFile = this.argument + '/package.json';
          let tmpConfigFile = __dirname + '/../core/configure/app.config-basic.js';
          let pasteConfigFile = this.argument + '/app.config.js';
          let tmpJestFile = __dirname + '/../core/configure/jest.config.js';
          let pasteJestFile = this.argument + '/jest.config.js';
          let tmpJsConfigFile = __dirname + '/../core/configure/jsconfig.json';
          let pasteJsConfigFile = this.argument + '/jsconfig.json';
          let tmpDotSequelizercFile = __dirname + '/../core/configure/_sequelizerc';
          let pasteDotSequelizercFile = this.argument + '/.sequelizerc';
          let tmpGloablConfigFile = __dirname + '/../core/configure/global.config-basic.js';
          let pasteGloablConfigFile = this.argument + '/global.config.js';
          let tmpGitignoreFile = __dirname + '/../core/configure/_gitignore';
          let pasteGitignoreFile = this.argument + '/.gitignore';
          let tmpBeechConfigFile = __dirname + '/../core/configure/beech.config.js';
          let pasteBeechConfigFile = this.argument + '/beech.config.js';
          // start log clear screen
          clear();
          logUpdate("[94mBeech CLI v" + require(__dirname + "/../../../package.json").version);
          // check argument project name
          if (this.argument) {
            if (!this.fs.existsSync(this.argument)) {
              inquirer.prompt([ {
                type: "list",
                name: "sql",
                message: "[93mPlease pick a SQL structure base:[0m",
                choices: [ "Basic (mysql only)", "Sequelize (mysql, sqlite, mariadb, postgres, mssql)" ],
              } ]).then(async resSql => {
                if (resSql.sql.split(' ')[ 0 ] != "Basic") {
                  tmpGloablConfigFile = await __dirname + '/../core/configure/global.config-sequelize.js';
                  tmpConfigFile = await __dirname + '/../core/configure/app.config-sequelize.js';
                }
                inquirer.prompt([ {
                  type: "checkbox",
                  name: "freature",
                  message: "[93mCheck the features needed for your project:[0m",
                  choices: [ "Job Scheduler", "Basic Helper", "Passport / JWT / Official Strategy Google, Facebook" ],
                } ]).then(resFreat => {
                  logUpdate(": Initialize...");
                  setTimeout(() => {
                    // init project
                    this.makeFolder(this.argument)
                      .then(this.copy.bind(this, tmpPackageFile, pastePackageFile))
                      //.then(this.contentReplace.bind(this, pastePackageFile, { 'application': this.argument }))
                      .then(this.copy.bind(this, tmpConfigFile, pasteConfigFile))
                      .then(this.copy.bind(this, tmpJestFile, pasteJestFile))
                      .then(this.copy.bind(this, tmpJsConfigFile, pasteJsConfigFile))
                      .then(this.copy.bind(this, tmpDotSequelizercFile, pasteDotSequelizercFile))
                      .then(this.copy.bind(this, tmpGloablConfigFile, pasteGloablConfigFile))
                      .then(this.copy.bind(this, tmpGitignoreFile, pasteGitignoreFile))
                      .then(this.copy.bind(this, tmpBeechConfigFile, pasteBeechConfigFile))
                      .then(this.contentReplace.bind(this, pastePackageFile, { 'application': this.argument }))
                      .then(this.generateKeyConfigFile.bind(this, this.argument))
                      .then(this.installPackage.bind(this, this.argument, resFreat.freature))
                      .then(console.log("\n[104m [37mProcessing [0m [0m The Application `" + this.argument + "` is creating...\n"))
                      .catch((err) => {
                        throw err;
                      });
                  }, 2000);
                });
              });
            } else {
              resolve("\n[103m[90m Warning [0m[0m The project `" + this.argument + "` it's duplicated.");
            }
          } else {
            resolve("\n[103m[90m Warning [0m[0m Please specify your project name.");
          }
        } else if (this.option == "update") {
          // upgrade the beech-api package
          let isGlobalNpm = "npm install beech-api";
          let isGlobalYarn = "yarn add beech-api";
          let processUpdate = null;
          let lineStdout = "";
          if (this.argument == '-g' || this.argument == '--global') {
            isGlobalNpm = "npm update beech-api -g --force";
            isGlobalYarn = "yarn global add beech-api";
          }
          // prompt select
          inquirer.prompt([ {
            type: "list",
            name: "package",
            message: "[93mPlease pick a package control:[0m",
            choices: [ "NPM", "Yarn" ],
          } ]).then(selectedPackage => {
            logUpdate(": Initialize...");
            // delay for update package
            setTimeout(() => {
              if(selectedPackage.package == "NPM") {
                processUpdate = this.cmd.get(isGlobalNpm, (err) => {
                  if (err) { throw err }
                });
                // npm install line shoutout
                processUpdate.stdout.on('data', (npmData) => {
                  lineStdout += npmData;
                  if (lineStdout[ lineStdout.length - 1 ] == '\n') {
                    logUpdate('\n' + lineStdout);
                  }
                });
              } else if(selectedPackage.package == "Yarn") {
                processUpdate = this.cmd.get(isGlobalYarn, (err) => {
                  if (err) { throw err }
                });
                // yarn install line shoutout
                processUpdate.stdout.on('data', (yarnData) => {
                  lineStdout += yarnData;
                  if (lineStdout[ lineStdout.length - 1 ] == '\n') {
                    logUpdate('\n' + lineStdout);
                  }
                });
              } else {
                logUpdate("\n[101m Faltal [0m Catch update package. Try again...");
                return;
              }
            }, 1000);
          });
        } else {
          // help for see avaliable command
          this.help()
            .then(help => resolve(help))
            .catch(err => reject(err));
        }
      } catch (error) {
        throw error;
      }
    });
  }

  installPackage(argument, freatureArr) {
    return new Promise((resolve, reject) => {
      try {
        // install freature
        this.installFreature(argument, freatureArr)
          .then(res => {
            if (res) {
              let lineStdout = "";
              let processYarn = this.cmd.get('cd ' + argument + ' && yarn install', (err, data) => {
                if (err) {
                  this.cmd.get('cd ' + argument + ' && npm install', (err, data) => {
                    if (err) { throw err }
                    resolve(data);
                    this.successfully();
                  });
                } else {
                  resolve(data);
                  this.successfully();
                }
              });
              // yarn install line shoutout
              processYarn.stdout.on('data', (yarnData) => {
                lineStdout += yarnData;
                if (lineStdout[ lineStdout.length - 1 ] == '\n') {
                  logUpdate('\n' + lineStdout);
                }
              });
            } else {
              logUpdate("\n[101m Faltal [0m Can't install freature. Try again...");
            }
          })
          .catch(err => reject(err));
      } catch (error) {
        reject(error);
      }
    });
  }

  installFreature(argument, freatureArr) {
    return new Promise((resolve, reject) => {
      try {
        let helperPath = argument + '/src/helpers/';
        let tmpBasicHelperFile = __dirname + '/../core/generator/_helpers_basic';
        let pasteBasicHelperFile = helperPath + '/Basic.js';
        let freatureLength = freatureArr.length;
        if (freatureLength) {
          freatureArr.map((f, key) => {
            if (f.split(' ')[ 0 ] == "Job") {
              (process.env.NODE_ENV == "development") ? this.cmd.get('cd ' + argument + ' && node cli/bin/beech-app.js skd init') : this.cmd.get('cd ' + argument + ' && beech skd init');
              console.log("[" + (key + 1) + "/" + freatureLength + "] Installing Job Scheduler");
            }
            if (f.split(' ')[ 0 ] == "Basic") {
              this.makeFolder(helperPath).then(this.copy.bind(this, tmpBasicHelperFile, pasteBasicHelperFile))
              console.log("[" + (key + 1) + "/" + freatureLength + "] Installing Basic helper");
            }
            if (f.split(' ')[ 0 ] == "Passport") {
              (process.env.NODE_ENV == "development") ? this.cmd.get('cd ' + argument + ' && node cli/bin/beech-app.js passport init') : this.cmd.get('cd ' + argument + ' && beech passport init');
              console.log("[" + (key + 1) + "/" + freatureLength + "] Installing Passport JWT, Official strategy Google, Facebook");
            }
            if (freatureArr.length == (key + 1)) {
              resolve(true);
            }
          });
        } else {
          resolve(true);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  successfully() {
    clear();
    console.log("[94mBeech CLI v" + require(__dirname + "/../../../package.json").version);
    console.log('\n[102m[90m Passed [0m[0m The project has been successfully created.\n\n  [37m$[0m [36mcd ' + this.argument + '[0m\n  [37m$[0m [36mnpm start[0m or [36myarn start[0m');
  }

  async contentReplace(pathFile, textCondition) {
    return new Promise((resolve, reject) => {
      try {
        // delay for generator
        setTimeout(() => {
          this.fs.readFile(pathFile, 'utf8', (err, data) => {
            if (err) {
              reject(err);
            } else {
              let application = textCondition.application;
              // content replace
              let text = data.replace(new RegExp('application', 'g'), application);
              // writing the file
              this.fs.writeFile(pathFile, text, 'utf8', (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve("\n[102m[90m Passed [0m[0m The application `" + application + "` it's create successfully.");
                }
              })
            }
          })
        }, 1500);
      } catch (error) {
        reject(error);
      }
    });
  }

  async makeFolder(path) {
    /**
     * @param path path to make
     * 
     * @return new full path
     * 
     */
    return new Promise((resolve, reject) => {
      try {
        const mkdirp = require("mkdirp");
        mkdirp(path)
          .then(p => resolve(p))
          .catch(err => reject(err));
      } catch (error) {
        reject(error);
      }
    });
  }

  async copy(path, to) {
    /**
     * @param path old path file
     * @param to save to new path file
     *
     * @return new path file
     */
    return new Promise((resolve, reject) => {
      try {
        if (this.fs.createReadStream(path).pipe(this.fs.createWriteStream(to))) {
          resolve(to);
        } else {
          reject(err);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  appKeyGenerator(length) {
    return new Promise((resolve, reject) => {
      try {
        let md5 = require("md5");
        let secret = require(__dirname + "/../../lib/src/salt").salt;
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        resolve(md5(result + secret));
      } catch (error) {
        reject(error);
      }
    });
  }

  generateKeyConfigFile(pjName) {
    return new Promise((resolve, reject) => {
      try {
        this.fs.readFile(pjName + "/app.config.js", 'utf8', (err, data) => {
          if (err) {
            throw err;
          } else {
            // edit or add property
            let buffer = Buffer.from(data);
            let buf2str = buffer.toString();
            let buf2json = JSON.parse(JSON.stringify(buf2str));
            let buf2eval = eval(buf2json);
            let oldKey = buf2eval.main_config.app_key;
            // generate new key
            this.appKeyGenerator(8).then(newAppKey => {
              // content replace
              let text = data.replace(new RegExp(oldKey, 'g'), newAppKey);
              // writing the file
              this.fs.writeFile(pjName + "/app.config.js", text, 'utf8', (err) => {
                if (err) {
                  throw err;
                } else {
                  resolve("\n[102m[90m Passed [0m[0m App key it's new generated.");
                }
              });
            });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  help() {
    return new Promise((resolve, reject) => {
      try {
        this.fs.readFile(__dirname + "/../core/generator/_help_create", "utf8", (err, data) => {
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
        this.cmd = require('node-cmd');
        this.argv = argv;
        this.option = argv[ 2 ];
        this.argument = argv[ 3 ];
        this.special = argv[ 4 ];
        this.extra = argv[ 5 ];
        resolve(this);
      } catch (error) {
        reject(error);
      }
    });
  }
}

new Beech();