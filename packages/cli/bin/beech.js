#!/usr/bin/env node
const logUpdate = require("log-update");

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
          if (this.argument) {
            let tmpPackageFile = __dirname + '/../core/generator/package';
            let pastePackageFile = this.argument + '/package.json';
            let tmpConfigFile = __dirname + '/../core/configure/app.config.js';
            let pasteConfigFile = this.argument + '/app.config.js';
            let tmpJestFile = __dirname + '/../core/configure/jest.config.js';
            let pasteJestFile = this.argument + '/jest.config.js';
            let tmpJsConfigFile = __dirname + '/../core/configure/jsconfig.json';
            let pasteJsConfigFile = this.argument + '/jsconfig.json';
            let tmpDotSequelizercFile = __dirname + '/../core/configure/sequelizerc';
            let pasteDotSequelizercFile = this.argument + '/.sequelizerc';
            let tmpGloablConfigFile = __dirname + '/../core/configure/global.config.js';
            let pasteGloablConfigFile = this.argument + '/global.config.js';
            let tmpGitignoreFile = __dirname + '/../core/configure/gitignore';
            let pasteGitignoreFile = this.argument + '/.gitignore';
            if (!this.fs.existsSync(this.argument)) {
              this.makeFolder(this.argument)
                .then(this.copy.bind(this, tmpPackageFile, pastePackageFile))
                .then(this.contentReplace.bind(this, pastePackageFile, { 'application': this.argument }))
                .then(this.copy.bind(this, tmpConfigFile, pasteConfigFile))
                .then(this.copy.bind(this, tmpJestFile, pasteJestFile))
                .then(this.copy.bind(this, tmpJsConfigFile, pasteJsConfigFile))
                .then(this.copy.bind(this, tmpDotSequelizercFile, pasteDotSequelizercFile))
                .then(this.copy.bind(this, tmpGloablConfigFile, pasteGloablConfigFile))
                .then(this.copy.bind(this, tmpGitignoreFile, pasteGitignoreFile))
                .then(this.generateKeyConfigFile.bind(this, this.argument))
                .then(this.installPackage.bind(this, this.argument))
                .then(logUpdate("\n[104m [37mProcessing[0m [0m The `" + this.argument + "` application is creating...\n"))
                .catch((err) => {
                  throw err;
                })
            } else {
              resolve("\n[103m[90m Warning [0m[0m The project `" + this.argument + "` it's duplicated.");
            }
          } else {
            resolve("\n[103m[90m Warning [0m[0m Please specify your project name.");
          }
        } else {
          resolve("\n[101m Faltal [0m commnad it's not available.");
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  installPackage(argument) {
    return new Promise((resolve, reject) => {
      try {
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
          if (lineStdout[lineStdout.length - 1] == '\n') {
            logUpdate('\n' + lineStdout);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  successfully() {
    logUpdate('\n[102m[90m Passed [0m[0m The project has been successfully created.\n\n  [37m$[0m [36mcd ' + this.argument + '[0m\n  [37m$[0m [36mnpm start[0m or [36myarn start[0m');
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
        let mkdirp = require('mkdirp');
        mkdirp(path, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(path);
          }
        })
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
        let secret = require(__dirname + "/../../lib/salt").salt;
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
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
            let oldSecret = buf2eval.main_config.app_secret;
            // generate new key secret
            this.appKeyGenerator(8).then(newAppSecret => {
              // content replace
              let text = data.replace(new RegExp(oldSecret, 'g'), newAppSecret);
              // writing the file
              this.fs.writeFile(pjName + "/app.config.js", text, 'utf8', (err) => {
                if (err) {
                  throw err;
                } else {
                  resolve("\n[102m[90m Passed [0m[0m App secret it's new generated.");
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
        this.fs.readFile(__dirname + "/../core/generator/create", "utf8", (err, data) => {
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
        this.option = argv[2];
        this.argument = argv[3];
        this.special = argv[4];
        this.extra = argv[5];
        resolve(this);
      } catch (error) {
        reject(error);
      }
    });
  }
}

new Beech();