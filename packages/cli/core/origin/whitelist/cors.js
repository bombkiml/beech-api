const fs = require("fs");
const appRoot = require("app-root-path");
function whitelist(cb) {
  var whitelists = [];
  const getWhitelists = new Promise((resolve) => {
    if (fs.existsSync(appRoot + "/beech.config.js")) {
      fs.readFile(appRoot + "/beech.config.js", "utf8", (err, e) => {
        if (!err) {
          let defineConfig = eval(e).defineConfig;
          let origin = defineConfig.server.origin;
          let originSensitive = defineConfig.server.originSensitive;
          let allAllow = origin.filter((allow) => {
            return allow == "*";
          });
          if (allAllow.length) {
            resolve([whitelists, originSensitive]);
          } else {
            resolve([origin, originSensitive]);
          }
        } else {
          // error resolve default whitelist
          resolve([whitelists, originSensitive]);
        }
      });
    } else {
      resolve([whitelists, originSensitive]);
    }
  });
  // promise all
  Promise.all([getWhitelists]).then((final) => {
    cb(final[0][0], final[0][1]);
  });
}

function sign(req, res, whitelist, originSensitive, cb) {
  try {
    const origin = req.headers.origin;
    let doYouSignSomeOrigin = false;
    //var host = req.get("host");
    console.log("Request from origin:", origin || "localhost");

    if (whitelist.length > 0) {
      whitelist.forEach((val, k) => {
        if (origin) {
          if (origin.indexOf(val) > -1) {
            doYouSignSomeOrigin = true;
            if (originSensitive) {
              res.setHeader("Access-Control-Allow-Origin", val);
            } else {
              res.setHeader("Access-Control-Allow-Origin", origin);
            }
          }
        }
        if (whitelist.length == k + 1) {
          if (!doYouSignSomeOrigin) {
            res.setHeader(
              "Access-Control-Allow-Origin",
              "http://localhost:" + _config_.main_config.app_port
            );
          }
        }
      });
    } else {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    // Request methods you wish to allow
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    // Request headers you wish to allow
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Origin",
      "application/json; charset=utf-8"
    );
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);
    // callback
    cb(null);
  } catch (error) {
    cb(error);
  }
}

module.exports = { whitelist, sign };
