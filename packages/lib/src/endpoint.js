const walk = require("walk");
const fs = require("fs");

function walkModel(cb) {
  try {
    let jsfiles = [];
    let walker = walk.walk(appRoot + "/src/models", { followLinks: false });
    // Walk file on push
    walker.on("file", (root, stat, next) => {
      jsfiles.push(root + "/" + stat.name);
      next();
    });
    // Walking
    walker.on("end", () => {
      let preProject = [];
      if(jsfiles.length) {
        jsfiles.forEach((file, k) => {
          let schemaPath = "@/models" + file.split("models")[1].replace(/\\/g, "/");
          let endpoint = file
            .split("models")[1]
            .replace(/\\/g, "/")
            .replace(/_/g, "-")
            .toLowerCase()
            .slice(0, -3);
          preProject.push([schemaPath, endpoint]);
          if (jsfiles.length == k + 1) {
            cb(null, preProject);
          }
        });
      } else {
        // model not found.
        cb(null, preProject);
      }
    });
  } catch (error) {
    cb(error, null);
  }
}

function filterProject(Projects, reqUrl, params = "", method = "", req, res, cb) {
  try {
    let pj = Projects.shift();
    let leaveParamsAlone = params.slice(0);
    let paramsItem = leaveParamsAlone.replace(/^\/|\/$/g, "").split('/');
    let leaveReqUrlAlone = reqUrl.slice(0);
    let newParams = params.split("/").filter((e) => (e !== 'undefined')).join("/");
    let urlWithoutParams = leaveReqUrlAlone.replace(newParams, '').split("?")[0].replace(/\/$/, "");
    // sub-way for PATCH method
    urlWithoutParams = (method == "PATCH" || method == "DELETE") ? urlWithoutParams.substring(0, urlWithoutParams.lastIndexOf('/')) : urlWithoutParams;
    // check match project by url
    if(pj[1] == urlWithoutParams) {
      return checkOffset(Object.values(require(pj[0]))[0], req, res, (thenChecked) => {
        if(thenChecked) {
          return cb(null, Object.values(require(pj[0]))[0], paramsItem);
        }
      });
    }
    // Finally recursive filterProject function
    if (Projects.length > 0) {
      filterProject(Projects, reqUrl, params, method, req, res, cb);
    } else {
      // not match
      return notfound(res);
    }
  } catch (error) {
    cb(error, null, []);
  }
}

function checkOffset(Project, req, res, cb) {
  if (!Project) {
    return notfound(res);
  }
  // check offset is Ingeter as well as Zero number
  let offset = req.params.offset || undefined;
  let limit = req.params.limit || undefined;
  let offsetRegxMatch = (offset !== undefined) ? offset.match(/^[0-9]+$/) : undefined;
  let limitRegxMatch = (limit !== undefined) ? limit.match(/^[0-9]+$/) : undefined;
  if (offsetRegxMatch && limitRegxMatch) {
    cb(true);
  } else {
    if(offset === undefined) {
      cb(true);
    } else {
      return notfound(res);
    }
  }
}

function notfound(res) {
  return res.status(404).json({
    code: 404,
    status: "404_NOT_FOUND",
    message: "The Endpoint not found!.",
  });
}

function errMessage(err, res) {
  let errTurnOffDbDefine = JSON.stringify(err.toString()).match(/'define'/);
  let errTurnOffDbOption = JSON.stringify(err.toString()).match(/'options'/);
  if(errTurnOffDbDefine || errTurnOffDbOption) {
    // @return
    return res.status(500).json({
      code: 500,
      status: "ERR_INTERNAL_SERVER",
      message: "Database connection name is CLOSED.",
    });
  } else {
    // @return
    return res.status(500).json({
      code: 500,
      status: "ERR_INTERNAL_SERVER",
      message: err.toString(),
    });
  }
}

