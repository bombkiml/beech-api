global._http = require('http')
const _express = require('express')
global.app = _express()
global._mysql = require('mysql')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const cors = require('cors')
// Local environments
global._config = require('../app.config')
const dbConnect = require('./databases/mysql.connection')
const httpExpress = require('./services/http.express')
const fileWalk = require('./file-walk/file-walk')
// View engine
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(expressValidator())
app.use(cors({ origin: true, credentials: true }))
// Allow Origin
app.all('/', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "X-Requested-With")
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS")
  res.header("Content-Type", "application/json; charset=utf-8")
  next()
})
// Read folder in ./src/endpoints/*
const walk = require('walk')
let jsfiles = []
let walker = walk.walk('.\\src\\endpoints', { followLinks: false })
walker.on('file', (root, stat, next) => {
  jsfiles.push(root + '\\' + stat.name)
  next()
})
walker.on('end', () => {
  init(jsfiles)
})
// defind server variable
global._SERVER
// Initialize the application
init = (jsfiles) => {
  try {
    /**
     * @start express server 
     * @mysql connect
     * @autoload
     * 
     */
    httpExpress.expressStart()
      .then(httpExpress.getExpressServer.bind(this))
      .then(serv => _SERVER = serv)
      .then(dbConnect.defaultConnection.bind(this))
      .then(dbConnect.secondConnection.bind(this))
      .then(fileWalk.fileWalk.bind(this, jsfiles))
      .catch(error => {
        throw error
      })
  } catch (error) {
    throw error
  }
}
// Bad request
app.get('/', (req, res) => {
  data = {}
  data.status = 200
  data.message = 'Not get allow.'
  res.json(data)
})
// Killer service
app.get('/kill', (req, res) => {
  data = {}
  _SERVER.close()
  data.status = 200
  data.message = 'Killing successfully.'
  res.json(data)
})