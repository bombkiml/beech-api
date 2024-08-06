const secret = require("../../../lib/src/salt").salt;
const Cryptr = require("cryptr");
const CryptoJS  = require("crypto-js");
const md5 = require("md5");
const fs = require("fs");

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

function getAppKey(cb) {
  // chcek app.config file for Prd. || Dev.
  if(fs.existsSync(appRoot + "/app.config.js")) {
    cb(null, require(appRoot + "/app.config.js").main_config.app_key);
  } else {
    fs.readFile("./app.config.js", 'utf8', (err, e) => {
      if(err) {
        cb(err, null);
      } else {
        cb(null, eval(e).main_config.app_key);
      }
    });
  }
}

function HashIt(txt, app_key, iteration = 10000, len = 10, cb) {
  const crypIt = new Cryptr(secret.toString().concat(app_key.toString()), { encoding: "base64url", pbkdf2Iterations: iteration, saltLength: len, });
  cb(crypIt.encrypt(txt.concat(md5(secret).toString().slice(0,len+1))));
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

// Advanced guard
function getAVGKey(cb) {
  // chcek app.config file for Prd. || Dev.
  if(fs.existsSync(appRoot + "/passport.config.js")) {
    const avg = require(appRoot + "/passport.config.js").model.guard;
    if(avg.advanced_guard) {
      let avgKey = (avg.advanced_guard.secret || "~A26o$I6s8!");
      cb(null, avgKey, md5(avgKey));
    } else {
      let avgKey = "!zI2c#Xo5z@";
      cb(null, avgKey, md5(avgKey));
    }
  } else {
    fs.readFile("./passport.config.js", 'utf8', (err, e) => {
      if(err) {
        cb(err, null);
      } else {
        const avg = eval(e);
        if(avg.advanced_guard) {
          let avgKey = (avg.advanced_guard.secret || "#sY7f~pQ2g1")
          cb(null, avgKey, md5(avgKey));
        } else {
          let avgKey = "?e1Av$lnSw#";
          cb(null, avgKey, md5(avgKey));
        }
      }
    });
  }
}

function avgDeHashIt(txtHashed, cb) {
  try {
    getAVGKey((err, advanced_key) => {
      if(err) {
        cb(err, null);
      } else {
        const reb64 = CryptoJS.enc.Hex.parse(txtHashed);
        const bytes = reb64.toString(CryptoJS.enc.Base64);
        const decrypt = CryptoJS.AES.decrypt(bytes, md5(advanced_key));
        cb(null, decrypt.toString(CryptoJS.enc.Utf8));
      }
    });
  } catch (error) {
    cb(error, null);
  }
}

module.exports = { Rand, HashIt, DeHashIt, X:secret, M:md5, Z:getAppKey, avgDeHashIt, avgZ:getAVGKey };
