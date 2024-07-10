const appRoot = require("app-root-path");
const md5 = require("md5");
const secret = require("./salt").salt;
const { findPassportPk } = require("../../cli/core/helpers/poolEntity");

async function Guard(usr, pws, fields = [], fieldCondArr = {}, cb) {
  try {
    const passport_config = require(appRoot + "/passport.config.js");
    let stm = '';
    let cond = '1';
    let passportTable = await [passport_config.model.table || "users"];
    let passportUsernameField = passport_config.model.username_field || "username";
    let passportPasswordField = passport_config.model.password_field || "password";
    const pool = await eval("sql." + passport_config.model.name);
    let expectFields = await (fields) ? fields : (passport_config.model.fields.length) ? passport_config.model.fields : [];
    await findPassportPk(pool_base, pool, passportTable, expectFields, async (err, passportFields) => {
      if(err) {
        cb(err, null);
      } else {
        cond += ` AND ${passportUsernameField} = '${usr}' AND ${passportPasswordField} = '${md5(pws + secret)}'`
        // Check for generate more condition
        if(fieldCondArr) {
          await Object.keys(fieldCondArr).forEach(key => {
            cond += ` AND ${key} = '${fieldCondArr[key]}'`;
          });
        }
        // check base pool
        if (pool_base == "basic") {
          // pool base is MySQL
          stm += 'SELECT ?? FROM ?? WHERE ' + cond;
          await pool.query(stm, [passportFields, passportTable], (err, row) => {
            if(err) {
              cb(err, null);
            } else {
              cb(null, row);
            }
          });
        } else if (pool_base == "sequelize") {
          // pool base is Sequelize
          try {
            stm += `SELECT ${passportFields} FROM ${passportTable} WHERE ` + cond;
            let result = await pool.query(stm, {
              type: QueryTypes.SELECT
            });
            return cb(null, result);
          } catch (error) {
            return cb((error.errors) ? error.errors[0] : error, null);
          }
        } else {
          return cb({ error: "The Base pool error. UNKNOWN pool_base = '"+ pool_base +"'" }, null);
        }
      }
    });
  } catch (error) {
    cb(error, null);
  }
}

module.exports = { Guard };