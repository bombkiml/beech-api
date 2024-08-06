const md5 = require("md5");
const secret = require("./salt").salt;
const { findPassportPk } = require("../../cli/core/helpers/poolEntity");

async function FindOne(fields, fieldCondArr, cb) {
  try {
    const passport_config = require(appRoot + "/passport.config.js");
    let stm = '';
    let cond = '1';
    let passportTable = await [passport_config.model.table || "users"];
    const pool = await eval("sql." + passport_config.model.name);
    let expectFields = await (fields[0]) ? fields : (passport_config.model.fields.length) ? passport_config.model.fields : [];
    await findPassportPk(pool_base, pool, passportTable, expectFields, async (err, passportFields) => {
      if(err) {
        cb(err, null);
      } else {
        // Generate condition
        await Object.keys(fieldCondArr).forEach(key => {
          cond += ` AND ${key} = '${fieldCondArr[key]}'`;
        });
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
            delete error.sql;
            return cb(error, null);
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

async function Store(fields, cb) {
  try {
    const passport_config = require(appRoot + "/passport.config.js");
    let stm = '';
    let keys = [];
    let escaped = [];
    let values = await [passport_config.model.table || "users"];
    let usernameField = await String(passport_config.model.username_field || "username");
    let passwordField = await String(passport_config.model.password_field || "password");
    const pool = await eval("sql." + passport_config.model.name);
    // declare for check have a username and password ?
    let haveUsernameAndPassword = 0;
    // sql generate
    await Object.keys(fields).forEach(key => {
      // check have a username and password fields
      if(key == usernameField) {
        haveUsernameAndPassword += 1;
      }
      if(key == passwordField) {
        haveUsernameAndPassword += 1;
        // asign pwd hash
        fields[passwordField] = md5(fields[passwordField] + secret);
      }
      keys.push(key);
      values.push(fields[key]);
      escaped.push('?');
    });
    if(haveUsernameAndPassword > 1) {
      // check base pool
      if (pool_base == "basic") {
        // pool base is MySQL
        stm += 'INSERT INTO ?? (' + keys.join() + ') VALUES (' + escaped.join() + ')';
        await pool.query(stm, values, (err, result) => {
          if(err) {
            let error = JSON.parse(JSON.stringify(err));
            delete error.sql;
            cb(error, null);
          } else {
            cb(null, {
              insertId: result.insertId,
              affectedRows: result.affectedRows,
            });
          }
        });
      } else if (pool_base == "sequelize") {
        // pool base is Sequelize
        try {
          stm += `INSERT INTO ${values.shift()} (` + keys.join() + ') VALUES (' + escaped.join() + ')';
          let result = await pool.query(stm, {
            replacements: values,
            type: QueryTypes.INSERT
          });
          return cb(null, {
            insertId: result[0],
            affectedRows: result[1]
          });
        } catch (error) {
          if(error.sql) {
            return cb(error, null);
          } else {
            return cb(String(error), null);
          }
        }
      } else {
        return cb({ error: "The Base pool error. UNKNOWN pool_base = '"+ pool_base +"'" }, null);
      }
    } else {
      cb({ code: "ER_BAD_FIELD_ERROR", message: `You lost some fields ${usernameField} or ${passwordField} ?` }, null);
    }
  } catch (error) {
    cb(`${error}`, null);
  }
}

async function Update(someFields, id, cb) {
  try {
    const passport_config = require(appRoot + "/passport.config.js");
    let stm = '';
    let keys = [];
    let values = await [passport_config.model.table || "users"];
    let passwordField = await String(passport_config.model.password_field || "password");
    const pool = await eval("sql." + passport_config.model.name);
    // check password body for asign hash
    if (someFields[passwordField]) {
      someFields[passwordField] = md5(someFields[passwordField] + secret);
    }
    // sql generate
    Object.keys(someFields).forEach(key => {
      keys.push(`${key}=?`);
      values.push(someFields[key]);
    });
    values.push(id);
    // check base pool
    if (pool_base == "basic") {
      // pool base is MySQL
      pool.query("SHOW KEYS FROM " + values[0] + " WHERE Key_name = 'PRIMARY'", (err, pk) => {
        if(err) {
          return done(err, null);
        } else {
          let fieldPk = pk[0].Column_name;
          stm += 'UPDATE ?? SET ' + keys.join() + ' WHERE ' + fieldPk + ' = ?';
          pool.query(stm, values, (err, result) => {
            if(err) {
              let error = JSON.parse(JSON.stringify(err));
              delete error.sql;
              cb(error, null);
            } else {
              cb(null, {
                updateId: (result.changedRows) ? parseInt(id) : null,
                affectedRows: result.changedRows
              });
            }
          });
        }
      });
    } else if (pool_base == "sequelize") {
      // pool base is Sequelize
      try {
        pool.query("SHOW KEYS FROM " + values[0] + " WHERE Key_name = 'PRIMARY'", { type: QueryTypes.SELECT }).then((pk) => {
          let fieldPk = pk[0].Column_name;
          stm += `UPDATE ${values.shift()} SET ` + keys.join() + ' WHERE ' + fieldPk + ' = ?';
          pool.query(stm, {
            replacements: values,
            type: QueryTypes.UPDATE
          }).then((result) => {
            return cb(null, {
              updateId: (result[1]) ? parseInt(id) : null,
              affectedRows: result[1],
            });
          }).catch((err) => {
            if(err.sql) {
              delete err.sql;
              return cb(err, null);
            } else {
              return cb(String(err), null);
            }
          });
        }).catch((err) => {
          if(err.sql) {
            delete err.sql;
            return cb(err, null);
          } else {
            return cb(String(err), null);
          }
        });
      } catch (error) {
        return cb(error, null);
      }
    } else {
      return cb({ error: "The Base pool error. UNKNOWN pool_base = '"+ pool_base +"'" }, null);
    }
  } catch (error) {
    cb(error, null);
  }
}

module.exports = { Store, Update, FindOne };