global._http = require('http');
const _express = require('express');
const _app = _express();
global._mysql = require('mysql');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const cors = require('cors');
global.endpoint = _express.Router();
// Local environments
global._config = require('../app.config');
const dbConnect = require('./databases/mysql.connection');
const httpExpress = require('./services/http.express');
const fileWalk = require('./file-walk/file-walk');
// View engine
_app.use(bodyParser.json());
_app.use(bodyParser.urlencoded({ extended: true }));
_app.use(cookieParser());
_app.use(expressValidator());
_app.use(cors({ origin: true, credentials: true }));
// Allow Origin
_app.all('/', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE, OPTIONS");
  res.header("Content-Type", "application/json; charset=utf-8");
  next();
});
// parse global app
global.express = _app;
// Read folder in ./src/endpoints/*
const walk = require('walk');
let jsfiles = []
let walker = walk.walk('./src/endpoints', { followLinks: false });
walker.on('file', (root, stat, next) => {
  jsfiles.push(root + '/' + stat.name);
  next();
});
walker.on('end', () => {
  init(jsfiles);
});
// defind server variable
global._SERVER;
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
      .then(dbConnect.defaultConnection.bind(this))
      .then(dbConnect.secondConnection.bind(this))
      .then(fileWalk.fileWalk.bind(this, jsfiles))
      .catch(error => {
        throw error;
      });
  } catch (error) {
    throw error;
  }
}
// use router
express.use(endpoint);