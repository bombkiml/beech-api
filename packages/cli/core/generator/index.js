#!/usr/bin/env node
const logUpdate = require("log-update");
const inquirer = require('inquirer');
const walk = require("walk");

class Generator {
  constructor() {
    this.embed(process.argv)
      .then(() => this.init()
        .then(status => console.log(status))
        .catch(err => {
          throw err;
        })
      )
      .catch(err => {
        throw err
      });
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
            } else if (this.special == '--require' || this.special == '-R') {
              // walking model files
              const walkModelPromise = new Promise((resolve) => {
                let walker = walk.walk("./src/models", { followLinks: false });
                let modelFiles = [];
                walker.on("file", (root, stat, next) => {
                  let subFolderModel = root.split("src/models\\")[1];
                  modelFiles.push((subFolderModel ? subFolderModel + "/" : "") + stat.name.split('.')[0]);
                  next();
                });
                walker.on("end", () => {
                  if(modelFiles.length) {
                    inquirer.prompt([ {
                      type: "checkbox",
                      name: "selectModel",
                      message: "[93mPlease select Models:[0m",
                      choices: modelFiles.map(e => e.replace(/\\/g, "/")),
                    } ]).then(selected => {
                      resolve(selected.selectModel);
                    });
                  } else {
                    // model file not found, Only create endpoint
                    resolve();
                  }
                });
              });
              Promise.all([walkModelPromise]).then((modelSelected) => {
                let myModel = modelSelected[0];
                // check require model exists
                const modelExistsPromise = new Promise((resolve, reject) => {
                  this.isModelFound(myModel)
                    .then(existsModel => {
                      // check exists model
                      if (existsModel == false) {
                        inquirer.prompt([ {
                          type: "confirm",
                          name: "confirmModelNF",
                          message: "[93mModel is not found, Do you only create Endpoint ?:[0m",
                        } ]).then(confirm => {
                          if(confirm.confirmModelNF) {
                            resolve([true, []]);
                          } else {
                            resolve([false, []]);
                          }
                        });
                      } else {
                        resolve([true, myModel]);
                      }
                    })
                    .catch(err => reject(err));
                });
                // promise all check choose model(s)
                Promise.all([modelExistsPromise]).then((modelRes) => {
                  // Say Yes, Making...
                  if(modelRes[0][0]) {
                    const poolBasePromise = new Promise((resolve) => {
                      // Check global config for prepare tmp endpoint
                      this.fs.readFile("./global.config.js", 'utf8', (err, data) => {
                        if (err) {
                          console.log("\n[101m Faltal [0m Can't read `global.config.js` file.\n", err);
                          return; // break;
                        } else {
                          let buffer = Buffer.from(data);
                          let buf2str = buffer.toString();
                          let buf2json = JSON.parse(JSON.stringify(buf2str));
                          let pool_base = /global.pool_base\s+=\s+(?:"|')([^"]+)(?:"|')(?:\r|\n|$|;|\r)/i.exec(buf2json);
                          if (pool_base) {
                            let myRequire = modelRes[0][1];
                            if (pool_base[ 1 ] == "basic") {
                              if(myRequire.length) {
                                // declare basic require model file
                                let rqr = "";
                                myRequire.map((data, key) => {
                                  let modelName = data.split('/');
                                  let modelFolder = "";
                                  modelName = modelName.pop();
                                  modelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
                                  modelFolder = data.substring(0, data.lastIndexOf('/') + 1).replace(/\\/g, "/");
                                  rqr += `const ${modelName} = require(\"@/models/${modelFolder + modelName}\");\n`;
                                  if(myRequire.length == key+1) {
                                    resolve([[rqr], myRequire]);
                                  }
                                });
                              } else {
                                resolve([[]]);
                              }
                            } else if (pool_base[ 1 ] == "sequelize") {
                              // check null require resolve it
                              if(myRequire.length) {
                                // declare basic require model file
                                let rqr = "";
                                myRequire.map((data, key) => {
                                  let modelName = data.split('/');
                                  let modelFolder = "";
                                  modelName = modelName.pop();
                                  modelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
                                  modelFolder = data.substring(0, data.lastIndexOf('/') + 1).replace(/\\/g, "/");
                                  rqr += `const { ${modelName}, exampleFindOne${modelName}ById } = require(\"@/models/${modelFolder + modelName}\");\n`;
                                  if(myRequire.length == key+1) {
                                    resolve([[rqr], myRequire]);
                                  }
                                });
                              } else {
                                resolve([[]]);
                              }
                            } else {
                              console.log("\n[101m Faltal [0m The pool_base in `global.config.js` file does not match the specific.");
                            }
                          } else {
                            console.log("\n[101m Faltal [0m The pool_base in `global.config.js` file is not found.");
                          }
                        }
                      });
                    });
                    // Final promise for make
                    Promise.all([poolBasePromise]).then((rqrRes) => {
                      // make with require model file
                      this.make(rqrRes[0])
                        .then(make => resolve(make))
                        .catch(err => reject(err));
                    });
                  } else {
                    // Say No, Nothing...
                    resolve(": Say no.");
                  }
                });
              });
            } else if (this.special == '--model' || this.special == '-M') {
              this.makeModel()
                .then(make => resolve(make))
                .catch(err => reject(err));
            } else if (this.special == '--helper') {
              this.makeHelper()
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
        } else if (this.option == "key:generate" || this.option == "key:gen") {
          this.generateKeyConfigFile()
            .then(resGenKey => resolve(resGenKey))
            .catch(err => reject(err));
        } else if (this.option.match(/hash:.*/)) {
          if(this.option.length > 5) {
            const { HashIt, Z } = require(__dirname + "/../helpers/math");
            Z((err, ak) => {
              if(err) {
                logUpdate(err);
              } else {
                let txt = this.option.split(":");
                HashIt(txt, ak, null, (5).toString().length, (hashed) => {
                  logUpdate(hashed);
                });
              }
            });
          } else {
            resolve("\n[103m[90m Info. [0m[0m No text hash.");
          }
        } else if (this.option == "add-on") {
          if (this.argument == "init") {
            this.makeAddOnInit()
              .then(make => resolve(make))
              .catch(err => reject(err));
          } else {
            resolve("\n[103m[90m Warning [0m[0m Using `add-on init` for initiate add-on.");
          }
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

  make(rq = null) {
    return new Promise((resolve, reject) => {
      try {
        // prepare data
        let tmpEndpointsPath = __dirname;
        let tmpSpecPath = __dirname + '/_spec';
        let endpointsPath = './src/endpoints/';
        let testPath = './__tests__/unit/endpoints/';
        // argument join `slash`
        let arg = this.argument.replace(/^\/+|\/+$/g, '');
        arg = arg.split('/');
        let endpoints = arg.pop();
        let subFolder = arg.join('/');
        // endpoints file
        let fullEndpoints = endpointsPath + subFolder.concat('/') + endpoints.concat('-endpoints.js');
        let routeEndpoints = ((arg.length > 0) ? '/' : '') + subFolder.concat('/') + endpoints;
        // test file
        let fullTest = testPath + subFolder + '/' + endpoints.concat('-endpoints.spec.js');

        // Check exists endpoint file
        if (!this.fs.existsSync(fullEndpoints)) {
          // STEP 0 : Check global config for prepare tmp endpoint
          const promise0 = new Promise((resolve) => {
            this.fs.readFile("./global.config.js", 'utf8', (err, data) => {
              if (err) {
                console.log("\n[101m Faltal [0m Can't read `global.config.js` file.", err);
                resolve([false, null, null]);
              } else {
                let buffer = Buffer.from(data);
                let buf2str = buffer.toString();
                let buf2json = JSON.parse(JSON.stringify(buf2str));
                let pool_base = /global.pool_base\s+=\s+(?:"|')([^"]+)(?:"|')(?:\r|\n|$|;|\r)/i.exec(buf2json);
                if (pool_base) {
                  if (pool_base[ 1 ] == "basic") {
                    resolve([true, tmpEndpointsPath += '/_endpoints_basic', pool_base[ 1 ]]);
                  } else if (pool_base[ 1 ] == "sequelize") {
                    resolve([true, tmpEndpointsPath += '/_endpoints', pool_base[ 1 ]]);
                  } else {
                    console.log("\n[101m Faltal [0m The pool_base in `global.config.js` file does not match the specific.");
                    resolve([false, null, null]);
                  }
                } else {
                  console.log("\n[101m Faltal [0m The pool_base in `global.config.js` file is not found.");
                  resolve([false, null, null]);
                }
              }
            });
          });

          // STEP 1 : format Model for base use [Users, Xxx, ...]
          const promise1 = new Promise((resolve) => {
            if(rq) {
              if(rq[1]) {
                let finalUseModel = [];
                rq[1].map((data, key) => {
                  let lastModel = data.split("/");
                  finalUseModel.push(lastModel.pop());
                  if(rq[1].length == key+1) {
                    resolve(finalUseModel);
                  }
                });
              } else {
                resolve([]);
              }
            } else {
              resolve([]);
            }
          });

          // STEP 2 : Format Require model file
          const promise2 = new Promise((resolve) => {
            // prepare state require file if `rq[0]` not exists
            let requireFile = '// You can require something \n';
            // check exists requrie files
            if(rq) {
              if (rq[0].length) {
                requireFile = '';
                // make require multiples line
                rq[0].map((data, key) => {
                  requireFile += data;
                  if(rq[0].length == key+1) {
                    //setTimeout(() => {
                      resolve(requireFile);
                    //}, 2000);
                  }
                })
              } else {
                resolve(requireFile);
              }
            } else {
              resolve(requireFile);
            }
          });
          // promise all generate endpoint with require(s)
          Promise.all([promise0, promise1, promise2]).then((rqFileRes) => {
            /**
             * @return
             * 
             * rqFileRes[0] : Array[0 = global file true, 1 = tmp endpoint file, 2 = pool_base type ]
             * rqFileRes[1] : Array[Users, ...] array tables
             * rqFileRes[2] : Text require file
             * 
             */
            // check global file exists.
            if(rqFileRes[0][0]) {
              logUpdate(": Initialize...");
              // check for remove / slash from route endpoint
              if(rqFileRes[0][2] == 'sequelize') {
                routeEndpoints = routeEndpoints.replace(/\\|\//g,'');
              }
              // timeout generate endpoint and replace content
              setTimeout(() => {
                // generater endpoint
                this.makeFolder(endpointsPath + subFolder)
                  .then(this.copy.bind(this, tmpEndpointsPath, fullEndpoints))
                  .then(this.contentReplace.bind(this, fullEndpoints, {
                    'endpoint': routeEndpoints,
                    'endpointName': endpoints,
                    'rq': rqFileRes[2],
                    'tables': rqFileRes[1],
                  }))
                  // generater test
                  .then(this.makeFolder.bind(this, testPath + subFolder))
                  .then(this.copy.bind(this, tmpSpecPath, fullTest))
                  .then(this.contentReplace.bind(this, fullTest, {
                    'endpoint': routeEndpoints,
                    'endpointName': endpoints
                  }))
                  .then(logUpdate("\n[104m [37mProcessing [0m [0m The endpoint `" + endpoints + "` it's generating..."))
                  .then(generated => logUpdate(generated))
                  .catch(err => {
                    throw err;
                  });
              }, 2000);
            }
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
        if(modelArr !== undefined) {
          if(modelArr.length) {
            modelArr.map((data, key) => {
              if (!this.fs.existsSync('./src/models/' + data.concat('.js'))) {
                resolve(data);
              }
              if (modelArr.length == key+1) {
                resolve(true);
              }
            });
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  makeModel() {
    return new Promise((resolve, reject) => {
      try {
        // declare path model file
        let tmpModelsPath = __dirname;
        // read global.config.js file for check pool_base for generate model file
        this.fs.readFile("./global.config.js", 'utf8', (err, data) => {
          if (err) {
            resolve("\n[101m Faltal [0m Can't read `global.config.js` file.", err);
          } else {
            let buffer = Buffer.from(data);
            let buf2str = buffer.toString();
            let buf2json = JSON.parse(JSON.stringify(buf2str));
            let pool_base = /global.pool_base\s+=\s+(?:"|')([^"]+)(?:"|')(?:\r|\n|$|;|\r)/i.exec(buf2json);
            if (pool_base) {
              // read app.config.js file for get db connect name
              this.fs.readFile("./app.config.js", 'utf8', (appErr, appData) => {
                if (appErr) {
                  resolve("\n[101m Faltal [0m Can't read `app.config.js` file.", appErr);
                } else {
                  let appBuffer = Buffer.from(appData);
                  let appBuf2str = appBuffer.toString();
                  let appBuf2json = JSON.parse(JSON.stringify(appBuf2str));
                  let appBuf2eval = eval(appBuf2json);
                  // choose one of database connect name
                  inquirer.prompt([ {
                    type: "list",
                    name: "selectDbConnect",
                    message: "[93mPlease select database connect name:[0m",
                    choices: appBuf2eval.database_config.map(e => e.name),
                  } ]).then(dbSelected => {
                    // check pool_base
                    if (pool_base[ 1 ] == "basic") {
                      tmpModelsPath += '/_models_basic';
                      this.generateModel(tmpModelsPath, dbSelected.selectDbConnect)
                        .then(console.log)
                        .catch(console.log);
                    } else if (pool_base[ 1 ] == "sequelize") {
                      tmpModelsPath += '/_models';
                      this.generateModel(tmpModelsPath, dbSelected.selectDbConnect)
                        .then(console.log)
                        .catch(console.log);
                    } else {
                      resolve("\n[101m Faltal [0m The pool_base in `global.config.js` file does not match the specific.");
                    }
                  });
                }
              });
            } else {
              resolve("\n[101m Faltal [0m The pool_base in `global.config.js` file is not found.");
            }
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  generateModel(tmpModelsPath, dbSelected) {
    return new Promise((resolve, reject) => {
      try {
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
              'modelNameUppercase': models,
              'modelName': models.toLowerCase(),
              'dbSelected': dbSelected,
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

  makeHelper() {
    return new Promise((resolve, reject) => {
      try {
        let tmpHelpersPath = __dirname + '/_helpers';
        let helperPath = './src/helpers/';
        // argument join `slash`
        let arg = this.argument.replace(/^\/+|\/+$/g, '');
        arg = arg.split('/');
        let helpers = arg.pop();
        helpers = helpers.charAt(0).toUpperCase() + helpers.slice(1);
        let subFolder = arg.join('/');
        // helpers
        let fullHelpers = helperPath + subFolder.concat('/') + helpers.concat('.js');
        // check file exists
        if (!this.fs.existsSync(fullHelpers)) {
          // generater model
          this.makeFolder(helperPath + subFolder)
            .then(this.copy.bind(this, tmpHelpersPath, fullHelpers))
            .then(logUpdate("\n[104m [37mProcessing[0m [0m The helper `" + helpers + "` it's generating..."))
            .then(logUpdate("\n[102m[90m Passed [0m[0m The helper `" + helpers + "` it's generated."))
            .catch(err => {
              throw err;
            });
        } else {
          resolve("\n[103m[90m Warning [0m[0m The helper `" + helpers + "` it's duplicated.");
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
        const mkdirp = require("mkdirp");
        mkdirp(path)
          .then(p => resolve(p))
          .catch(err => reject(err));
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
        let tmpEndpointsPath = __dirname + '/_add-on';
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
          if (this.fs.ReadStream(path).pipe(this.fs.createWriteStream(to))) {
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
        let tables = textCondition.tables;
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
              text = text.replace(new RegExp('{{tables}}', 'g'), tables ? tables : "// You can use Base([Tables, ...])");
              setTimeout(() => {
                // writing the file
                this.fs.writeFile(pathFile, text, 'utf8', (err) => {
                  if (err) {
                    throw err;
                  } else {
                    resolve("\n[102m[90m Passed [0m[0m The endpoint `" + endpointName + "` it's generated.");
                  }
                });
              }, 1000);
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
              text = text.replace(new RegExp('{{dbSelected}}', 'g'), textCondition.dbSelected);
              // check add model name text uppercase
              if (Object.keys(textCondition).length > 1) {
                text = text.replace(new RegExp('{{modelNameUppercase}}', 'g'), textCondition.modelNameUppercase);
              }
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
        let secret = require(__dirname + "/../../../lib/src/salt").salt;
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
            let oldSecret = buf2eval.main_config.app_key;
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
        this.fs.readFile(__dirname + "/_help", 'utf8', function (err, data) {
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
        this.cmd = require('node-cmd');
        this.argv = argv;
        this.option = argv[ 2 ];
        this.argument = argv[ 3 ];
        this.special = argv[ 4 ];
        this.extra = argv[ 5 ];
        resolve(this);
      } catch (error) {
        reject(err);
      }
    });
  }
}

new Generator();