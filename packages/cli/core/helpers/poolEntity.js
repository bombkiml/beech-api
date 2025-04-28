async function findPassportPk(pool_base, pool, passportTable, passportConfigField, cb) {
  try {
    let finalPassportField = [];
    // Push and Replace it
    const pushOrReplace = (arr, value) => {
      arr = arr.filter(v => !value.includes(v));
      arr = [...value, ...arr];
      return arr;
    }
    // Check pool engine
    if(pool_base == "basic") {
      // pool base is Basic
      pool.query("SHOW KEYS FROM " + passportTable + " WHERE Key_name = 'PRIMARY'", (err, pk) => {
        if(err) {
          throw "Authentication table: " + err;
        } else {
          if(passportConfigField.length) {
            finalPassportField = pushOrReplace(passportConfigField, [pk[0].Column_name]);
            cb(null, finalPassportField);
          } else {
            cb(null, [pk[0].Column_name]);
          }
        }
      });
    } else if (pool_base == "sequelize") {
      // pool base is Sequelize
      // Find table primaryKey
      try {
        const tableInfo = await pool.getQueryInterface().describeTable(String(passportTable));
        const primaryKeys = Object.entries(tableInfo).filter(([columnName, columnInfo]) => columnInfo.primaryKey).map(([columnName]) => columnName);
        if(primaryKeys.length) {
          if(passportConfigField.length) {
            finalPassportField = pushOrReplace(passportConfigField, primaryKeys);
            cb(null, finalPassportField);
          } else {
            cb(null, primaryKeys);
          }
        } else {
          if(passportConfigField.length) {
            finalPassportField = pushOrReplace(passportConfigField, [Object.keys(tableInfo)[0]]);
            cb(null, finalPassportField);
          } else {
            cb(null, [Object.keys(tableInfo)[0]]);
          }
        }
      } catch (error) {
        throw `Query Interface ${error}`;
      }
    } else {
      throw "The Base pool error. UNKNOWN pool_base = '"+ pool_base +"'";
    }
  } catch (error) {
    cb(error, null);
  }
}

async function checkAuthFields(pool_base, pool, passportTable, passportConfigField, cb) {
  try {
    if(passportConfigField.length) {
      if(pool_base == "basic") {
        // pool base is Basic
        pool.query("SELECT "+ passportConfigField.join(",") +" FROM " + passportTable + " LIMIT 1", (err, result) => {
          if(err) {
            cb(`Authentication table: '${passportTable}' ${err}`, null);
          } else {
            cb(null, [result]);
          }
        });
      } else if (pool_base == "sequelize") {
        // pool base is Sequelize
        // Check assing fields exists
        const checkColumnsExist = async (tableName, fields = []) => {
          const queryInterface = pool.getQueryInterface();
          try {
            const tableDescription = await queryInterface.describeTable(tableName);
            const result = {};
            for (const column of fields) {
              result[column] = tableDescription.hasOwnProperty(column);
            }
            return result;
          } catch (error) {
            throw `Query Interface ${error}`;
          }
        }
        const openFields = await checkColumnsExist(passportTable, passportConfigField);
        const assignFieldsIsWhitelist = Object.values(openFields).includes(false) ? false : true;
        if(assignFieldsIsWhitelist) {
          cb(null, openFields);
        } else {
          cb(`Authentication table fields error: '${passportTable}' => [${passportConfigField}]`, null);
        }
      } else {
        cb("The Base pool error. UNKNOWN pool_base = '"+ pool_base +"'", null);
      }
    } else {
      cb(null, []);
    }
  } catch (error) {
    cb(error, null);
  }
}

module.exports = { findPassportPk, checkAuthFields };
