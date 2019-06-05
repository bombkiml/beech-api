class Generator {
  constructor() {
    this.embed(process.argv).then(
      () => this.init().then(
        (status) => console.log(status)
      ).catch((err) => {
        throw err
      })
    )
  }

  init() {
    return new Promise((resolve, reject) => {
      try {
          let status = null
          if (this.option == '-v' || this.option == '--version') {
            resolve("\n The Beech API v1.0 \n Author: bombkiml \n Built: Aug 19 2018 23:09:01 \n")
          } else if (this.option == '-h' || this.option == '-?' || this.option == '--help') {
            this.help().then(
              (help) => resolve(help)
            ).catch((err) => {
              reject(err)
            })
          } else if (this.option == '-g' || this.option == 'generate') {
            if(!this.argument) {
              resolve("\n Plase specify endpoints name. \n")
            } else {
              this.make().then(
                (make) => resolve(make)
              ).catch((err) => {
                reject(err)
              })
            }
          } else {
            resolve("\n faltal: commnad is not available. \n")
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
        let arg = this.argument.split('/')
        let endpoints = arg.pop()
        let subFolder = arg.join('/')
        // endpoints
        let fullEndpoints = endpointsPath + subFolder + '/' + endpoints.concat('-endpoints.js')
        let routeEndpoints = subFolder.concat('/') + endpoints
        // test
        let fullTest = testPath + subFolder + '/' + endpoints.concat('-endpoints.spec.js')
        let routeTest = subFolder.concat('/') + endpoints

        /* this.makeFolder(endpointsPath + subFolder)
        .then(this.test.bind(this, 11, 22, 33))
        .then(this.test2.bind(this, 'hello')) */

        /* .then(this.copy.bind(this, tmpEndpointsPath, fullEndpoints))
        .then(this.contentReplace.bind(this, fullEndpoints, {
          'endpoint' : routeEndpoints,
          'endpointName' : endpoints
        })) */

        /* .then(this.makeFolder.bind(this, testPath + subFolder))
        .then(this.copy.bind(this, tmpSpecPath, fullTest))
        .then(this.contentReplace.bind(this, fullTest, {
          'endpoint' : routeEndpoints,
          'endpointName' : endpoints
        })) */

        let myData = [
          {id: 1, name: 'john', age: 20},
          {id: 2, name: 'mark', age: 21},
          {id: 3, name: 'michel', age: 22},
          {id: 4, name: 'ali', age: 23},
          {id: 5, name: 'pi', age: 24},
        ];

        myData.map(val => {
          console.log(val.id)
        })









        /* .then(resolve('\n generated endpoints, spec successfully. \n'))
        .catch((err) => {
          throw err
        }) */
      } catch (error) {
        reject(error)
      }
    })
  }
  async test(a, b, c, d) {
    return new Promise((resolve, reject) => {
      try {
        console.log("a> "+a)
        console.log("b> "+b)
        console.log("c> "+c)
        console.log("d> "+d)
        resolve(a)
      } catch (error) {
        reject(error)
      }
    })
  }

  test2(txt, a) {
    return new Promise((resolve, reject) => {
      try {
        console.log(txt)
        console.log(a)
        resolve(txt)
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
            if(err) {
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
        if(this.fs.createReadStream(path).pipe(this.fs.createWriteStream(to))) {
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
        this.fs.readFile(pathFile, 'utf8', (err, data) => {
          if (err) {
            throw err
          } else {
            let endpoint = textCondition.endpoint
            let endpointName = textCondition.endpointName
            
            let text = data.replace(new RegExp('{{endpoint}}', 'g'), endpoint)
            text = text.replace(new RegExp('{{endpointName}}', 'g'), endpointName)
            
            this.fs.writeFile(pathFile, text, 'utf8', (err) => {
              if (err) {
                throw err
              } else {
                resolve(true)
              }
            })
          }                  
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  help() {
    return new Promise((resolve, reject) => {
      try {
        this.fs.readFile('.\\core\\help', 'utf8', function(err, data) {
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