const appRoot = require("app-root-path");
const passport_config = require(appRoot + "/passport.config.js");
const md5 = require("md5");
const secret = require("./salt").salt;

module.exports = {
  store(fields, cb) {
    try {
      let keys = [];
      let values = [passport_config.model.table || "users"];
      let escaped = [];
      let passwordField = String(passport_config.model.password_field || "password");
      // asign password hash
      fields[passwordField] = md5(fields[passwordField] + secret);
      // sql generate
      Object.keys(fields).forEach(key => {
        keys.push(key);
        values.push(fields[key]);
        escaped.push('?');
      });
      let sql = 'INSERT INTO ?? (' + keys.join() + ') VALUES (' + escaped.join() + ')';
      const pool = eval("mysql." + passport_config.model.name);
      pool.query(sql, values, (err) => {
        if (err) {
          cb({ code: 500, status: "CREATE_FAILED", error: err });
        } else {
          cb({ code: 201, status: "created", message: "CREATE_SUCCESS" });
        }
      });

    } catch (error) {
      cb({ code: 500, err: error });
    }
  },
  update(someFields, id, cb) {
    try {
      let keys = [];
      let values = [passport_config.model.table || "users"];
      let passwordField = String(passport_config.model.password_field || "password");
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
      let sql = 'UPDATE ?? SET ' + keys.join() + ' WHERE id=?';
      const pool = eval("mysql." + passport_config.model.name);
      pool.query(sql, values, (err) => {
        if (err) {
          cb({ code: 500, status: "UPDATE_FAILED", error: err });
        } else {
          cb({ code: 200, status: "updated", message: "UPDATE_SUCCESS" });
        }
      });
    } catch (error) {
      cb({ code: 500, err: error });
    }
  },
}