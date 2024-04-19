const secret = require("../../../lib/src/salt").salt;
const Cryptr = require("cryptr");
const md5 = require("md5");
const fs = require("fs");
const appRoot = require("app-root-path");

function Rand(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".concat(Math.floor(Math.random() * 1000000000));
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function HashIt(txt, app_key, iteration = 10000, len = 10, cb) {
  const crypIt = new Cryptr(secret.toString().concat(app_key.toString()), { encoding: "base64url", pbkdf2Iterations: iteration, saltLength: len, });
  cb(crypIt.encrypt(txt.concat(md5(secret).toString().slice(0,len+1))));
}

function getAppKey(cb) {
  // chcek app.config file for Dev. || Prd.
  if(fs.existsSync(appRoot + "/app.config.js")) {
    cb(null, require(appRoot + "/app.config.js").main_config.app_key);
  } else {
    fs.readFile("./app.config.js", 'utf8', (err, e) => {
      if(err) {
        cb(err, null);
      } else {
        cb(null, eval(e).main_config.app_key);
      }
    });;
  }
}

function DeHashIt(txtHashed, iteration = 10000, len = 10, cb) {
  try {
    getAppKey((err, app_key) => {
      if(err) {
        cb(err, null);
      } else {
        const crypIt = new Cryptr(secret.toString().concat(app_key.toString()), { encoding: "base64url", pbkdf2Iterations: iteration, saltLength: len, });
        let decryped = crypIt.decrypt(txtHashed);
        cb(false, decryped.concat(md5(secret).toString()));
      }
    });
  } catch (error) {
    cb(error, null);
  }
}

module.exports = { Rand, HashIt, DeHashIt, X:secret, M:md5, Z:getAppKey };
