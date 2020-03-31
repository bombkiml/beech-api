#!/usr/bin/env node

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
          } else if (this.argument == 'global') {
            let globalFrom = __dirname + '/global';
            let globalCopyTo = 'beech.global.js';
            if (!this.fs.existsSync(globalCopyTo)) {
              this.copy(globalFrom, globalCopyTo)
                .then(resolve("\n[102m[90m Passed [0m[0m The `" + globalCopyTo + "` it's generated."))
                .catch(err => {
                  throw err;
                });
            } else {
              resolve("\n[103m[90m Warning [0m[0m Already have a global library.");
            }
          } else {
            if (!this.special || this.special == 'undefined') {
              this.make()
                .then(make => resolve(make))
                .catch(err => reject(err));
            } else if (this.special.length > 10) {
              if (this.special.substring(0, 10) == '--require=') {
                // check space
                if (this.extra) {
                  resolve("\n[103m[90m Warning [0m[0m Not using space in `" + this.special + "[101m [0m" + this.extra + "...`, please remove it.");
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
                        // create back dash (../)
                        let backDash = '';
                        let arg = this.argument.replace(/^\/+|\/+$/g, '');
                        arg = arg.split('/');
                        arg.map(() => {
                          backDash += '../';
                        })
                        // make require file
                        let rqr = myRequire.map(data => {
                          let model = data.replace(/[^A-Za-z0-9]+/g, '');
                          return 'const '.concat(model.concat(' = require("'.concat(backDash.concat('models/'.concat(model.concat('");\n'))))));
                        })
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
        } else if (this.option == 'kill') {
          /* require('./app')
          console.log(_SERVER) */
        } else {
          resolve("\n[101m Faltal [0m commnad it's not available.");
        }
      } catch (error) {
        reject(error);
      }
    })
  }

  make(rq = null) {
    return new Promise((resolve, reject) => {
      try {
        let tmpEndpointsPath = __dirname + '/endpoints';
        let tmpSpecPath = __dirname + '/spec';
        let endpointsPath = './src/endpoints/';
        let testPath = './test/unit/endpoints/';
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
          let rqFile = '// Require something \n';
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
            .then(resolve("\n[104m [37mProcessing[0m [0m The endpoint `" + endpoints + "` it's generating..."))
            .then(generated => console.log(generated))
            .catch(err => {
              throw err;
            });
        } else {
          resolve("\n[103m[90m Warning [0m[0m The endpoint `" + endpoints + "` it's duplicated.");
        }
      } catch (error) {
        reject(error);
      }
    })
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
    })
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
            .then(resolve("\n[102m[90m Passed [0m[0m The models `" + models + "` it's generated."))
            .catch(err => {
              throw err;
            });
        } else {
          resolve("\n[103m[90m Warning [0m[0m The models `" + models + "` it's duplicated.");
        }
      } catch (error) {
        reject(error);
      }
    })
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
            throw err;
          } else {
            resolve(path);
          }
        })
      } catch (error) {
        reject(error);
      }
    })
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
          throw err;
        }
      } catch (error) {
        reject(error);
      }
    })
  }

  async contentReplace(pathFile, textCondition) {
    return new Promise((resolve, reject) => {
      try {
        // delay for generator
        setTimeout(() => {
          this.fs.readFile(pathFile, 'utf8', (err, data) => {
            if (err) {
              throw err;
            } else {
              let endpoint = textCondition.endpoint;
              let endpointName = textCondition.endpointName;
              let rq = textCondition.rq;
              // content replace
              let text = data.replace(new RegExp('{{endpoint}}', 'g'), endpoint);
              text = text.replace(new RegExp('{{endpointName}}', 'g'), endpointName);
              text = text.replace(new RegExp('{{requireSomething}}', 'g'), rq);
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
        }, 1500);
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
    })
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
    })
  }
}

new Generator();