const fs = require("fs");
const { FindOne } = require("../../../lib/src/user");
const { findPassportPk } = require("./poolEntity");
const passport_config_file = appRoot + "/passport.config.js";
const md5 = require("md5");
const secret = require("../../../lib/src/salt").salt;

function TwoFactor(user, reqBody, guard_field, cb) {
  try {
    findFkInFields((err, userId) => {
      if(err) {
        cb(true, err);
      } else {
        if(userId.length) {
          if (fs.existsSync(passport_config_file)) {
            passport_config = require(passport_config_file);
          } else {
            cb(true, {
              code: 500,
              status: "INTERNAL_SERVER_ERR",
              error: {
                code: 404,
                status: "ERROR_FILE_NOT_EXISTS",
                message: "The file passport.config.js not exists!",
              }
            });
            return;
          }
          let usrField = passport_config.model.username_field || "username";
          let pwdField = passport_config.model.password_field || "password"
          // filter without base user, pass
          let without_base = Object.keys(reqBody).map((k) => {
            return guard_field.filter((e) => e == k)[0];
          });
          // filter without undefined
          let x = without_base.filter((x) => {
            return x !== undefined;
          });
          // check length match ?
          if(x.length == guard_field.length) {
            let z = {};
            z[usrField] = reqBody[usrField];
            z[pwdField] = md5(reqBody[pwdField] + secret);
            x.map((guard) => {
              z[guard] = reqBody[guard];
            });
            // FindUser
            FindOne([], z, (err, result) => {
              if(err) {
                cb(true, { code: 500, status: "INTERNAL_SERVER_ERR", error: err });
              } else {
                if(result.length) {
                  cb(null, result);
                } else {
                  cb(null, []);
                }
              }
            });
          } else {
            cb(true, {
              code: 400,
              status: 'BAD_REQUEST',
              message: "Bad request.",
              info: {
                status: "BAD_ENTITY",
                message: "Bad guard Entity."
              },
            });
          }
        } else {
          // Can't find Auth Open ID
          cb(true, {
            code: 400,
            status: 'BAD_REQUEST',
            message: "Bad request.",
            info: {
              status: "BAD_ENTIRY",
              message: "Unprocessable with Auth Open ID Entity.",
            },
          });
        }
      }
    });
  } catch (error) {
    cb(error, null);
  }
}

async function findFkInFields(cb) {
  try {
    const passport_config = require(appRoot + "/passport.config.js");
    const pool = await eval("sql." + passport_config.model.name);
    let passportTable = await [passport_config.model.table || "users"];
    await findPassportPk(pool_base, pool, passportTable, [], async (err, pk) => {
      if(err) {
        cb(err, null);
      } else {
        cb(null, pk);
      }
    });
  } catch (error) {
    cb(error, null);
  }
}

module.exports = { TwoFactor }
