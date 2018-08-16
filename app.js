global._http = require('http');
const _express = require('express');
global.app = _express();
global._mysql = require('mysql');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const cors = require('cors');
const fs = require("fs");

global._config = require('./config/config');
const dbConnect = require('./core/databases/mysql.connection');
const httpExpress = require('./core/services/http.express');

// View engine
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(expressValidator());
app.use(cors({ origin:true, credentials: true }));

// Allow Origin
app.all('/', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
    res.header("Content-Type", "application/json; charset=utf-8");
    next();
});

// Read folder in routes/*
const walk = require('walk');
let jsfiles   = [];
let walker = walk.walk('./src/endpoints', { followLinks: false });
walker.on('file', (root, stat, next) => {
    jsfiles.push(root + '/' + stat.name);
    next();
});
walker.on('end', () => {
	init(jsfiles);
});

// Initial app
init = (jsfile_list) => {
	try {
		let route;
		let total = jsfile_list.length;
		let new_file_name = "";
		let jsfile = "";

		for(let i=0; i < total; i++) {
			jsfile = jsfile_list[i];
			if(jsfile.indexOf(".js") > 0) {
				new_file_name = jsfile.split(".js");
				route = require(new_file_name[0]);
				route.init();
			}
		}

		/**
		 * Start server & mysql connect
		 * 
		 */
		httpExpress.expressStart().then(
			() => dbConnect.defaultMysqlConnection().then(
				(db) =>	{
                    DB = db,
                    dbConnect.reportMysqlConnection().then(
                        (db) => {
                            reportDB = db
                        }
                    ).catch((err) => {
                        throw err
                    })
                }
			).catch((err) => {
				throw err  
			})
		).catch((err) => {
			throw err
		});
	} catch (error) {
		throw error
	}
}

// Base request
app.get('/', (req, res) => {
    data = {};
    data.code = 400;
    data.message = 'Not get allow!';
    res.json(data);
});