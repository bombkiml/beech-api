const appRoot = require("app-root-path");
const passport_config = require(appRoot + "/passport.config.js");
const md5 = require("md5");
const secret = require("./salt").salt;

module.exports = {
  async findOne(fields, fieldCondArr, cb) {
    try {
      let stm = '';
      let cond = '1';
      let table = await [passport_config.model.table || "users"];
      let passportFields = await (fields[0]) ? fields : (passport_config.model.fields.length) ? passport_config.model.fields : ["id", "name", "email"];
      const pool = await eval("sql." + passport_config.model.name);
      // Generate condition
      await Object.keys(fieldCondArr).forEach(key => {
        cond += ' AND ' + key + '=' + fieldCondArr[key]
      });
      // check base pool
      if (pool_base == "basic") {
        // pool base is MySQL
        stm += 'SELECT ?? FROM ?? WHERE ' + cond;
        await pool.query(stm, [passportFields, table], (err, row) => {
          cb(err, row);
        });
      } else if (pool_base == "sequelize") {
        // pool base is Sequelize
        try {
          stm += `SELECT ${passportFields} FROM ${table} WHERE ` + cond;
          let result = await pool.query(stm, {
            type: QueryTypes.SELECT
          });
          return cb(null, result);
        } catch (error) {
          return cb(error, null);
        }
      } else {
        return cb({ error: "Base pool SQL error." }, null);
      }
    } catch (error) {
      cb(error, null);
    }
  },
  async store(fields, cb) {
    try {
      let stm = '';
      let keys = [];
      let escaped = [];
      let values = await [passport_config.model.table || "users"];
      let passwordField = await String(passport_config.model.password_field || "password");
      const pool = await eval("sql." + passport_config.model.name);
      // asign password hash
      fields[passwordField] = md5(fields[passwordField] + secret);
      // sql generate
      await Object.keys(fields).forEach(key => {
        keys.push(key);
        values.push(fields[key]);
        escaped.push('?');
      });
      // check base pool
      if (pool_base == "basic") {
        // pool base is MySQL
        stm += 'INSERT INTO ?? (' + keys.join() + ') VALUES (' + escaped.join() + ')';
        await pool.query(stm, values, (err, result) => {
          cb(err, result);
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
          return cb(error, null);
        }
      } else {
        return cb({ error: "Base pool SQL error." }, null);
      }
    } catch (error) {
      cb(error, null);
    }
  },
  async update(someFields, id, cb) {
    try {
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
        stm += 'UPDATE ?? SET ' + keys.join() + ' WHERE id = ?';
        await pool.query(stm, values, (err, result) => {
          cb(err, result);
        });
      } else if (pool_base == "sequelize") {
        // pool base is Sequelize
        try {
          stm += `UPDATE ${values.shift()} SET ` + keys.join() + ' WHERE id = ?';
          console.log(stm, values);
          let result = await pool.query(stm, {
            replacements: values,
            type: QueryTypes.UPDATE
          });
          return cb(null, {
            updateId: parseInt(id),
            affectedRows: result[1]
          });
        } catch (error) {
          return cb(error, null);
        }
      } else {
        return cb({ error: "Base pool SQL error." }, null);
      }

    } catch (error) {
      cb(error, null);
    }
  },
}