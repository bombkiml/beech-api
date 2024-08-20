const { Transaction } = require("sequelize");
let isolationLevel = { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE };
function Schema(Sequelize) {
  return {
    define: (table, schemaProps = {}) => {
      try {
        let Project = Sequelize.define(table, schemaProps);
        return Object.assign(Project, {
          query: (
            rawSql,
            props = {
              model: Project,
              mapToModel: false,
            }
          ) => {
            return new Promise((resolve) => {
              if (props.mapToModel) {
                let data = Sequelize.query(rawSql, props);
                let results = [];
                mapDataToModel(data, props.model, results, (err, r) => {
                  if (err) {
                    resolve([]);
                  } else {
                    resolve(r);
                  }
                });
              } else {
                resolve(Sequelize.query(rawSql, props));
              }
            });
          },
          Sequelize,
          /**
           * Transaction
           * 
           * @param object DEFAULT isolationLevel SERIALIZABLE
           * @param cb Object
           * 
           * @returns Object
           */
          transaction: async (object, cb = null) => {
            if(typeof object == "function") {
              const t = await Sequelize.transaction(isolationLevel);
              object(t);
            } else if(cb) {
              const t = await Sequelize.transaction(object = isolationLevel);
              cb(t);
            } else {
              return await Sequelize.transaction(object = isolationLevel);
            }
          },
        });
      } catch (error) {
        let errTurnOffDbDefine = JSON.stringify(error.toString()).match(/'define'/);
        let errTurnOffDbOption = JSON.stringify(error.toString()).match(/'options'/);
        if(errTurnOffDbDefine || errTurnOffDbOption) {
          console.log(`\n[101m Failed [0m Database connection name is CLOSED.\n`, error);
        } else {
          console.log("\n[101m Failed [0m", error);
        }
      }
    },
  };
}

mapDataToModel = async (data, modelsArr = [], results = [], cb) => {
  let dataArr = await data;
  var models = modelsArr.length ? modelsArr.slice() : modelsArr;
  let row = dataArr.shift();
  let buildModelData = [];
  recursiveBuildModels(models, row, buildModelData, (builed, e) => {
    if (builed) {
      results.push({ ...e });
      if (dataArr.length > 0) {
        mapDataToModel(dataArr, modelsArr, results, cb);
      } else {
        cb(null, results);
      }
    }
  });
};

recursiveBuildModels = (models, row, data = [], cb) => {
  let model = models.length ? models.shift() : models;
  data.push(model.build(row).dataValues);
  if (models.length > 0) {
    recursiveBuildModels(models, row, data, cb);
  } else {
    cb(true, { ...Object.assign(...data) });
  }
};

module.exports = { Schema };
