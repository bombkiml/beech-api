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
        });
      } catch (error) {
        let errTurnOffDb = JSON.stringify(error.toString()).match(/'define'/);
        if(errTurnOffDb) {
          throw console.log(`\n[101m Failed [0m Database connection name is CLOSED. Checking ON/OFF inside app.conifg.js file.\n`, error);
        } else {
          throw console.log("\n[101m Failed [0m", error);
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
