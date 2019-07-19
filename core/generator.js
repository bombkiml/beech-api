class Generator {
  constructor() {
    this.embed(process.argv)
      .then(() => this.init()
        .then((status) => console.log(status))
        .catch((err) => {
          throw err
        })
      )
  }

  init() {
    return new Promise((resolve, reject) => {
      try {
        if (this.option == '-v' || this.option == '--version') {
          resolve("\n The Beech API [103m[90m v2.0.0 [0m[0m \n Author: bombkiml \n Built: July 19, 2019 22:19:09 \n")
        } else if (this.option == '-h' || this.option == '-?' || this.option == '--help') {
          this.help()
            .then((help) => resolve(help))
            .catch((err) => reject(err))
        } else if (this.option == '-g' || this.option == 'generate') {
          if (!this.argument) {
            resolve("\n [103m[90m Warning [0m[0m : Plase specify endpoints name. \n")
          } else {
            this.make()
              .then((make) => resolve(make))
              .catch((err) => reject(err))
          }
        } else if (this.option == 'kill') {
          /* require('./app')
          console.log(_SERVER) */
        } else {
          resolve("\n [101m Faltal [0m : commnad is not available. \n")
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  make() {
    return new Promise((resolve, reject) => {
      try {
        let tmpEndpointsPath = './core/generator/endpoints'
        let tmpModelsPath = './core/generator/models'
        let tmpSpecPath = './core/generator/spec'
        let endpointsPath = './src/endpoints/'
        let testPath = './test/unit/endpoints/'
        // argument join `slash`

        let arg = this.argument.replace(/^\/+|\/+$/g, '')
        arg = arg.split('/')
        let endpoints = arg.pop()
        let subFolder = arg.join('/')
        // endpoints
        let fullEndpoints = endpointsPath + subFolder + '/' + endpoints.concat('-endpoints.js')
        let routeEndpoints = ((arg.length > 0) ? '/' : '') + subFolder.concat('/') + endpoints
        // test
        let fullTest = testPath + subFolder + '/' + endpoints.concat('-endpoints.spec.js')
        const fs = require('fs')
        if (!fs.existsSync(fullEndpoints)) {
          // generater endpoint
          this.makeFolder(endpointsPath + subFolder)
            .then(this.copy.bind(this, tmpEndpointsPath, fullEndpoints))
            .then(this.contentReplace.bind(this, fullEndpoints, {
              'endpoint': routeEndpoints,
              'endpointName': endpoints
            }))
            // generater test
            .then(this.makeFolder.bind(this, testPath + subFolder))
            .then(this.copy.bind(this, tmpSpecPath, fullTest))
            .then(this.contentReplace.bind(this, fullTest, {
              'endpoint': routeEndpoints,
              'endpointName': endpoints
            }))
            //.then(resolve('\n Generated endpoints, spec successfully. \n'))
            .then(resolve('\n [102m[90m Generater [0m[0m : The endpoint `' + endpoints + '` is created. \n'))
            .catch((err) => {
              throw err
            })
        } else {
          resolve('\n [103m[90m Warning [0m[0m : The endpoint `' + endpoints + '` is duplicate. \n')
        }
      } catch (error) {
        reject(error)
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
        let mkdirp = require('mkdirp')
        mkdirp(path, (err) => {
          if (err) {
            throw err
          } else {
            resolve(path)
          }
        })
      } catch (error) {
        reject(error)
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
          resolve(to)
        } else {
          throw err
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  async contentReplace(pathFile, textCondition) {
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          this.fs.readFile(pathFile, 'utf8', (err, data) => {
            if (err) {
              throw err
            } else {
              let endpoint = textCondition.endpoint
              let endpointName = textCondition.endpointName
              // content replace
              let text = data.replace(new RegExp('{{endpoint}}', 'g'), endpoint)
              text = text.replace(new RegExp('{{endpointName}}', 'g'), endpointName)
              // writing the file
              this.fs.writeFile(pathFile, text, 'utf8', (err) => {
                if (err) {
                  throw err
                } else {
                  resolve('\n Generated endpoints, spec successfully. \n')
                }
              })
            }
          })
        }, 1500);
      } catch (error) {
        reject(error)
      }
    });
  }

  help() {
    return new Promise((resolve, reject) => {
      try {
        this.fs.readFile('.\\core\\help', 'utf8', function (err, data) {
          if (err)
            throw err
          resolve(data)
        })
      } catch (error) {
        reject(err)
      }
    })
  }

  embed(argv) {
    return new Promise((resolve, reject) => {
      try {
        this.fs = require('fs')
        this.argv = argv
        this.option = argv[2]
        this.argument = argv[3]
        this.special = argv[4]
        resolve(this)
      } catch (error) {
        reject(err)
      }
    })
  }
}

new Generator()