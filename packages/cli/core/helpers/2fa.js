const { FindOne } = require("../../../lib/src/user");
const { findPassportPk } = require("./poolEntity");

function TwoFactor(user, reqBody, guard_field, cb) {
  try {
    findFkInFields((err, userId) => {
      if(err) {
        cb(true, err);
      } else {
        if(userId.length) {
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
            z[userId[0]] = user.id;
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