function whereCond(objectCond, cb) {
  if(typeof objectCond === 'object' && Object.keys(objectCond).length) {
    let keys = Object.keys(objectCond);
    let where = {};
    keys.map(async (k, index) => {
      let valueItem = await (typeof objectCond[k] === 'object')
                            ? [] // Set NULL [] for Duplicate fields in condition
                            : objectCond[k].replace(/[\[\]|\s']+/g, '').split(',');
      let onlyValueItem = await valueItem.slice(0);
      await onlyValueItem.shift();
      where[k] = await (valueItem[1])
                  ? {
                      [Op[valueItem[0]]]: (valueItem[1] == 'null')
                                          ? null  : (valueItem[1] == 'true')
                                          ? true  : (valueItem[1] == 'false')
                                          ? false : (valueItem[0] == 'between' || valueItem[0] == 'notBetween')
                                          ? [valueItem[1],valueItem[2]] :
                                            (
                                              valueItem[0] == 'or'
                                              || valueItem[0] == 'in'
                                              || valueItem[0] == 'notIn'
                                            )
                                          ? onlyValueItem : valueItem[1]
                    }
                  : valueItem[0]
      if(keys.length == index+1) {
        cb(where);
      }
    });
  } else {
    cb({});
  }
}

async function findAll(Project, where, offset, limitRow, cb) {
  try {
    const results = await Project.findAll({
      where,
      offset: offset,
      limit: limitRow,
    });
    await cb(null, results)
  } catch (error) {
    cb(error, null);
  }
}

function Base() {
  return new Promise((resolve, reject) => {
    try {
      walkModel((err, Projects) => {
        if (err) {
          reject(err);
        } else {
          const checkPassport = new Promise((resolve) => {
            const passport_config_file = appRoot + "/passport.config.js";
            let passport_config_auth = undefined;
            if (fs.existsSync(passport_config_file)) {
              const _passport_config_ = require(passport_config_file);
              resolve(_passport_config_.auth_endpoint || "/authentication");
            } else {
              // passport config not found
              resolve(passport_config_auth);
            }
          });
          // passport conifg promise
          checkPassport.then((authEndpoint) => {
            if(Projects.length) {
              // GET method
              endpoint.get("/:hash*/:id([a-zA-Z0-9-]+)?/:limit([0-9]+)?/:offset([0-9]+)?", Credentials, async (req, res, next) => {
                let params = req.params;
                let hash = "/" + req.params.hash;
                // allow official stetragy
                if(hash == authEndpoint && (params[0] == "/facebook" || params[0] == "/google")) {
                  return next();
                }
                // declare variable for check request with params
                let leaveMeAlone = await Projects.slice(0);
                let mergeThirdVar = [req.params.id, req.params.limit, req.params.offset].map((e) => (e || 'undefined')).join("/");
                let reqUrl = req.originalUrl.replace(_publicPath_, '/');
                let checkConditionIsQueryOrId = Object.keys(req.query).length
                                                  ? req.query
                                                  : (req.params.id)
                                                      ? String(req.params.id)
                                                      : 'undefined';
                /**
                 * Function whereCond with callback property
                 * 
                 * @where Object|String
                 * 
                 */
                whereCond(checkConditionIsQueryOrId, async (where) => {
                  /**
                   * Filter Project with callback property
                   * 
                   * @err String
                   * @Project Require
                   * @params Object [0=id|limit, 1=offset, 2=blind]
                   * 
                   */
                  await filterProject(leaveMeAlone, reqUrl, "/".concat(mergeThirdVar), "", req, res, async (err, Project, params) => {
                    if (!err) {
                      if(Project.options.defaultEndpoint === undefined || Project.options.defaultEndpoint === true) {
                        try {
                          // declare default limit offset
                          let offset = 0;
                          let limitRow = await (Project.options.limitRows) ? Project.options.limitRows : 100;
                          // check assign limit, offset ?
                          if ((params[0] && params[0]  != 'undefined') && ((params[1] && params[1] != 'undefined') || parseInt(params[1]) === 0) && (!params[2] || params[2] == 'undefined')) {
                            // Only case: /limit/offset/undefined
                            limitRow = parseInt(params[0]);
                            offset = parseInt(params[1]);
                          }
                          // check response condition from whereCond function is Object or String and params 1,2 is undefined
                          if(typeof checkConditionIsQueryOrId !== 'object' && checkConditionIsQueryOrId != 'undefined' && (params[1] == 'undefined' && params[2] == 'undefined')) {
                            const result = await Project.findByPk(checkConditionIsQueryOrId);
                            // @ return findByPk
                            await res.json({
                              code: 200,
                              status: "SUCCESS",
                              result: (result || {}),
                            });
                          // check params 0,1 is not undefined and params 2 is undefined
                          } else if (params[0] != 'undefined' && params[1] != 'undefined' && params[2] == 'undefined') {
                            // check id|limit is numeric
                            if(params[0].match(/^-?\d+$/)) {
                              await findAll(Project, where, offset, limitRow, (err, results) => {
                                if(err) {
                                  res.status(500).json({
                                    code: 500,
                                    status: "READ_CATCH_WITH_NUM",
                                    err: String(err),
                                  });
                                } else {
                                  // @ return findAll
                                  res.json({
                                    code: 200,
                                    status: "SUCCESS",
                                    results,
                                    length: results.length,
                                    limitRow,
                                  });
                                }
                              });
                            } else {
                              next();
                            }
                          // check all params is undefined
                          } else if (params[0] == 'undefined' && params[1] == 'undefined' && params[2] == 'undefined') {
                            await findAll(Project, where, offset, limitRow, (err, results) => {
                              if(err) {
                                res.status(500).json({
                                  code: 500,
                                  status: "READ_CATCH_WITH_ALL",
                                  err: String(err),
                                });
                              } else {
                                // @ return findAll
                                res.json({
                                  code: 200,
                                  status: "SUCCESS",
                                  results,
                                  length: results.length,
                                  limitRow,
                                });
                              }
                            });
                          // somethin else
                          } else {
                            next();
                          }
                        } catch (error) {
                          // @return
                          return errMessage(error, res);
                        }
                      } else {
                        next();
                      }
                    } else {
                      // @return
                      return errMessage(err, res);
                    }
                  });
                });
              });

              // POST method
              endpoint.post("/:hash*", async (req, res, next) => {
                // Check auth request match send next
                if(authEndpoint !== undefined) {
                  if(req.params.hash == authEndpoint.replace(/^\/|\/$/g, "")) {
                    return next();
                  }
                }
                // When lost IF
                let leaveMeAlone = await Projects.slice(0);
                let reqUrl = req.originalUrl.replace(_publicPath_, '/');
                await filterProject(leaveMeAlone, reqUrl, "", "", req, res, async (err, Project) => {
                  if (!err) {
                    if(Project.options.defaultEndpoint === undefined || Project.options.defaultEndpoint === true) {
                      try {
                        await Project.create(req.body).then((created) => {
                          // @return
                          res.status(201).json({
                            code: 201,
                            status: "CREATE_SUCCESS",
                            createdId: (created.id) ? created.id : created[Project.primaryKeyAttributes[0]],
                          });
                        }).catch((err) => {
                          // @return
                          res.status(501).json({
                            code: 501,
                            status: "CREATE_FAILED",
                            error: err,
                          });
                        });
                      } catch (error) {
                        // @return
                        return errMessage(error, res);
                      }
                    } else {
                      next();
                    }
                  } else {
                    // @return
                    return errMessage(err, res);
                  }
                });
              });

              // PATCH method
              endpoint.patch("/:hash*/:id([a-zA-Z0-9-]+)?", Credentials, async (req, res, next) => {
                let leaveMeAlone = await Projects.slice(0);
                let reqUrl = req.originalUrl.replace(_publicPath_, '/');
                await filterProject(leaveMeAlone, reqUrl, "", "PATCH", req, res, async (err, Project) => {
                  if (!err) {
                    if(Project.options.defaultEndpoint === undefined || Project.options.defaultEndpoint === true) {
                      try {
                        let updatePk = await { [Project.primaryKeyAttributes[0]]: req.params.id };
                        await Project.update(req.body, {
                          where: updatePk,
                        }).then((updated) => {
                          // @return
                          res.status(200).json({
                            code: 200,
                            status: "UPDATE_SUCCESS",
                            result: {
                              updateId: req.params.id,
                              affectedRows: updated[0],
                            },
                          });
                        }).catch((err) => {
                          // @return
                          res.status(501).json({
                            code: 501,
                            status: "UPDATE_FAILED",
                            error: err,
                          });
                        });
                      } catch (error) {
                        // @return
                        return errMessage(error, res);
                      }
                    } else {
                      next();
                    }
                  } else {
                    // @return
                    return errMessage(err, res);
                  }
                });
              });

              // DELETE method
              endpoint.delete("/:hash*/:id([a-zA-Z0-9-]+)?", Credentials, async (req, res, next) => {
                let leaveMeAlone = await Projects.slice(0);
                await filterProject(leaveMeAlone, req.originalUrl.replace(_publicPath_, '/'), "", "DELETE", req, res, async (err, Project) => {
                  if (!err) {
                    if(Project.options.defaultEndpoint === undefined || Project.options.defaultEndpoint === true) {
                      try {
                        let deletePk = await { [Project.primaryKeyAttributes[0]]: req.params.id };
                        await Project.destroy({
                          where: deletePk,
                        }).then((deleted) => {
                          if (deleted) {
                            // @return
                            res.status(200).json({
                              code: 200,
                              status: "DELETE_SUCCESS",
                              result: {
                                deleteId: req.params.id,
                                affectedRows: deleted,
                              },
                            });
                          } else {
                            res.status(406).json({
                              code: 406,
                              status: "NOT_ACCEPTABLE",
                              result: {
                                deleteId: req.params.id,
                                affectedRows: deleted,
                              },
                            });
                          }
                        }).catch((err) => {
                          // @return
                          res.status(501).json({
                            code: 501,
                            status: "DELETE_FAILED",
                            error: err,
                          });
                        });
                      } catch (error) {
                        // @return
                        return errMessage(error, res);
                      }
                    } else {
                      next();
                    }
                  } else {
                    // @return
                    return errMessage(err, res);
                  }
                });
              });
            }
            // resolve it.
            resolve(true);
          }).catch((err) => {
            reject(err);
          });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { Base };
