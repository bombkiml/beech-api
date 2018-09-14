class Generater {

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
                let tmpEndpointsPath = './core/generater/endpoints'
                let tmpModelsPath = './core/generater/models'
                let tmpSpacPath = './core/generater/spac'
                let endpointsPath = './src/endpoints/'
                let arg = this.argument.split('/')
                let endpoints = arg.pop()
                let subFolder = arg.join('/')
                let fullEndpoints = endpointsPath + subFolder + '/' + endpoints.concat('-endpoints.js')
                let routeEndpoints = subFolder + '/' + endpoints
                
                this.makeFolder(endpointsPath + subFolder)
                    .then(() => this.copy(tmpEndpointsPath, fullEndpoints)
                        .then((file) => this.contentReplace(file, '{{endpoints}}', routeEndpoints)
                            .then(() => console.log('generated successfully.'))
                        )
                    )
            } catch (error) {
                reject(error)
            }
        })
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

    copy(path, to) {
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

    contentReplace(pathFile, oldText, newText) {
        return new Promise((resolve, reject) => {
            try {
                this.fs.readFile(pathFile, 'utf8', (err, data) => {
                    if (err) {
                        throw err
                    } else {
                        let result = data.replace(new RegExp(oldText, 'g'), newText);
                        this.fs.writeFile(pathFile, result, 'utf8', (err) => {
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

new Generater()