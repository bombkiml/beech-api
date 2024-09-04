const fs = require("fs");
const passport_config_file = "/passport.config.js";
const { avgDeHashIt } = require(__dirname + "/../../../helpers/math");
const moment = require("moment");

function avg(req, res, next) {
  // check passport file ?
  const checkPassport = new Promise((resolve) => {
    if (fs.existsSync(appRoot + "/passport.config.js")) {
      resolve([true, require(appRoot + passport_config_file)]);
    } else {
      resolve([false, null]);
    }
  });
  // promise all
  Promise.all([checkPassport]).then((final) => {
    let item = final[0];
    let passport_config = item[1];
    /**
     * item[0] : Boolean = passport file found.
     * item[1] : Object  = passport object.
     */
    if(item[0]) {
      if ((passport_config.model.guard.advanced_guard) ? passport_config.model.guard.advanced_guard.allow : false) {
        let advanced_guard_entity = req.headers[passport_config.model.guard.advanced_guard.entity || "timing"];
        if (advanced_guard_entity) {
          if(advanced_guard_entity.length > 60) {
            //logic check advanced guard
            avgDeHashIt(advanced_guard_entity, (err, unixTime) => {
              if (err) {
                res.status(502).json({ code: 502, status: "BAD_GATEWAY", message: String(err) });
                return;
              }
              // prepare date & check it.
              let unixTimeNow = moment(new Date()).unix();
              let unixTiming = moment(new Date(unixTime * 1000)).add((passport_config.model.guard.advanced_guard.time_expired.minutes || 0), "minutes").add((passport_config.model.guard.advanced_guard.time_expired.seconds || 0), "seconds").unix();
              if((String(unixTimeNow).length == String(unixTiming).length) && unixTimeNow < unixTiming) {
                next();
              } else {
                res.status(408).json({ code: 408 , status: "REQUEST_TIMEOUT", message: "Request Timeout." });
              }
            });
          } else {
            res.status(400).json({
              code: 400,
              status: 'BAD_REQUEST',
              message: "Bad request.",
              info: {
                status: "BAD_VALUE",
                message: "Bad with wrong Advance guard."
              },
            });
          }
        } else {
          res.status(400).json({
            code: 400,
            status: 'BAD_REQUEST',
            message: "Bad request.",
            info: {
              status: "BAD_ENTITY",
              message: "Bad Advanced guard Entity."
            },
          });
        }
      } else {
        next();
      }
    } else {
      next();
    }
  });
}

module.exports = { avg };
