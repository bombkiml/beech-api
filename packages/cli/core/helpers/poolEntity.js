function findPassportPk(pool_base, pool, passportTable, passportConfigField, cb) {
  try {
    if(passportConfigField.length) {
      cb(null, passportConfigField);
    } else {
      if(pool_base == "basic") {
        // pool base is Basic
        pool.query("SHOW KEYS FROM " + passportTable + " WHERE Key_name = 'PRIMARY'", (err, pk) => {
          if(err) {
            throw "Authentication table: " + err;
          } else {
            cb(null, [pk[0].Column_name]);
          }
        });
      } else if (pool_base == "sequelize") {
        // pool base is Sequelize
        pool.query("SHOW KEYS FROM " + passportTable + " WHERE Key_name = 'PRIMARY'", { type: QueryTypes.SELECT }).then((pk) => {
          cb(null, [pk[0].Column_name]);
        }).catch((err) => {
          throw "Authentication table: " + err;
        });
      } else {
        throw "The Base pool error. UNKNOWN pool_base = '"+ pool_base +"'";
      }
    }
  } catch (error) {
    cb(error, null);
  }
}

module.exports = { findPassportPk }
