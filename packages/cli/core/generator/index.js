#!/usr/bin/env node
const logUpdate = require("log-update");

class Generator {
  constructor() {
    this.embed(process.argv)
      .then(() => this.init()
        .then(status => console.log(status))
        .catch(err => {
          throw err;
        })
      )
  }

  init() {
    return new Promise((resolve, reject) => {
      try {
        if (this.option == '-v' || this.option == '--version') {
          // check beech version
          resolve("v" + require(__dirname + "/../../../../package.json").version);
        } else if (this.option == '-h' || this.option == '?' || this.option == '--help') {
          // help for see avaliable command
          this.help()
            .then(help => resolve(help))
            .catch(err => reject(err));
        } else if (this.option == 'make') {
          // generate endpoint
          if (!this.argument) {
            resolve("\n[103m[90m Warning [0m[0m Please specify endpoints name.");
          } else {
            if (!this.special || this.special == 'undefined') {
              this.make()
                .then(make => resolve(make))
                .catch(err => reject(err));
            } else if (this.special.length > 10) {
              if (this.special.substring(0, 10) == '--require=') {
                // check space
                if (this.extra) {
                  resolve("\n[103m[90m Warning [0m[0m Please remove a space(s) in special text `" + this.special + "[101m [0m" + this.extra + "...`");
                  return;
                }
                let myRequire = this.special.substring(10);
                myRequire = myRequire.split(',');
                // check require model exists
                this.isModelFound(myRequire)
                  .then(notExistsModel => {
                    if (notExistsModel == true) {
                      // generate & require
                      if (!this.special) {
                        resolve("\n[103m[90m Warning [0m[0m Please specify require file(s).");
                      } else {
                        // declare require model file
                        let rqr = myRequire.map(data => {
                          let modelName = data.split('/');
                          modelName = modelName.pop();
                          modelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
                          return `const ${modelName} = require(\"@/models/${data.substring(0, data.lastIndexOf('/') + 1) + modelName}\");\n`;
                        });
                        // make with require model file
                        this.make(rqr)
                          .then(make => resolve(make))
                          .catch(err => reject(err));
                      }
                    } else {
                      resolve("\n[103m[90m Warning [0m[0m The model `" + notExistsModel + "` it's not found.");
                      return;
                    }
                  })
                  .catch(err => { throw err });
              } else {
                resolve("\n[101m Faltal [0m commnad it's not available.");
              }
            } else if (this.special == '--model') {
              this.makeModel()
                .then(make => resolve(make))
                .catch(err => reject(err));
            } else {
              resolve("\n[101m Faltal [0m commnad it's not available.");
            }
          }
        } else if (this.option == 'passport') {
          if (this.argument == "init") {
            this.makePassportInit()
              .then(make => resolve(make))
              .catch(err => reject(err));
          } else {
            resolve("\n[103m[90m Warning [0m[0m Using `passport init` for initiate passport-jwt.");
          }
        } else if (this.option == "key:generate") {
          this.generateKeyConfigFile()
          .then(resGenKey => resolve(resGenKey))
          .catch(err => reject(err));;
        } else if (this.option == "add-on") {
          if (this.argument == "init") {
            this.makeAddOnInit()
              .then(make => resolve(make))
              .catch(err => reject(err));            
          } else {
            resolve("\n[103m[90m Warning [0m[0m Using `add-on init` for initiate add-on.");
          }          
        } else {
          resolve("\n[101m Faltal [0m commnad it's not available.");
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  make(rq = null) {
    return new Promise((resolve, reject) => {
      try {
        let tmpEndpointsPath = __dirname + '/endpoints';
        let tmpSpecPath = __dirname + '/spec';
        let endpointsPath = './src/endpoints/';
        let testPath = './__tests__/unit/endpoints/';
        // argument join `slash`
        let arg = this.argument.replace(/^\/+|\/+$/g, '');
        arg = arg.split('/');
        let endpoints = arg.pop();
        let subFolder = arg.join('/');
        // endpoints
        let fullEndpoints = endpointsPath + subFolder.concat('/') + endpoints.concat('-endpoints.js');
        let routeEndpoints = ((arg.length > 0) ? '/' : '') + subFolder.concat('/') + endpoints;
        // test
        let fullTest = testPath + subFolder + '/' + endpoints.concat('-endpoints.spec.js');
        if (!this.fs.existsSync(fullEndpoints)) {
          // prepare state require file if `rq` not exists
          let rqFile = '// You can require something \n';
          // check exists requrie files
          if (rq) {
            rqFile = '';
            // make require multiples line
            rq.map((data) => {
              rqFile += data;
            })
          }
          // generater endpoint
          this.makeFolder(endpointsPath + subFolder)
            .then(this.copy.bind(this, tmpEndpointsPath, fullEndpoints))
            .then(this.contentReplace.bind(this, fullEndpoints, {
              'endpoint': routeEndpoints,
              'endpointName': endpoints,
              'rq': rqFile
            }))
            // generater test
            .then(this.makeFolder.bind(this, testPath + subFolder))
            .then(this.copy.bind(this, tmpSpecPath, fullTest))
            .then(this.contentReplace.bind(this, fullTest, {
              'endpoint': routeEndpoints,
              'endpointName': endpoints
            }))
            .then(logUpdate("\n[104m [37mProcessing[0m [0m The endpoint `" + endpoints + "` it's generating..."))
            .then(generated => logUpdate(generated))
            .catch(err => {
              throw err;
            });
        } else {
          resolve("\n[103m[90m Warning [0m[0m The endpoint `" + endpoints + "` it's duplicated.");
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  isModelFound(modelArr) {
    return new Promise((resolve, reject) => {
      try {
        let n = 1;
        modelArr.map((data) => {
          if (!this.fs.existsSync('./src/models/' + data.concat('.js'))) {
            resolve(data);
          }
          if (modelArr.length == n) {
            resolve(true);
          }
          n++;
        })
      } catch (error) {
        reject(error);
      }
    });
  }

  makeModel() {
    return new Promise((resolve, reject) => {
      try {
        let tmpModelsPath = __dirname + '/models';
        let modelPath = './src/models/';
        // argument join `slash`
        let arg = this.argument.replace(/^\/+|\/+$/g, '');
        arg = arg.split('/');
        let models = arg.pop();
        models = models.charAt(0).toUpperCase() + models.slice(1);
        let subFolder = arg.join('/');
        // models
        let fullModels = modelPath + subFolder.concat('/') + models.concat('.js');
        // check file exists
        if (!this.fs.existsSync(fullModels)) {
          // generater model
          this.makeFolder(modelPath + subFolder)
            .then(this.copy.bind(this, tmpModelsPath, fullModels))
            .then(this.modelContentReplace.bind(this, fullModels, {
              'modelName': models.toLowerCase(),
            }))
            .then(logUpdate("\n[104m [37mProcessing[0m [0m The model `" + models + "` it's generating..."))
            .then(generated => logUpdate(generated))
            .catch(err => {
              throw err;
            });
        } else {
          resolve("\n[103m[90m Warning [0m[0m The model `" + models + "` it's duplicated.");
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  makeFolder(path) {
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
            throw err;
          } else {
            resolve(path);
          }
        })
      } catch (error) {
        reject(error);
      }
    });
  }

  makePassportInit() {
    return new Promise((resolve, reject) => {
      try {
        let passport_config_file = __dirname + '/../configure/passport.config.js';
        let passport_config_paste_point = "./passport.config.js";
        if (!this.fs.existsSync(passport_config_paste_point)) {
          this.copy(passport_config_file, passport_config_paste_point)
            .then(resolve("\n[102m[90m Passed [0m[0m The `passport-jwt` is initialized."))
            .catch(err => console.log(err));
        } else {
          resolve("\n[103m[90m Warning [0m[0m The `passport-jwt` already is initialized.");
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  makeAddOnInit() {
    return new Promise((resolve, reject) => {
      try {
        let tmpEndpointsPath = __dirname + '/add-on';
        let add_on_paste_point = "Add-on.js";
        let folder_add_on = "./src/";
        if (!this.fs.existsSync(folder_add_on + add_on_paste_point)) {
          this.makeFolder(folder_add_on)
            .then(this.copy.bind(this, tmpEndpointsPath, folder_add_on + add_on_paste_point))
            .then(resolve("\n[102m[90m Passed [0m[0m The `add-on` is initialized."))
            .catch(err => console.log(err));
        } else {
          resolve("\n[103m[90m Warning [0m[0m The `add-on` already is initialized.");
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  copy(path, to) {
    /**
     * @param path old path file
     * @param to save to new path file
     * 
     * @return new path file
     */
    return new Promise((resolve, reject) => {
      try {
        if (!this.fs.existsSync(to)) {
          if (this.fs.createReadStream(path).pipe(this.fs.createWriteStream(to))) {
            resolve(to);
          } else {
            throw err;
          }
        } else {
          resolve(to);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  contentReplace(pathFile, textCondition) {
    return new Promise((resolve, reject) => {
      try {
        let endpoint = textCondition.endpoint;
        let endpointName = textCondition.endpointName;
        let rq = textCondition.rq;
        let modelName = textCondition.modelName;
        // delay for generator
        setTimeout(() => {
          this.fs.readFile(pathFile, 'utf8', (err, data) => {
            if (err) {
              throw err;
            } else {
              // content replace
              let text = data.replace(new RegExp('{{endpoint}}', 'g'), endpoint);
              text = text.replace(new RegExp('{{endpointName}}', 'g'), endpointName);
              text = text.replace(new RegExp('{{requireSomething}}', 'g'), rq);
              text = text.replace(new RegExp('{{modelName}}', 'g'), modelName);
              // writing the file
              this.fs.writeFile(pathFile, text, 'utf8', (err) => {
                if (err) {
                  throw err;
                } else {
                  resolve("\n[102m[90m Passed [0m[0m The endpoint `" + endpointName + "` it's generated.");
                }
              });
            }
          })
        }, 1000);
      } catch (error) {
        reject(error);
      }
    });
  }

  modelContentReplace(pathFile, textCondition) {
    return new Promise((resolve, reject) => {
      try {
        let modelName = textCondition.modelName;
        // delay for generator
        setTimeout(() => {
          this.fs.readFile(pathFile, 'utf8', (err, data) => {
            if (err) {
              throw err;
            } else {
              // content replace
              let text = data.replace(new RegExp('{{modelName}}', 'g'), modelName);
              // writing the file
              this.fs.writeFile(pathFile, text, 'utf8', (err) => {
                if (err) {
                  throw err;
                } else {
                  resolve("\n[102m[90m Passed [0m[0m The model `" + modelName + "` it's generated.");
                }
              });
            }
          })
        }, 1000);
      } catch (error) {
        reject(error);
      }
    });
  }

  appKeyGenerator(length) {
    return new Promise((resolve, reject) => {
      try {
        let md5 = require("md5");
        let secret = require(__dirname + "/../../../lib/salt").salt;
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

  generateKeyConfigFile() {
    return new Promise((resolve, reject) => {
      try {
        this.fs.readFile("app.config.js", 'utf8', (err, data) => {
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
              this.fs.writeFile("app.config.js", text, 'utf8', (err) => {
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
        this.fs.readFile(__dirname + "/help", 'utf8', function (err, data) {
          if (err) {
            throw err;
          }
          resolve(data);
        });
      } catch (error) {
        reject(err);
      }
    });
  }

  embed(argv) {
    return new Promise((resolve, reject) => {
      try {
        this.fs = require('fs');
        this.argv = argv;
        this.option = argv[2];
        this.argument = argv[3];
        this.special = argv[4];
        this.extra = argv[5];
        resolve(this);
      } catch (error) {
        reject(err);
      }
    });
  }
}

new Generator();